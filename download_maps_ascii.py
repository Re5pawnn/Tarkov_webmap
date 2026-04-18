import json
from pathlib import Path
from urllib.parse import urlparse
import requests
import re

root = Path(r'C:\Users\Administrator\Desktop\1')
out_dir = root / 'kaedeori_maps_ascii'
out_dir.mkdir(exist_ok=True)

data = json.loads((root / 'maps_detail.json').read_text(encoding='utf-8'))

session = requests.Session()
lines=[]
for mid, entry in data.items():
    d = entry['raw']['data']
    norm = d.get('normalizedName') or d.get('key') or mid
    norm = re.sub(r'[^A-Za-z0-9._-]+', '_', norm).strip('_') or mid
    for kind, url in [('svgPath', d.get('svgPath')), ('tilePath', d.get('tilePath'))]:
        if not url or '{z}' in url:
            continue
        ext = Path(urlparse(url).path).suffix or '.bin'
        out = out_dir / f"{norm}_{mid}_{kind}{ext}"
        try:
            r = session.get(url, timeout=20)
            if r.status_code == 200 and r.content:
                out.write_bytes(r.content)
                lines.append(str(out))
        except Exception:
            pass

(root / 'kaedeori_maps_ascii_downloaded.txt').write_text('\n'.join(lines), encoding='utf-8')
print('DOWNLOADED_ASCII', len(lines))
