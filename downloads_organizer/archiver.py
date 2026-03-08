"""
아카이브 모듈 - 90일 이상 된 파일을 Archive 폴더로 이동
"""
from pathlib import Path
from typing import Callable

from config import ARCHIVE_DAYS, ARCHIVE_FOLDER, DOWNLOADS_DIR, EXCLUDED_FOLDERS, CATEGORIES
from file_ops import move_file, get_file_age_days, is_hidden, is_system_file


def _iter_archivable(downloads_dir: Path, days: int):
    """아카이브 대상 파일 제너레이터 (하위 카테고리 폴더 포함 순회)"""
    all_excluded = EXCLUDED_FOLDERS  # Archive 폴더 자체는 제외

    for item in downloads_dir.rglob("*"):
        if not item.is_file():
            continue
        if is_hidden(item) or is_system_file(item):
            continue

        # Archive 폴더 내 파일은 이미 아카이브됨 → 건너뜀
        try:
            item.relative_to(downloads_dir / ARCHIVE_FOLDER)
            continue
        except ValueError:
            pass

        if get_file_age_days(item) >= days:
            yield item


def archive_old_files(
    downloads_dir: Path = DOWNLOADS_DIR,
    days: int = ARCHIVE_DAYS,
    dry_run: bool = False,
    progress_cb: Callable[[dict], None] = None,
) -> list[dict]:
    """
    days일 이상 된 파일을 Archive 폴더로 이동.
    하위 카테고리 구조를 유지하며 Archive/카테고리/ 로 이동.
    dry_run=True 이면 실제 이동 없이 결과만 반환.
    """
    results = []
    archive_root = downloads_dir / ARCHIVE_FOLDER

    for file in _iter_archivable(downloads_dir, days):
        # 현재 위치 기준 카테고리 폴더 파악 (직계 상위 폴더)
        rel = file.relative_to(downloads_dir)
        top_folder = rel.parts[0] if len(rel.parts) > 1 else ""

        # Archive 내 동일 구조 유지
        if top_folder and top_folder in {c["folder"] for c in CATEGORIES.values()}:
            dest_dir = archive_root / top_folder
        else:
            dest_dir = archive_root

        age = get_file_age_days(file)
        record = {
            "file": file.name,
            "src": file,
            "dest_dir": dest_dir,
            "age_days": age,
            "status": None,
            "error": "",
        }

        if dry_run:
            record["status"] = "dry_run"
        else:
            success, actual_dest, err = move_file(file, dest_dir)
            record["status"] = "success" if success else "failed"
            record["dest"] = actual_dest
            record["error"] = err

        results.append(record)
        if progress_cb:
            progress_cb(record)

    return results
