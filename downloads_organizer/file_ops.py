"""
파일 작업 유틸리티 - 메타데이터 보존 이동, 중복 처리 등
"""
import os
import shutil
from pathlib import Path
from datetime import datetime


def is_hidden(path: Path) -> bool:
    """숨김 파일/폴더 여부 확인 (Windows/Unix 공통)"""
    # Unix 숨김 파일 (. 시작)
    if path.name.startswith("."):
        return True
    # Windows 숨김 속성
    try:
        import ctypes
        attrs = ctypes.windll.kernel32.GetFileAttributesW(str(path))
        if attrs != -1 and (attrs & 2):  # FILE_ATTRIBUTE_HIDDEN = 2
            return True
    except Exception:
        pass
    return False


def is_system_file(path: Path) -> bool:
    """시스템 파일 여부 확인"""
    try:
        import ctypes
        attrs = ctypes.windll.kernel32.GetFileAttributesW(str(path))
        if attrs != -1 and (attrs & 4):  # FILE_ATTRIBUTE_SYSTEM = 4
            return True
    except Exception:
        pass
    return False


def get_unique_dest(dest: Path) -> Path:
    """목적지에 동명 파일 있을 때 고유 경로 반환 (이름_1, 이름_2 형식)"""
    if not dest.exists():
        return dest
    stem = dest.stem
    suffix = dest.suffix
    parent = dest.parent
    counter = 1
    while True:
        new_dest = parent / f"{stem}_{counter}{suffix}"
        if not new_dest.exists():
            return new_dest
        counter += 1


def move_file(src: Path, dest_dir: Path) -> tuple[bool, Path, str]:
    """
    파일을 dest_dir로 이동 (메타데이터 보존).
    반환값: (성공여부, 실제 목적지 경로, 에러메시지)
    """
    try:
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = get_unique_dest(dest_dir / src.name)

        # 원본 타임스탬프 저장
        stat = src.stat()
        atime = stat.st_atime
        mtime = stat.st_mtime

        shutil.move(str(src), str(dest))

        # 타임스탬프 복원
        os.utime(str(dest), (atime, mtime))

        return True, dest, ""
    except PermissionError:
        return False, dest_dir / src.name, "권한 없음 (사용 중인 파일)"
    except Exception as e:
        return False, dest_dir / src.name, str(e)


def get_file_age_days(path: Path) -> int:
    """파일의 마지막 수정 기준 경과일 반환"""
    mtime = path.stat().st_mtime
    delta = datetime.now().timestamp() - mtime
    return int(delta / 86400)


def get_file_modified_time(path: Path) -> datetime:
    """파일 수정 시각 반환"""
    return datetime.fromtimestamp(path.stat().st_mtime)
