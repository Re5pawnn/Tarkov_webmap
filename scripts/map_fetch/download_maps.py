import json
from pathlib import Path
from urllib.parse import urlparse
import requests

root = Path(r'C:\Users\Administrator\Desktop\1')
out_dir = root / 'kaedeori_maps'
out_dir.mkdir(exist_ok=True)

data = json.loads((root / 'maps_detail.json').read_text(encoding='utf-8'))

url_entries = []
for mid, entry in data.items():
    name = entry.get('name')
    d = entry['raw']['data']
    if d.get('svgPath'):
        url_entries.append((name, mid, 'svgPath', d['svgPath']))
    if d.get('tilePath'):
        url_entries.append((name, mid, 'tilePath', d['tilePath']))
    for idx, ly in enumerate(d.get('layers') or []):
        if isinstance(ly, dict) and ly.get('tilePath'):
            lname = ly.get('name') or f'layer{idx}'
            url_entries.append((name, mid, f'layer:{lname}', ly['tilePath']))

# Save manifest
manifest = []
for name, mid, kind, url in url_entries:
    manifest.append({'mapName': name, 'mapId': mid, 'kind': kind, 'url': url})
(root / 'kaedeori_maps_manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')

# Download direct files only (non-template URLs)
session = requests.Session()
downloaded = []
for item in manifest:
    url = item['url']
    if '{z}' in url or '{x}' in url or '{y}' in url:
        continue
    if not (url.endswith('.svg') or url.endswith('.jpg') or url.endswith('.png') or url.endswith('.webp')):
        continue
    p = urlparse(url)
    fn = Path(p.path).name
    safe_name = item['mapName'].replace('/', '_').replace(' ', '_')
    out = out_dir / f"{safe_name}__{fn}"
    try:
        r = session.get(url, timeout=20)
        if r.status_code == 200 and r.content:
            out.write_bytes(r.content)
            downloaded.append(str(out))
    except Exception:
        pass

(root / 'kaedeori_maps_downloaded.txt').write_text('\n'.join(downloaded), encoding='utf-8')
print(f'MANIFEST={len(manifest)} DOWNLOADED={len(downloaded)}')
