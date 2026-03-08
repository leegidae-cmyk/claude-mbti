"""
로거 모듈 - SQLite 기반 작업 이력 기록 및 조회
"""
import sqlite3
import uuid
import datetime
from contextlib import contextmanager
from pathlib import Path
from typing import Optional

from config import LOG_DB_PATH, APP_DATA_DIR

_SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id    TEXT PRIMARY KEY,
    command       TEXT NOT NULL,
    downloads_dir TEXT NOT NULL,
    started_at    TEXT NOT NULL,
    ended_at      TEXT,
    total         INTEGER DEFAULT 0,
    succeeded     INTEGER DEFAULT 0,
    failed        INTEGER DEFAULT 0,
    rolled_back   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS operations (
    op_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT    NOT NULL REFERENCES sessions(session_id),
    file_name   TEXT    NOT NULL,
    src         TEXT    NOT NULL,
    dest        TEXT,
    dest_dir    TEXT    NOT NULL,
    category    TEXT,
    age_days    INTEGER,
    op_type     TEXT    NOT NULL,
    status      TEXT    NOT NULL,
    error       TEXT    DEFAULT '',
    operated_at TEXT    NOT NULL,
    rb_status   TEXT    DEFAULT 'none'
);

CREATE INDEX IF NOT EXISTS idx_ops_session  ON operations(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_ts  ON sessions(started_at DESC);
"""


def _make_session_id() -> str:
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    suffix = uuid.uuid4().hex[:4]
    return f"{ts}_{suffix}"


def _now_iso() -> str:
    return datetime.datetime.now().isoformat()


class OperationLogger:
    """SQLite 기반 작업 이력 로거. 세션 단위로 파일 이동 작업을 기록한다."""

    def __init__(self, db_path: Path = LOG_DB_PATH):
        self.db_path = db_path
        self._init_db()

    # ── 내부 DB 관리 ──────────────────────────────────────────

    def _init_db(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._get_conn() as conn:
            conn.executescript(_SCHEMA)

    @contextmanager
    def _get_conn(self):
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    # ── 세션 관리 ─────────────────────────────────────────────

    def start_session(self, command: str, downloads_dir: Path) -> str:
        """새 세션 생성. session_id 반환."""
        session_id = _make_session_id()
        with self._get_conn() as conn:
            conn.execute(
                "INSERT INTO sessions (session_id, command, downloads_dir, started_at) "
                "VALUES (?, ?, ?, ?)",
                (session_id, command, str(downloads_dir), _now_iso()),
            )
        return session_id

    def end_session(self, session_id: str) -> None:
        """세션 종료 시각과 집계(total/succeeded/failed) 업데이트."""
        with self._get_conn() as conn:
            conn.execute(
                """
                UPDATE sessions
                SET ended_at  = ?,
                    total     = (SELECT COUNT(*)    FROM operations WHERE session_id = ?),
                    succeeded = (SELECT COUNT(*)    FROM operations WHERE session_id = ? AND status = 'success'),
                    failed    = (SELECT COUNT(*)    FROM operations WHERE session_id = ? AND status = 'failed')
                WHERE session_id = ?
                """,
                (_now_iso(), session_id, session_id, session_id, session_id),
            )

    # ── 작업 기록 ─────────────────────────────────────────────

    def log_operation(
        self,
        session_id: str,
        record: dict,
        op_type: str,
    ) -> int:
        """
        result dict를 operations 테이블에 INSERT.
        dry_run / failed 레코드는 dest=NULL로 저장.
        반환: op_id
        """
        # dest: 성공한 경우만 저장
        dest = None
        if record.get("status") == "success" and "dest" in record:
            dest = str(record["dest"])

        with self._get_conn() as conn:
            cur = conn.execute(
                """
                INSERT INTO operations
                    (session_id, file_name, src, dest, dest_dir, category, age_days,
                     op_type, status, error, operated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    record.get("file", ""),
                    str(record.get("src", "")),
                    dest,
                    str(record.get("dest_dir", "")),
                    record.get("category"),       # archive는 None
                    record.get("age_days"),        # classify/watch는 None
                    op_type,
                    record.get("status", ""),
                    record.get("error", ""),
                    _now_iso(),
                ),
            )
            return cur.lastrowid

    # ── 조회 ──────────────────────────────────────────────────

    def get_sessions(self, limit: int = 20) -> list:
        with self._get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return rows

    def get_session(self, session_id: str) -> Optional[sqlite3.Row]:
        with self._get_conn() as conn:
            return conn.execute(
                "SELECT * FROM sessions WHERE session_id = ?",
                (session_id,),
            ).fetchone()

    def get_operations(
        self,
        session_id: str,
        status_filter: Optional[str] = None,
    ) -> list:
        with self._get_conn() as conn:
            if status_filter:
                rows = conn.execute(
                    "SELECT * FROM operations WHERE session_id = ? AND status = ? ORDER BY op_id",
                    (session_id, status_filter),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM operations WHERE session_id = ? ORDER BY op_id",
                    (session_id,),
                ).fetchall()
        return rows

    # ── 롤백 상태 업데이트 ────────────────────────────────────

    def mark_session_rolled_back(self, session_id: str) -> None:
        with self._get_conn() as conn:
            conn.execute(
                "UPDATE sessions SET rolled_back = 1 WHERE session_id = ?",
                (session_id,),
            )

    def update_op_rb_status(self, op_id: int, rb_status: str) -> None:
        with self._get_conn() as conn:
            conn.execute(
                "UPDATE operations SET rb_status = ? WHERE op_id = ?",
                (rb_status, op_id),
            )


def make_logger(db_path: Path = LOG_DB_PATH) -> OperationLogger:
    """편의 팩토리 함수."""
    return OperationLogger(db_path)
