"""
설정 파일 - 카테고리 정의, 경로, 아카이브 기준일 등
"""
import os
from pathlib import Path

# 다운로드 폴더 기본 경로
DOWNLOADS_DIR = Path.home() / "Downloads"

# 아카이브 기준일 (90일)
ARCHIVE_DAYS = 90

# 아카이브 폴더명
ARCHIVE_FOLDER = "Archive"

# 확장자별 카테고리 매핑
CATEGORIES = {
    "Images": {
        "extensions": [
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp",
            ".ico", ".tiff", ".tif", ".raw", ".heic", ".heif", ".psd",
            ".ai", ".eps",
        ],
        "folder": "Images",
    },
    "Videos": {
        "extensions": [
            ".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv", ".webm",
            ".m4v", ".mpg", ".mpeg", ".3gp", ".ts", ".vob", ".rmvb",
        ],
        "folder": "Videos",
    },
    "Audio": {
        "extensions": [
            ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma",
            ".opus", ".aiff", ".aif", ".mid", ".midi",
        ],
        "folder": "Audio",
    },
    "Documents": {
        "extensions": [
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
            ".txt", ".rtf", ".odt", ".ods", ".odp", ".pages", ".numbers",
            ".key", ".hwp", ".hwpx", ".csv", ".md",
        ],
        "folder": "Documents",
    },
    "Archives": {
        "extensions": [
            ".zip", ".rar", ".7z", ".tar", ".gz", ".bz2", ".xz",
            ".iso", ".tar.gz", ".tar.bz2", ".tar.xz", ".tgz",
        ],
        "folder": "Archives",
    },
    "Code": {
        "extensions": [
            ".py", ".js", ".ts", ".html", ".css", ".java", ".cpp",
            ".c", ".h", ".cs", ".php", ".rb", ".go", ".rs", ".swift",
            ".kt", ".sh", ".bat", ".ps1", ".json", ".xml", ".yaml",
            ".yml", ".toml", ".sql", ".jsx", ".tsx", ".vue",
        ],
        "folder": "Code",
    },
    "Executables": {
        "extensions": [
            ".exe", ".msi", ".dmg", ".pkg", ".deb", ".rpm",
            ".appimage", ".apk", ".ipa",
        ],
        "folder": "Executables",
    },
    "Others": {
        "extensions": [],  # 매칭되지 않은 나머지
        "folder": "Others",
    },
}

# 이동 제외 대상 폴더 (다운로드 폴더 내 분류 폴더 자체는 처리 제외)
EXCLUDED_FOLDERS = {ARCHIVE_FOLDER} | {cat["folder"] for cat in CATEGORIES.values()}

# 앱 데이터 디렉터리 (이력 DB 저장 위치)
APP_DATA_DIR = Path.home() / ".downloads_organizer"
LOG_DB_PATH  = APP_DATA_DIR / "history.db"
