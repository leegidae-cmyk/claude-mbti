#!/usr/bin/env python3
"""
downloads-organizer - 다운로드 폴더 자동 정리 CLI 도구

사용법:
  python main.py classify          # 현재 파일 카테고리별 분류
  python main.py archive           # 90일 이상 된 파일 아카이브
  python main.py watch             # 실시간 감시 모드 시작
  python main.py status            # 폴더 현황 조회
  python main.py all               # 아카이브 후 분류 일괄 실행
  python main.py history           # 작업 이력 조회
  python main.py rollback --last   # 마지막 세션 복구
"""

import sys
import time
import signal
from pathlib import Path

# ─── 의존성 자동 설치 ─────────────────────────────────────────────────────────

def _auto_install():
    import importlib.util, subprocess
    required = {
        "rich":     "rich",
        "watchdog": "watchdog",
    }
    missing = [pkg for mod, pkg in required.items() if not importlib.util.find_spec(mod)]
    if missing:
        print(f"[설치 중] 필요한 패키지를 설치합니다: {', '.join(missing)}")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--quiet", *missing]
        )
        print("[완료] 패키지 설치가 완료되었습니다.\n")

_auto_install()

# Windows UTF-8 출력 설정
import os
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

# ─── 이후 임포트 (설치 완료 후) ───────────────────────────────────────────────

import argparse
from rich.console import Console

import reporter as rep
from config import DOWNLOADS_DIR, ARCHIVE_DAYS
from classifier import classify_files
from archiver import archive_old_files
from watcher import start_watching
from logger import make_logger
from rollback import rollback_session, get_last_rollbackable_session

console = Console(legacy_windows=False)


# ─── 커맨드 핸들러 ────────────────────────────────────────────────────────────

def cmd_classify(args):
    downloads_dir = Path(args.dir)
    rep.print_header("파일 분류")
    rep.print_info(f"대상 폴더: {downloads_dir}")
    if args.dry_run:
        rep.print_warn("--dry-run 모드: 실제 이동 없이 미리 보기만 합니다.")

    logger = make_logger()
    session_id = logger.start_session("classify", downloads_dir)
    if not args.dry_run:
        rep.print_info(f"세션 ID: {session_id}")

    with rep.make_progress() as progress:
        task = progress.add_task("파일 분석 중...", total=None)
        results = []

        def on_file(record):
            progress.update(task, description=f"처리 중: {record['file'][:40]}")
            results.append(record)
            logger.log_operation(session_id, record, op_type="classify")

        classify_files(downloads_dir, dry_run=args.dry_run, progress_cb=on_file)

    logger.end_session(session_id)
    rep.print_classify_results(results, downloads_dir)


def cmd_archive(args):
    downloads_dir = Path(args.dir)
    days = args.days
    rep.print_header(f"아카이브 ({days}일 이상)")
    rep.print_info(f"대상 폴더: {downloads_dir}")
    if args.dry_run:
        rep.print_warn("--dry-run 모드: 실제 이동 없이 미리 보기만 합니다.")

    logger = make_logger()
    session_id = logger.start_session("archive", downloads_dir)
    if not args.dry_run:
        rep.print_info(f"세션 ID: {session_id}")

    with rep.make_progress() as progress:
        task = progress.add_task("파일 분석 중...", total=None)
        results = []

        def on_file(record):
            progress.update(task, description=f"처리 중: {record['file'][:40]}")
            results.append(record)
            logger.log_operation(session_id, record, op_type="archive")

        archive_old_files(downloads_dir, days=days, dry_run=args.dry_run, progress_cb=on_file)

    logger.end_session(session_id)
    rep.print_archive_results(results, downloads_dir)


def cmd_all(args):
    rep.print_header("일괄 처리 (아카이브 → 분류)")
    cmd_archive(args)
    console.print()
    cmd_classify(args)


def cmd_watch(args):
    downloads_dir = Path(args.dir)
    rep.print_header("실시간 감시 모드")
    rep.print_info(f"대상 폴더: {downloads_dir}")
    rep.print_info("새 파일이 감지되면 자동으로 분류합니다. 종료: Ctrl+C\n")

    logger = make_logger()
    session_id = logger.start_session("watch", downloads_dir)
    rep.print_info(f"세션 ID: {session_id}\n")

    def on_event_with_log(record):
        rep.print_watch_event(record)
        logger.log_operation(session_id, record, op_type="watch")

    observer = start_watching(downloads_dir, on_event=on_event_with_log)

    def _shutdown(sig, frame):
        rep.print_info("\n감시를 종료합니다...")
        observer.stop()
        logger.end_session(session_id)

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    try:
        while observer.is_alive():
            time.sleep(1)
    finally:
        observer.join()
        rep.print_info("감시가 종료되었습니다.")


def cmd_status(args):
    downloads_dir = Path(args.dir)
    rep.print_header("폴더 현황")
    rep.print_status(downloads_dir)


def cmd_history(args):
    rep.print_header("작업 이력")
    logger = make_logger()

    if args.session:
        session_meta = logger.get_session(args.session)
        if not session_meta:
            rep.print_error(f"세션을 찾을 수 없습니다: {args.session}")
            sys.exit(1)
        ops = logger.get_operations(args.session)
        rep.print_history_detail(session_meta, ops, Path(session_meta["downloads_dir"]))
    else:
        sessions = logger.get_sessions(limit=args.limit)
        rep.print_history_sessions(sessions, args.limit)


def cmd_rollback(args):
    rep.print_header("파일 이동 복구")
    logger = make_logger()

    if args.last:
        session_id = get_last_rollbackable_session(logger)
        if not session_id:
            rep.print_error("롤백 가능한 세션이 없습니다.")
            sys.exit(1)
        rep.print_info(f"대상 세션: {session_id}")
    elif args.session:
        session_id = args.session
    else:
        rep.print_error("--session 또는 --last 중 하나를 지정하세요.")
        sys.exit(1)

    if args.dry_run:
        rep.print_warn("--dry-run 모드: 실제 복구 없이 미리 보기만 합니다.")

    result = rollback_session(session_id, logger, dry_run=args.dry_run)

    if result.get("error"):
        rep.print_error(result["error"])
        sys.exit(1)

    downloads_dir = Path(result["session_meta"]["downloads_dir"])
    rep.print_rollback_results(result, downloads_dir)


# ─── CLI 파서 ─────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="downloads-organizer",
        description="다운로드 폴더 자동 정리 도구",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--dir",
        default=str(DOWNLOADS_DIR),
        metavar="PATH",
        help=f"대상 다운로드 폴더 경로 (기본값: {DOWNLOADS_DIR})",
    )

    sub = parser.add_subparsers(dest="command", metavar="<명령>")

    # classify
    p_cls = sub.add_parser("classify", help="확장자 기반 파일 분류")
    p_cls.add_argument("--dry-run", action="store_true", help="미리 보기 (이동 없음)")
    p_cls.set_defaults(func=cmd_classify)

    # archive
    p_arc = sub.add_parser("archive", help="오래된 파일 아카이브")
    p_arc.add_argument(
        "--days", type=int, default=ARCHIVE_DAYS,
        help=f"아카이브 기준일 (기본값: {ARCHIVE_DAYS}일)",
    )
    p_arc.add_argument("--dry-run", action="store_true", help="미리 보기 (이동 없음)")
    p_arc.set_defaults(func=cmd_archive)

    # all
    p_all = sub.add_parser("all", help="아카이브 후 분류 일괄 실행")
    p_all.add_argument(
        "--days", type=int, default=ARCHIVE_DAYS,
        help=f"아카이브 기준일 (기본값: {ARCHIVE_DAYS}일)",
    )
    p_all.add_argument("--dry-run", action="store_true", help="미리 보기 (이동 없음)")
    p_all.set_defaults(func=cmd_all)

    # watch
    p_watch = sub.add_parser("watch", help="실시간 감시 모드")
    p_watch.set_defaults(func=cmd_watch)

    # status
    p_stat = sub.add_parser("status", help="폴더 현황 조회")
    p_stat.set_defaults(func=cmd_status)

    # history
    p_hist = sub.add_parser("history", help="작업 이력 조회")
    p_hist.add_argument(
        "--limit", type=int, default=20,
        metavar="N",
        help="최근 N개 세션 조회 (기본값: 20)",
    )
    p_hist.add_argument(
        "--session", type=str, default=None,
        metavar="SESSION_ID",
        help="특정 세션의 파일별 상세 조회",
    )
    p_hist.set_defaults(func=cmd_history)

    # rollback
    p_rb = sub.add_parser("rollback", help="특정 세션 파일 이동 복구")
    rb_target = p_rb.add_mutually_exclusive_group()
    rb_target.add_argument(
        "--session", type=str, default=None,
        metavar="SESSION_ID",
        help="롤백할 세션 ID",
    )
    rb_target.add_argument(
        "--last", action="store_true",
        help="가장 최근 롤백 가능한 세션 자동 선택",
    )
    p_rb.add_argument(
        "--dry-run", action="store_true",
        help="미리 보기 (실제 파일 이동 없음)",
    )
    p_rb.set_defaults(func=cmd_rollback)

    return parser


def main():
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # history / rollback 은 폴더 경로 검증 불필요
    if args.command not in ("history", "rollback"):
        target = Path(args.dir)
        if not target.exists():
            rep.print_error(f"폴더를 찾을 수 없습니다: {target}")
            sys.exit(1)
        if not target.is_dir():
            rep.print_error(f"유효한 폴더 경로가 아닙니다: {target}")
            sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
