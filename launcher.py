from __future__ import annotations

import argparse
import json
import math
import re
import socket
import socketserver
import sys
import threading
import time
import uuid
import webbrowser
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


APP_TITLE = "Tarkov Web Map Locator"
HTTP_HOST = "127.0.0.1"
DEFAULT_HTTP_PORT = 5173
SYNC_DEFAULT_PORT = 39247
SYNC_SOCKET_TIMEOUT_SEC = 4.0
PEER_TTL_SEC = 8.0
MAX_FRAME_BYTES = 256 * 1024
PACKET_VERSION = 1
SYNC_UPDATE_TYPE = "sync_update"
SYNC_SNAPSHOT_TYPE = "sync_snapshot"
NAME_MAX_LENGTH = 24
DEFAULT_COLOR = "#4fd1ff"
HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")


def get_resource_root() -> Path:
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return Path(getattr(sys, "_MEIPASS"))
    return Path(__file__).resolve().parent


def can_bind(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((HTTP_HOST, port))
            return True
        except OSError:
            return False


def pick_port(preferred: int) -> int:
    for port in range(preferred, preferred + 30):
        if can_bind(port):
            return port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((HTTP_HOST, 0))
        return int(sock.getsockname()[1])


def normalize_name(value: Any, fallback: str = "Player") -> str:
    text = str(value or "").strip()
    if not text:
        text = fallback
    return text[:NAME_MAX_LENGTH]


def normalize_color(value: Any) -> str:
    text = str(value or "").strip()
    if HEX_COLOR_RE.fullmatch(text):
        return text.lower()
    return DEFAULT_COLOR


def normalize_host(value: Any) -> str:
    text = str(value or "").strip()
    return text[:128]


def is_finite_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and math.isfinite(value)


def normalize_port(value: Any, default: int = SYNC_DEFAULT_PORT) -> int:
    try:
        numeric = int(value)
    except (TypeError, ValueError):
        return default
    if 1 <= numeric <= 65535:
        return numeric
    return default


def normalize_optional_text(value: Any, max_length: int = 80) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    return text[:max_length]


def normalize_yaw(value: Any) -> float | None:
    if not is_finite_number(value):
        return None
    return float(value) % 360.0


def normalize_timestamp_ms(value: Any) -> int:
    if is_finite_number(value):
        numeric = int(value)
        if numeric > 0:
            return numeric
    return int(time.time() * 1000)


def sanitize_local_state(payload: dict[str, Any] | None) -> dict[str, Any]:
    payload = payload or {}
    x = float(payload["x"]) if is_finite_number(payload.get("x")) else None
    y = float(payload["y"]) if is_finite_number(payload.get("y")) else None
    z = float(payload["z"]) if is_finite_number(payload.get("z")) else None
    return {
        "mapId": normalize_optional_text(payload.get("mapId"), 64),
        "mapName": normalize_optional_text(payload.get("mapName"), 80),
        "x": x,
        "y": y,
        "z": z,
        "yawDeg": normalize_yaw(payload.get("yawDeg")),
        "raidStatus": normalize_optional_text(payload.get("raidStatus"), 40),
        "updatedAt": normalize_timestamp_ms(payload.get("updatedAt")),
    }


class SyncState:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self.instance_id = uuid.uuid4().hex
        self.enabled = False
        self.display_name = normalize_name(socket.gethostname())
        self.color = DEFAULT_COLOR
        self.remote_host = ""
        self.remote_port = SYNC_DEFAULT_PORT
        self.sync_port = SYNC_DEFAULT_PORT
        self.last_error = ""
        self.local_state = sanitize_local_state({})
        self.peers: dict[str, dict[str, Any]] = {}

    def mode(self) -> str:
        with self._lock:
            return self._mode_locked()

    def configure(self, payload: dict[str, Any] | None) -> dict[str, Any]:
        payload = payload or {}
        with self._lock:
            if "enabled" in payload:
                self.enabled = bool(payload["enabled"])
            if "displayName" in payload:
                self.display_name = normalize_name(payload.get("displayName"), self.display_name)
            if "color" in payload:
                self.color = normalize_color(payload.get("color"))
            if "remoteHost" in payload:
                self.remote_host = normalize_host(payload.get("remoteHost"))
            if "remotePort" in payload:
                self.remote_port = normalize_port(payload.get("remotePort"), self.remote_port)
            if "syncPort" in payload:
                self.sync_port = normalize_port(payload.get("syncPort"), self.sync_port)

            if not self.enabled:
                self.peers.clear()
                self.last_error = ""
            elif self._mode_locked() == "host":
                self.last_error = ""
            return self._snapshot_locked()

    def update_local_state(self, payload: dict[str, Any] | None) -> None:
        with self._lock:
            self.local_state = sanitize_local_state(payload)

    def set_last_error(self, message: str) -> None:
        with self._lock:
            self.last_error = message[:180]

    def clear_last_error(self) -> None:
        with self._lock:
            self.last_error = ""

    def prune_peers(self) -> None:
        now = time.time()
        with self._lock:
            stale_ids = [
                peer_id
                for peer_id, peer in self.peers.items()
                if now - float(peer.get("lastSeenAt", 0.0)) > PEER_TTL_SEC
            ]
            for peer_id in stale_ids:
                self.peers.pop(peer_id, None)

    def snapshot(self) -> dict[str, Any]:
        self.prune_peers()
        with self._lock:
            return self._snapshot_locked()

    def get_join_target(self) -> tuple[str, int] | None:
        with self._lock:
            if self._mode_locked() != "join":
                return None
            host = self.remote_host
            port = self.remote_port
            if not host:
                return None
            return (host, port)

    def get_host_port(self) -> int:
        with self._lock:
            return self.sync_port

    def build_join_update_packet(self) -> dict[str, Any]:
        with self._lock:
            return {
                "type": SYNC_UPDATE_TYPE,
                "version": PACKET_VERSION,
                "senderId": self.instance_id,
                "displayName": self.display_name,
                "color": self.color,
                "state": dict(self.local_state),
                "sentAt": int(time.time() * 1000),
            }

    def consume_remote_update(self, payload: dict[str, Any], address: tuple[str, int]) -> None:
        sender_id = str(payload.get("senderId") or "").strip()
        if (
            payload.get("type") != SYNC_UPDATE_TYPE
            or payload.get("version") != PACKET_VERSION
            or not sender_id
            or sender_id == self.instance_id
        ):
            return
        with self._lock:
            if self._mode_locked() != "host":
                return
            peer_state = sanitize_local_state(payload.get("state"))
            self.peers[sender_id] = {
                "senderId": sender_id,
                "displayName": normalize_name(payload.get("displayName")),
                "color": normalize_color(payload.get("color")),
                "host": address[0],
                "port": int(address[1]),
                "lastSeenAt": time.time(),
                "state": peer_state,
            }

    def replace_peers_from_remote_snapshot(self, peers: list[dict[str, Any]]) -> None:
        now = time.time()
        with self._lock:
            self.peers.clear()
            for peer in peers:
                sender_id = str(peer.get("senderId") or "").strip()
                if not sender_id or sender_id == self.instance_id:
                    continue
                state_payload = peer.get("state") if isinstance(peer.get("state"), dict) else {}
                timestamp_ms = normalize_timestamp_ms(peer.get("lastSeenAt"))
                self.peers[sender_id] = {
                    "senderId": sender_id,
                    "displayName": normalize_name(peer.get("displayName")),
                    "color": normalize_color(peer.get("color")),
                    "host": normalize_host(peer.get("host")),
                    "port": normalize_port(peer.get("port"), SYNC_DEFAULT_PORT),
                    "lastSeenAt": min(now, timestamp_ms / 1000.0),
                    "state": sanitize_local_state(state_payload),
                }

    def build_host_response(self) -> dict[str, Any]:
        self.prune_peers()
        with self._lock:
            if self._mode_locked() != "host":
                return {
                    "type": "sync_error",
                    "version": PACKET_VERSION,
                    "message": "host_disabled",
                    "serverTime": int(time.time() * 1000),
                    "peers": [],
                }
            peers = [
                {
                    "senderId": self.instance_id,
                    "displayName": self.display_name,
                    "color": self.color,
                    "host": "host",
                    "port": self.sync_port,
                    "lastSeenAt": int(time.time() * 1000),
                    "state": dict(self.local_state),
                }
            ]
            peers.extend(
                {
                    "senderId": peer["senderId"],
                    "displayName": peer["displayName"],
                    "color": peer["color"],
                    "host": peer["host"],
                    "port": peer["port"],
                    "lastSeenAt": int(float(peer["lastSeenAt"]) * 1000),
                    "state": dict(peer["state"]),
                }
                for peer in self.peers.values()
            )
        return {
            "type": SYNC_SNAPSHOT_TYPE,
            "version": PACKET_VERSION,
            "serverTime": int(time.time() * 1000),
            "peers": peers,
        }

    def _mode_locked(self) -> str:
        if not self.enabled:
            return "off"
        if self.remote_host:
            return "join"
        return "host"

    def _snapshot_locked(self) -> dict[str, Any]:
        peers = [
            {
                "senderId": peer["senderId"],
                "displayName": peer["displayName"],
                "color": peer["color"],
                "host": peer["host"],
                "port": peer["port"],
                "lastSeenAt": int(float(peer["lastSeenAt"]) * 1000),
                "state": dict(peer["state"]),
            }
            for peer in self.peers.values()
        ]
        peers.sort(key=lambda item: item["displayName"].lower())
        return {
            "enabled": self.enabled,
            "mode": self._mode_locked(),
            "instanceId": self.instance_id,
            "displayName": self.display_name,
            "color": self.color,
            "remoteHost": self.remote_host,
            "remotePort": self.remote_port,
            "syncPort": self.sync_port,
            "transport": "frp-tcp",
            "lastError": self.last_error,
            "localState": dict(self.local_state),
            "peers": peers,
            "now": int(time.time() * 1000),
        }


class FrpSyncTCPHandler(socketserver.StreamRequestHandler):
    def handle(self) -> None:
        sync_state: SyncState = self.server.sync_state  # type: ignore[attr-defined]
        try:
            raw = self.rfile.readline(MAX_FRAME_BYTES + 1)
            if not raw or len(raw) > MAX_FRAME_BYTES:
                return
            payload = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return
        if not isinstance(payload, dict):
            return
        sync_state.consume_remote_update(payload, self.client_address)
        response = sync_state.build_host_response()
        data = json.dumps(response, ensure_ascii=False, separators=(",", ":")).encode("utf-8") + b"\n"
        self.wfile.write(data)
        self.wfile.flush()


class FrpSyncTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

    def __init__(self, server_address: tuple[str, int], handler_class: type[FrpSyncTCPHandler], sync_state: SyncState) -> None:
        super().__init__(server_address, handler_class)
        self.sync_state = sync_state


class FrpSyncService:
    def __init__(self, state: SyncState) -> None:
        self.state = state
        self._lock = threading.RLock()
        self._host_server: FrpSyncTCPServer | None = None
        self._host_thread: threading.Thread | None = None
        self._active_port: int | None = None

    def apply_config(self) -> None:
        mode = self.state.mode()
        if mode == "host":
            self._ensure_host_server(self.state.get_host_port())
            self.state.clear_last_error()
            return
        self._stop_host_server()
        if mode == "off":
            self.state.clear_last_error()

    def stop(self) -> None:
        self._stop_host_server()

    def sync_once_after_update(self) -> dict[str, Any]:
        self.state.prune_peers()
        mode = self.state.mode()
        if mode == "join":
            self._sync_join_once()
        return self.state.snapshot()

    def _sync_join_once(self) -> None:
        target = self.state.get_join_target()
        if not target:
            self.state.set_last_error("Missing FRP target address.")
            return
        host, port = target
        packet = self.state.build_join_update_packet()
        data = json.dumps(packet, ensure_ascii=False, separators=(",", ":")).encode("utf-8") + b"\n"
        try:
            with socket.create_connection((host, port), timeout=SYNC_SOCKET_TIMEOUT_SEC) as sock:
                sock.sendall(data)
                sock.settimeout(SYNC_SOCKET_TIMEOUT_SEC)
                response_raw = b""
                response: dict[str, Any] | None = None
                while True:
                    try:
                        chunk = sock.recv(4096)
                    except socket.timeout:
                        if response_raw:
                            break
                        raise TimeoutError("Timed out waiting for host response.")
                    if not chunk:
                        break
                    response_raw += chunk
                    if len(response_raw) > MAX_FRAME_BYTES:
                        raise ValueError("Remote snapshot is too large.")
                    candidate = response_raw.strip()
                    if not candidate:
                        continue
                    try:
                        parsed = json.loads(candidate.decode("utf-8"))
                    except (UnicodeDecodeError, json.JSONDecodeError):
                        continue
                    if isinstance(parsed, dict):
                        response = parsed
                        break
            if response is None and response_raw:
                parsed = json.loads(response_raw.decode("utf-8").strip())
                response = parsed if isinstance(parsed, dict) else None
            if response is None:
                raise ValueError("No response from host.")
            if response.get("type") == "sync_error":
                message = str(response.get("message") or "Remote host rejected update.")
                raise ValueError(message)
            peers = response.get("peers")
            if not isinstance(peers, list):
                raise ValueError("Snapshot peers missing.")
            parsed_peers = [peer for peer in peers if isinstance(peer, dict)]
            self.state.replace_peers_from_remote_snapshot(parsed_peers)
            self.state.clear_last_error()
        except Exception as exc:  # noqa: BLE001
            self.state.set_last_error(f"Join sync failed: {exc}")

    def _ensure_host_server(self, port: int) -> None:
        with self._lock:
            if self._host_server and self._active_port == port:
                return
            self._stop_host_server_locked()
            server = FrpSyncTCPServer(("0.0.0.0", port), FrpSyncTCPHandler, self.state)
            thread = threading.Thread(target=server.serve_forever, name="frp-sync-host", daemon=True)
            thread.start()
            self._host_server = server
            self._host_thread = thread
            self._active_port = port

    def _stop_host_server(self) -> None:
        with self._lock:
            self._stop_host_server_locked()

    def _stop_host_server_locked(self) -> None:
        if self._host_server:
            self._host_server.shutdown()
            self._host_server.server_close()
            self._host_server = None
        if self._host_thread:
            self._host_thread.join(timeout=1.5)
            self._host_thread = None
        self._active_port = None


class TarkovMapRequestHandler(SimpleHTTPRequestHandler):
    server_version = "TarkovMapLocator/1.2"

    def log_message(self, fmt: str, *args: object) -> None:
        return

    @property
    def sync_state(self) -> SyncState:
        return self.server.sync_state  # type: ignore[attr-defined]

    @property
    def sync_service(self) -> FrpSyncService:
        return self.server.sync_service  # type: ignore[attr-defined]

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/lan-sync/state":
            self._send_json(HTTPStatus.OK, self.sync_state.snapshot())
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/lan-sync/config":
            payload = self._read_json_body()
            if payload is None:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload."})
                return
            self.sync_state.configure(payload)
            self.sync_service.apply_config()
            self._send_json(HTTPStatus.OK, self.sync_state.snapshot())
            return
        if parsed.path == "/api/lan-sync/update":
            payload = self._read_json_body()
            if payload is None:
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload."})
                return
            self.sync_state.update_local_state(payload)
            snapshot = self.sync_service.sync_once_after_update()
            self._send_json(HTTPStatus.OK, snapshot)
            return
        self._send_json(HTTPStatus.NOT_FOUND, {"error": "API not found."})

    def _read_json_body(self) -> dict[str, Any] | None:
        length_text = self.headers.get("Content-Length", "0")
        try:
            length = max(0, int(length_text))
        except ValueError:
            length = 0
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return None
        return payload if isinstance(payload, dict) else None

    def _send_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)


class TarkovMapServer(ThreadingHTTPServer):
    allow_reuse_address = True

    def __init__(
        self,
        server_address: tuple[str, int],
        handler_class: type[TarkovMapRequestHandler],
        sync_state: SyncState,
        sync_service: FrpSyncService,
    ) -> None:
        super().__init__(server_address, handler_class)
        self.sync_state = sync_state
        self.sync_service = sync_service


def run() -> int:
    parser = argparse.ArgumentParser(description=APP_TITLE)
    parser.add_argument("--port", type=int, default=DEFAULT_HTTP_PORT, help="Preferred HTTP port.")
    parser.add_argument("--page", default="index.html", help="Entry page.")
    parser.add_argument("--no-browser", action="store_true", help="Do not open browser automatically.")
    args = parser.parse_args()

    root = get_resource_root()
    entry = root / args.page
    if not entry.exists():
        print(f"[ERROR] Entry file missing: {entry}")
        return 1

    port = pick_port(args.port)
    sync_state = SyncState()
    sync_service = FrpSyncService(sync_state)
    sync_service.apply_config()

    handler = partial(TarkovMapRequestHandler, directory=str(root))
    server = TarkovMapServer((HTTP_HOST, port), handler, sync_state, sync_service)
    thread = threading.Thread(target=server.serve_forever, name="http-server", daemon=True)
    thread.start()

    url = f"http://{HTTP_HOST}:{port}/{args.page}"
    print(f"{APP_TITLE} started")
    print(f"Root: {root}")
    print(f"URL: {url}")
    print(f"FRP sync default port: {SYNC_DEFAULT_PORT}")
    print("Press Ctrl+C to stop")

    if not args.no_browser:
        try:
            opened = webbrowser.open(url, new=2)
            if not opened:
                print(f"[INFO] Browser was not opened automatically. Open this URL manually: {url}")
        except Exception as exc:  # noqa: BLE001
            print(f"[INFO] Failed to open browser automatically: {exc}")
            print(f"[INFO] Open this URL manually: {url}")

    try:
        while thread.is_alive():
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping...")
    finally:
        server.shutdown()
        server.server_close()
        sync_service.stop()
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
