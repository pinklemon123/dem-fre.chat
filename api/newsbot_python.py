import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from typing import Any, Dict

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(ROOT_DIR)
SRC_LIB_PATH = os.path.join(PROJECT_ROOT, "src", "lib")

if SRC_LIB_PATH not in sys.path:
    sys.path.append(SRC_LIB_PATH)

try:
    from enhanced_newsbot import EnhancedNewsBot
except Exception as import_error:  # pragma: no cover - defensive logging for deployment issues
    EnhancedNewsBot = None  # type: ignore
    _IMPORT_ERROR = import_error
else:
    _IMPORT_ERROR = None


def _run_newsbot() -> Dict[str, Any]:
    if EnhancedNewsBot is None:
        raise RuntimeError(f"无法导入新闻机器人模块: {_IMPORT_ERROR}")

    bot = EnhancedNewsBot()
    result = bot.run_once()
    return result


class handler(BaseHTTPRequestHandler):
    def _authorize(self) -> bool:
        cron_secret = os.getenv("CRON_SECRET")
        if not cron_secret:
            return True

        auth_header = self.headers.get("authorization")
        return auth_header == f"Bearer {cron_secret}"

    def _send_json(self, payload: Dict[str, Any], status: int) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _handle(self) -> None:
        if not self._authorize():
            self._send_json({"success": False, "error": "Unauthorized"}, 401)
            return

        try:
            result = _run_newsbot()
            status_code = 200 if result.get("success") else 500
            self._send_json(result, status_code)
        except Exception as exc:  # pragma: no cover - network path
            self._send_json({
                "success": False,
                "error": str(exc),
            }, 500)

    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        self._handle()

    def do_POST(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        self._handle()
