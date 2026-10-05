"""Run after CSS or JS edits so a new page never reuses outdated assets."""
from pathlib import Path
from hashlib import sha256
import re

root = Path(__file__).resolve().parents[1]
page = root / 'index.html'
html = page.read_text()
for name in ('style.css', 'mobile.css', 'app.js'):
    version = sha256((root / name).read_bytes()).hexdigest()[:12]
    pattern = r'(href|src)="' + re.escape(name) + r'(?:\?[^\"]*)?"'
    html, count = re.subn(pattern, lambda m: f'{m[1]}="{name}?v={version}"', html)
    if count != 1:
        raise ValueError(f'Expected exactly one reference to {name}, found {count}')
page.write_text(html)
