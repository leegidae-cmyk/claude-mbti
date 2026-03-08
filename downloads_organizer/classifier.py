"""
파일 분류 모듈 - 확장자 기반으로 카테고리 폴더로 이동
"""
from pathlib import Path
from typing import Callable

from config import CATEGORIES, DOWNLOADS_DIR, EXCLUDED_FOLDERS
from file_ops import move_file, is_hidden, is_system_file


def get_category(path: Path) -> str:
    """파일 확장자에 맞는 카테고리 반환"""
    ext = path.suffix.lower()
    # .tar.gz 같은 복합 확장자 처리
    name_lower = path.name.lower()
    for compound in [".tar.gz", ".tar.bz2", ".tar.xz"]:
        if name_lower.endswith(compound):
            return "Archives"

    for category, info in CATEGORIES.items():
        if category == "Others":
            continue
        if ext in info["extensions"]:
            return category
    return "Others"


def classify_files(
    downloads_dir: Path = DOWNLOADS_DIR,
    dry_run: bool = False,
    progress_cb: Callable[[dict], None] = None,
) -> list[dict]:
    """
    다운로드 폴더의 파일을 카테고리별 폴더로 분류.
    dry_run=True 이면 실제 이동 없이 결과만 반환.
    progress_cb: 각 파일 처리 시 호출되는 콜백 (결과 dict 전달)
    """
    results = []

    candidates = [
        f for f in downloads_dir.iterdir()
        if f.is_file()
        and not is_hidden(f)
        and not is_system_file(f)
    ]

    for file in candidates:
        category = get_category(file)
        dest_dir = downloads_dir / CATEGORIES[category]["folder"]

        # 이미 같은 폴더에 있으면 건너뜀
        if file.parent == dest_dir:
            continue

        record = {
            "file": file.name,
            "src": file,
            "dest_dir": dest_dir,
            "category": category,
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
