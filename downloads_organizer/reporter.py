"""
리포터 모듈 - rich 라이브러리를 이용한 CLI 출력
"""
from pathlib import Path
from datetime import datetime
from typing import List

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.text import Text
from rich import box

console = Console(legacy_windows=False)


# ─── 공통 헬퍼 ────────────────────────────────────────────────────────────────

def _status_icon(status: str) -> Text:
    mapping = {
        "success": Text("✔ 완료", style="bold green"),
        "failed":  Text("✘ 실패", style="bold red"),
        "dry_run": Text("○ 예정", style="bold yellow"),
        "skipped": Text("– 건너뜀", style="dim"),
    }
    return mapping.get(status, Text(status))


def _short_path(path: Path, base: Path) -> str:
    try:
        return str(path.relative_to(base))
    except ValueError:
        return str(path)


# ─── 분류 결과 출력 ────────────────────────────────────────────────────────────

def print_classify_results(results: List[dict], downloads_dir: Path):
    if not results:
        console.print(Panel("[bold green]분류할 파일이 없습니다.[/]", title="분류 결과"))
        return

    table = Table(
        title="파일 분류 결과",
        box=box.ROUNDED,
        show_lines=False,
        header_style="bold cyan",
    )
    table.add_column("상태",    width=10)
    table.add_column("파일명",  max_width=35, overflow="ellipsis")
    table.add_column("카테고리", width=14)
    table.add_column("이동 위치", max_width=40, overflow="ellipsis")

    ok = fail = 0
    for r in results:
        dest_str = _short_path(r.get("dest", r["dest_dir"]), downloads_dir)
        status_icon = _status_icon(r["status"])
        table.add_row(
            status_icon,
            r["file"],
            r.get("category", "-"),
            dest_str + (f"\n[red]{r['error']}[/]" if r["error"] else ""),
        )
        if r["status"] == "success":
            ok += 1
        elif r["status"] == "failed":
            fail += 1

    console.print(table)
    console.print(
        f"  [green]성공: {ok}[/]  [red]실패: {fail}[/]  합계: {len(results)}"
    )


# ─── 아카이브 결과 출력 ────────────────────────────────────────────────────────

def print_archive_results(results: List[dict], downloads_dir: Path):
    if not results:
        console.print(Panel("[bold green]아카이브할 파일이 없습니다.[/]", title="아카이브 결과"))
        return

    table = Table(
        title="아카이브 결과",
        box=box.ROUNDED,
        show_lines=False,
        header_style="bold cyan",
    )
    table.add_column("상태",   width=10)
    table.add_column("파일명", max_width=35, overflow="ellipsis")
    table.add_column("경과일", width=8, justify="right")
    table.add_column("이동 위치", max_width=40, overflow="ellipsis")

    ok = fail = 0
    for r in results:
        dest_str = _short_path(r.get("dest", r["dest_dir"]), downloads_dir)
        age_str = f"{r['age_days']}일"
        table.add_row(
            _status_icon(r["status"]),
            r["file"],
            age_str,
            dest_str + (f"\n[red]{r['error']}[/]" if r["error"] else ""),
        )
        if r["status"] == "success":
            ok += 1
        elif r["status"] == "failed":
            fail += 1

    console.print(table)
    console.print(
        f"  [green]성공: {ok}[/]  [red]실패: {fail}[/]  합계: {len(results)}"
    )


# ─── 실시간 감시 이벤트 출력 ──────────────────────────────────────────────────

def print_watch_event(record: dict):
    ts = datetime.now().strftime("%H:%M:%S")
    if record["status"] == "success":
        dest = record.get("dest", record["dest_dir"])
        console.print(
            f"[dim]{ts}[/]  [green]✔[/] [bold]{record['file']}[/] "
            f"→ [cyan]{dest.parent.name}/{dest.name}[/]"
        )
    else:
        console.print(
            f"[dim]{ts}[/]  [red]✘[/] [bold]{record['file']}[/] "
            f"실패: [red]{record['error']}[/]"
        )


# ─── 폴더 현황 출력 ───────────────────────────────────────────────────────────

def print_status(downloads_dir: Path):
    from config import CATEGORIES, ARCHIVE_FOLDER

    table = Table(
        title=f"다운로드 폴더 현황  [dim]{downloads_dir}[/]",
        box=box.SIMPLE_HEAD,
        header_style="bold magenta",
    )
    table.add_column("폴더", min_width=16)
    table.add_column("파일 수", justify="right", width=9)
    table.add_column("용량",    justify="right", width=11)

    def folder_stats(path: Path):
        if not path.exists():
            return 0, 0
        files = [f for f in path.rglob("*") if f.is_file()]
        total = sum(f.stat().st_size for f in files)
        return len(files), total

    def fmt_size(size: int) -> str:
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"

    # 루트 직속 파일 (미분류)
    root_files = [f for f in downloads_dir.iterdir() if f.is_file()]
    root_size = sum(f.stat().st_size for f in root_files)
    table.add_row("[yellow]미분류[/]", str(len(root_files)), fmt_size(root_size))

    for cat_name, cat_info in CATEGORIES.items():
        folder = downloads_dir / cat_info["folder"]
        count, size = folder_stats(folder)
        if count > 0:
            table.add_row(cat_info["folder"], str(count), fmt_size(size))

    arch_folder = downloads_dir / ARCHIVE_FOLDER
    arch_count, arch_size = folder_stats(arch_folder)
    if arch_count > 0:
        table.add_row(f"[dim]{ARCHIVE_FOLDER}[/]", str(arch_count), fmt_size(arch_size))

    console.print(table)


# ─── 헤더/인포 ────────────────────────────────────────────────────────────────

def print_header(title: str):
    console.rule(f"[bold blue]{title}[/]")


def print_info(msg: str):
    console.print(f"[cyan][i][/]  {msg}")


def print_warn(msg: str):
    console.print(f"[yellow][!][/]  {msg}")


def print_error(msg: str):
    console.print(f"[red][x][/]  {msg}")


def make_progress() -> Progress:
    """파일 처리용 Progress 바 반환"""
    return Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console,
        transient=True,
    )


# ─── 이력 출력 ────────────────────────────────────────────────────────────────

def _rb_status_text(rolled_back: int) -> Text:
    if rolled_back:
        return Text("롤백됨", style="dim")
    return Text("정상", style="green")


def print_history_sessions(sessions: list, limit: int):
    if not sessions:
        console.print(Panel("[bold green]저장된 이력이 없습니다.[/]", title="작업 이력"))
        return

    table = Table(
        title=f"작업 이력  (최근 {limit}개)",
        box=box.ROUNDED,
        show_lines=False,
        header_style="bold cyan",
    )
    table.add_column("세션 ID",   width=22)
    table.add_column("명령",      width=10)
    table.add_column("시작 시각", width=20)
    table.add_column("파일 수",   width=8,  justify="right")
    table.add_column("성공/실패", width=10, justify="center")
    table.add_column("상태",      width=8)

    for s in sessions:
        dim = s["rolled_back"] == 1
        style = "dim" if dim else ""
        started = s["started_at"][:19].replace("T", " ")

        table.add_row(
            Text(s["session_id"], style=style),
            Text(s["command"],    style=style),
            Text(started,         style=style),
            Text(str(s["total"]), style=style),
            Text(f"{s['succeeded']} / {s['failed']}", style=style),
            _rb_status_text(s["rolled_back"]),
        )

    console.print(table)
    console.print(f"  [dim]세션 상세: python main.py history --session <세션ID>[/]")


def print_history_detail(session_meta, operations: list, downloads_dir: Path):
    started = session_meta["started_at"][:19].replace("T", " ")
    ended   = (session_meta["ended_at"] or "-")[:19].replace("T", " ")
    rb_str  = "[dim]롤백됨[/]" if session_meta["rolled_back"] else "[green]정상[/]"

    info = (
        f"세션 ID: [bold]{session_meta['session_id']}[/]\n"
        f"명령: {session_meta['command']}  |  "
        f"폴더: {session_meta['downloads_dir']}\n"
        f"시작: {started}  |  종료: {ended}  |  상태: {rb_str}"
    )
    console.print(Panel(info, title="세션 정보", border_style="cyan"))

    if not operations:
        console.print("[dim]기록된 작업이 없습니다.[/]")
        return

    table = Table(
        box=box.SIMPLE_HEAD,
        show_lines=False,
        header_style="bold cyan",
    )
    table.add_column("상태",     width=10)
    table.add_column("파일명",   max_width=30, overflow="ellipsis")
    table.add_column("카테고리", width=13)
    table.add_column("이동 전",  max_width=28, overflow="ellipsis")
    table.add_column("이동 후",  max_width=28, overflow="ellipsis")
    table.add_column("복구",     width=8)

    for op in operations:
        src_str  = _short_path(Path(op["src"]),  downloads_dir)
        dest_str = _short_path(Path(op["dest"]), downloads_dir) if op["dest"] else "-"
        cat_str  = op["category"] or (f"{op['age_days']}일" if op["age_days"] else "-")
        rb_map   = {"none": Text("-", style="dim"), "success": Text("복구됨", style="green"),
                    "failed": Text("실패", style="red"), "skipped": Text("건너뜀", style="dim")}
        rb_text  = rb_map.get(op["rb_status"] or "none", Text(op["rb_status"] or "-"))

        table.add_row(
            _status_icon(op["status"]),
            op["file_name"],
            cat_str,
            src_str,
            dest_str,
            rb_text,
        )

    console.print(table)


# ─── 롤백 결과 출력 ───────────────────────────────────────────────────────────

def print_rollback_results(rollback_result: dict, downloads_dir: Path):
    if rollback_result.get("error"):
        console.print(Panel(
            f"[red]{rollback_result['error']}[/]",
            title="롤백 실패",
            border_style="red",
        ))
        return

    dry_run = rollback_result.get("dry_run", False)
    session_id = rollback_result["session_id"]

    if dry_run:
        console.print(Panel(
            f"[yellow]미리보기 모드 - 실제 파일은 이동되지 않습니다.[/]\n세션: {session_id}",
            title="롤백 미리보기",
            border_style="yellow",
        ))
    else:
        console.print(Panel(
            f"세션: {session_id}",
            title="롤백 결과",
            border_style="cyan",
        ))

    results = rollback_result.get("results", [])
    if not results:
        console.print("[dim]처리된 파일이 없습니다.[/]")
        return

    table = Table(
        box=box.SIMPLE_HEAD,
        show_lines=False,
        header_style="bold cyan",
    )
    table.add_column("상태",     width=10)
    table.add_column("파일명",   max_width=32, overflow="ellipsis")
    table.add_column("복구 위치", max_width=35, overflow="ellipsis")
    table.add_column("사유",     max_width=30, overflow="ellipsis")

    rb_icon = {
        "success": Text("복구됨", style="bold green"),
        "failed":  Text("실패",   style="bold red"),
        "skipped": Text("건너뜀", style="dim"),
        "dry_run": Text("예정",   style="bold yellow"),
    }

    for r in results:
        actual = r.get("actual_src")
        dest_str = _short_path(actual, downloads_dir) if actual else "-"
        table.add_row(
            rb_icon.get(r["status"], Text(r["status"])),
            r["file_name"],
            dest_str,
            r.get("reason", ""),
        )

    console.print(table)

    ok   = rollback_result.get("succeeded", 0)
    fail = rollback_result.get("failed", 0)
    skip = rollback_result.get("skipped", 0)
    console.print(
        f"  [green]복구: {ok}[/]  [red]실패: {fail}[/]  [dim]건너뜀: {skip}[/]  합계: {ok + fail + skip}"
    )
