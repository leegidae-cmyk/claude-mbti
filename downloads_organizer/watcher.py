"""
실시간 감시 모듈 - watchdog 으로 다운로드 폴더 신규 파일 자동 분류
"""
import time
from pathlib import Path
from typing import Callable

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent, FileMovedEvent

from config import DOWNLOADS_DIR, EXCLUDED_FOLDERS, CATEGORIES
from classifier import get_category, CATEGORIES as CAT_MAP
from file_ops import move_file, is_hidden, is_system_file


class DownloadHandler(FileSystemEventHandler):
    def __init__(
        self,
        downloads_dir: Path,
        on_event: Callable[[dict], None] = None,
    ):
        super().__init__()
        self.downloads_dir = downloads_dir
        self.on_event = on_event
        self._excluded_dirs = {
            str(downloads_dir / folder)
            for folder in EXCLUDED_FOLDERS
        }

    def _should_skip(self, path: Path) -> bool:
        """감시 제외 대상인지 판단"""
        if not path.is_file():
            return True
        if is_hidden(path) or is_system_file(path):
            return True
        # 분류 폴더 내 파일은 이미 처리됨
        for excl in self._excluded_dirs:
            try:
                path.relative_to(excl)
                return True
            except ValueError:
                pass
        # 다운로드 폴더 직속 파일만 처리 (하위 폴더 제외)
        if path.parent != self.downloads_dir:
            return True
        return False

    def _process(self, path: Path):
        """파일 분류 처리 후 콜백 호출"""
        # 파일이 완전히 쓰여질 때까지 잠시 대기
        time.sleep(1)
        if not path.exists():
            return

        category = get_category(path)
        dest_dir = self.downloads_dir / CAT_MAP[category]["folder"]

        success, actual_dest, err = move_file(path, dest_dir)
        record = {
            "file": path.name,
            "src": path,
            "dest_dir": dest_dir,
            "dest": actual_dest,
            "category": category,
            "status": "success" if success else "failed",
            "error": err,
        }
        if self.on_event:
            self.on_event(record)

    def on_created(self, event: FileCreatedEvent):
        if event.is_directory:
            return
        path = Path(event.src_path)
        if not self._should_skip(path):
            self._process(path)

    def on_moved(self, event: FileMovedEvent):
        """다운로드 완료 후 임시→정식 파일명으로 이름 바뀔 때도 처리"""
        if event.is_directory:
            return
        path = Path(event.dest_path)
        if not self._should_skip(path):
            self._process(path)


def start_watching(
    downloads_dir: Path = DOWNLOADS_DIR,
    on_event: Callable[[dict], None] = None,
) -> Observer:
    """감시 시작, Observer 반환 (stop()으로 종료)"""
    handler = DownloadHandler(downloads_dir, on_event=on_event)
    observer = Observer()
    observer.schedule(handler, str(downloads_dir), recursive=False)
    observer.start()
    return observer
