from __future__ import annotations

import argparse
import socket
import sys
import threading
import time
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


APP_TITLE = "Tarkov Map Locator"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, fmt: str, *args: object) -> None:
        return


def get_resource_root() -> Path:
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(getattr(sys, "_MEIPASS"))
    return Path(__file__).resolve().parent


def can_bind(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def pick_port(preferred: int) -> int:
    for port in range(preferred, preferred + 30):
        if can_bind(port):
            return port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def run() -> int:
    parser = argparse.ArgumentParser(description=APP_TITLE)
    parser.add_argument("--port", type=int, default=5173, help="Preferred HTTP port")
    parser.add_argument("--page", default="index.html", help="Entry page")
    parser.add_argument("--no-browser", action="store_true", help="Do not auto open browser")
    args = parser.parse_args()

    root = get_resource_root()
    entry = root / args.page
    if not entry.exists():
        print(f"[ERROR] Missing entry file: {entry}")
        return 1

    port = pick_port(args.port)
    handler = partial(QuietHandler, directory=str(root))
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    url = f"http://127.0.0.1:{port}/{args.page}"
    print(f"{APP_TITLE} is running")
    print(f"Root: {root}")
    print(f"URL : {url}")
    print("Press Ctrl+C to stop")

    if not args.no_browser:
        webbrowser.open(url, new=2)

    try:
        while thread.is_alive():
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.shutdown()
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
