"""PawPause Hermes Agent hook.

Install this directory into ``~/.hermes/plugins/pawpause-agent-hook`` and add
``pawpause-agent-hook`` to ``plugins.enabled`` in ``~/.hermes/config.yaml``.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any


def _output_file() -> Path:
    override = os.environ.get("PAWPAUSE_HERMES_AGENT_EVENTS") or os.environ.get("PAWPAUSE_AGENT_EVENTS")
    if override:
        return Path(override).expanduser()

    if os.name == "nt":
        base = Path(os.environ.get("APPDATA") or Path.home() / "AppData" / "Roaming")
        return base / "PawPause" / "agent-events" / "hermes.jsonl"

    base = Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local" / "share")
    return base / "pawpause" / "agent-events" / "hermes.jsonl"


def _session_id(kwargs: dict[str, Any]) -> str:
    return str(
        kwargs.get("session_id")
        or kwargs.get("sessionID")
        or kwargs.get("session_key")
        or kwargs.get("task_id")
        or os.environ.get("HERMES_SESSION_KEY")
        or "unknown"
    )


def _progress_for_tool(tool_name: Any, args: Any = None) -> str:
    text = f"{tool_name or ''} {args or ''}".lower()
    if any(term in text for term in ("terminal", "shell", "bash", "command", "exec")):
        return "script"
    return "tool"


def _write(event: str, kind: str, progress_kind: str, message: str, **kwargs: Any) -> None:
    timestamp_ms = int(time.time() * 1000)
    event_id = time.time_ns()
    session_id = _session_id(kwargs)
    entry = {
        "version": 1,
        "source": "Hermes",
        "id": f"{event}:{session_id}:{event_id}",
        "event": event,
        "timestampMs": timestamp_ms,
        "session_id": session_id,
        "kind": kind,
        "progressKind": progress_kind,
        "message": message,
    }
    for key in ("platform", "tool_name", "tool_call_id", "task_id", "choice", "surface", "command"):
        if key in kwargs and kwargs[key] is not None:
            entry[key] = kwargs[key]
    if kwargs.get("show_progress") is False:
        entry["showProgress"] = False

    path = _output_file()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False, default=str) + "\n")


def _on_pre_llm_call(**kwargs: Any) -> None:
    _write(
        "pre_llm_call",
        "working",
        "thinking",
        "Hermes is thinking",
        **kwargs,
    )


def _on_post_llm_call(**kwargs: Any) -> None:
    _write(
        "post_llm_call",
        "working",
        "thinking",
        "Hermes received a model response",
        show_progress=False,
        **kwargs,
    )


def _on_pre_tool_call(tool_name: str | None = None, args: Any = None, **kwargs: Any) -> None:
    progress_kind = _progress_for_tool(tool_name, args)
    _write(
        "pre_tool_call",
        "working",
        progress_kind,
        str(tool_name or "Hermes is using a tool"),
        tool_name=tool_name,
        **kwargs,
    )


def _on_post_tool_call(tool_name: str | None = None, **kwargs: Any) -> None:
    _write(
        "post_tool_call",
        "working",
        _progress_for_tool(tool_name),
        str(tool_name or "Hermes finished a tool call"),
        tool_name=tool_name,
        show_progress=False,
        **kwargs,
    )


def _on_pre_approval_request(command: str | None = None, **kwargs: Any) -> None:
    _write(
        "pre_approval_request",
        "needs-review",
        "permission",
        "Hermes needs permission",
        command=command,
        **kwargs,
    )


def _on_post_approval_response(choice: str | None = None, **kwargs: Any) -> None:
    if choice not in {"deny", "timeout"}:
        return
    _write(
        "post_approval_response",
        "failed",
        "failed",
        "Hermes approval was denied",
        choice=choice,
        **kwargs,
    )


def _on_session_finished(event: str = "on_session_finalize", **kwargs: Any) -> None:
    _write(
        event,
        "complete",
        "complete",
        "Hermes session finished",
        **kwargs,
    )


def register(ctx: Any) -> None:
    ctx.register_hook("pre_llm_call", _on_pre_llm_call)
    ctx.register_hook("post_llm_call", _on_post_llm_call)
    ctx.register_hook("pre_tool_call", _on_pre_tool_call)
    ctx.register_hook("post_tool_call", _on_post_tool_call)
    ctx.register_hook("pre_approval_request", _on_pre_approval_request)
    ctx.register_hook("post_approval_response", _on_post_approval_response)
    ctx.register_hook("on_session_finalize", _on_session_finished)
    ctx.register_hook("on_session_end", lambda **kwargs: _on_session_finished("on_session_end", **kwargs))
