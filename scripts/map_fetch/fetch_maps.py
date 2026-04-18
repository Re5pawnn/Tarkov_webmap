import hashlib
import urllib.parse
import socketio
import json
from pathlib import Path

cookies = {
    'method': 'GET',
    'redirect': 'KyXIR4/SP/px5LP5ctWTiQ==',
    'ray': 'KDGvRitpvEXLCrC4TuYjmQ=='
}
cookie_header = '; '.join([f"{k}={v}" for k, v in cookies.items()])
channel = 'tarkov'
version = '3.0.54'
token = ''
hashv = hashlib.md5(f"{channel}{version}{token}".encode()).hexdigest()
qs = urllib.parse.urlencode({'channel': channel, 'version': version, 'token': token, 'hash': hashv})
url = f"https://member.kaedeori.com?{qs}"

sio = socketio.Client(logger=False, engineio_logger=False, reconnection=False, request_timeout=30, ssl_verify=True)

out_dir = Path(r"C:\Users\Administrator\Desktop\1")
all_details = {}
urls = set()


def collect_urls(obj):
    if isinstance(obj, dict):
        for v in obj.values():
            collect_urls(v)
    elif isinstance(obj, list):
        for v in obj:
            collect_urls(v)
    elif isinstance(obj, str):
        if obj.startswith('http://') or obj.startswith('https://'):
            urls.add(obj)

try:
    sio.connect(
        url,
        headers={
            'Cookie': cookie_header,
            'Origin': 'https://member.kaedeori.com',
            'User-Agent': 'Mozilla/5.0'
        },
        transports=['websocket'],
        socketio_path='socket.io',
        wait_timeout=20,
    )

    map_list = sio.call('/v2/tarkov/iMGetMapList', {'lang': 'zh'}, timeout=20)
    maps = map_list.get('data', []) if isinstance(map_list, dict) else []

    for m in maps:
        mid = m.get('id')
        name = m.get('name')
        if not mid:
            continue
        detail = sio.call('/v2/tarkov/iMGetMapDetail', {'id': mid, 'lang': 'zh'}, timeout=30)
        all_details[mid] = {
            'name': name,
            'raw': detail,
        }
        collect_urls(detail)
        print(f"DETAIL_OK {name} {mid}")

finally:
    try:
        sio.disconnect()
    except Exception:
        pass

(out_dir / 'maps_list.json').write_text(json.dumps(map_list, ensure_ascii=False, indent=2), encoding='utf-8')
(out_dir / 'maps_detail.json').write_text(json.dumps(all_details, ensure_ascii=False), encoding='utf-8')
(out_dir / 'maps_urls.txt').write_text('\n'.join(sorted(urls)), encoding='utf-8')

print(f"MAP_COUNT={len(maps)} URL_COUNT={len(urls)}")
