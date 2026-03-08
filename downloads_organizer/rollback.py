"""
롤백 모듈 - 특정 세션의 파일 이동을 역방향으로 복구
"""
from pathlib import Path
from typing import Optional, Callable

from file_ops import move_file, get_unique_dest
from logger import OperationLogger


def _rollback_single_op(op, dry_run: bool) -> dict:
    """
    단일 operations 레코드를 역방향 이동 (dest → src.parent).
    반환: {op_id, file_name, src, dest, actual_src, status, reason}
    """
    dest = Path(op["dest"])
    src  = Path(op["src"])

    base = {
        "op_id":      op["op_id"],
        "file_name":  op["file_name"],
        "src":        src,
        "dest":       dest,
        "actual_src": None,
        "status":     None,
        "reason":     "",
    }

    # 케이스 a: 복구 대상 파일이 이미 없음 (수동 삭제/이동)
    if not dest.exists():
        return {**base, "status": "skipped", "reason": "파일이 이미 없음 (수동 삭제/이동)"}

    if dry_run:
        # src 경로에 다른 파일이 있을 경우 예상 경로 계산
        target = get_unique_dest(src) if src.exists() else src
        return {**base, "status": "dry_run", "actual_src": target}

    # 케이스 b: src 경로에 이미 다른 파일 있음 → 고유 경로 사용
    target_dir = src.parent
    target_name = src.name
    if src.exists():
        # 기존 get_unique_dest 로직: stem + "_restored_N" 형태
        stem   = src.stem
        suffix = src.suffix
        counter = 1
        while True:
            candidate = target_dir / f"{stem}_restored_{counter}{suffix}"
            if not candidate.exists():
                target_name = candidate.name
                break
            counter += 1

    success, actual_dest, err = move_file(dest, target_dir)

    if success:
        # move_file은 dest_dir/파일명 으로 이동하는데, 이름이 바뀐 경우 rename
        moved_path = actual_dest
        if moved_path.name != target_name:
            final_path = target_dir / target_name
            moved_path.rename(final_path)
            moved_path = final_path

        reason = "원본 경로에 동명 파일 존재 → 이름 변경 후 복구" if moved_path.name != src.name else ""
        return {**base, "status": "success", "actual_src": moved_path, "reason": reason}
    else:
        return {**base, "status": "failed", "reason": err}


def rollback_session(
    session_id: str,
    logger: OperationLogger,
    dry_run: bool = False,
    progress_cb: Optional[Callable[[dict], None]] = None,
) -> dict:
    """
    특정 세션의 성공한 파일 이동을 역방향으로 복구.

    반환:
      성공/부분: {session_id, session_meta, results, total, succeeded, failed, skipped, dry_run}
      에러(처리 전 중단): {session_id, error, results: []}
    """
    # ── 선행 검사 ──────────────────────────────────────────────

    session_meta = logger.get_session(session_id)
    if not session_meta:
        return {"session_id": session_id, "error": f"세션을 찾을 수 없습니다: {session_id}", "results": []}

    # 케이스 c: 이미 롤백된 세션
    if session_meta["rolled_back"]:
        return {"session_id": session_id, "error": "이미 롤백된 세션입니다.", "results": []}

    # 성공한 작업만 대상 (dest IS NOT NULL 조건도 충족)
    ops = [
        op for op in logger.get_operations(session_id, status_filter="success")
        if op["dest"] is not None
    ]

    if not ops:
        return {"session_id": session_id, "error": "롤백할 성공 작업이 없습니다.", "results": []}

    # ── 역방향 복구 ────────────────────────────────────────────

    results = []
    succeeded = failed = skipped = 0

    for op in ops:
        rec = _rollback_single_op(op, dry_run=dry_run)
        results.append(rec)

        if rec["status"] == "success":
            succeeded += 1
        elif rec["status"] == "failed":
            failed += 1
        else:  # skipped / dry_run
            skipped += 1

        if progress_cb:
            progress_cb(rec)

    # ── DB 업데이트 (dry_run 아닐 때만) ───────────────────────

    if not dry_run:
        for op, rec in zip(ops, results):
            rb_st = rec["status"] if rec["status"] in ("success", "failed", "skipped") else "skipped"
            logger.update_op_rb_status(op["op_id"], rb_st)
        # 일부만 성공해도 재시도 방지를 위해 rolled_back 처리
        logger.mark_session_rolled_back(session_id)

    return {
        "session_id":   session_id,
        "session_meta": session_meta,
        "results":      results,
        "total":        len(results),
        "succeeded":    succeeded,
        "failed":       failed,
        "skipped":      skipped,
        "dry_run":      dry_run,
        "error":        "",
    }


def get_last_rollbackable_session(logger: OperationLogger) -> Optional[str]:
    """
    가장 최근의 롤백 가능한 세션 ID 반환.
    (rolled_back=0 이고, 성공 작업이 1개 이상인 세션)
    """
    import sqlite3 as _sqlite3
    sessions = logger.get_sessions(limit=100)
    for s in sessions:
        if s["rolled_back"]:
            continue
        ops = logger.get_operations(s["session_id"], status_filter="success")
        if any(op["dest"] is not None for op in ops):
            return s["session_id"]
    return None
