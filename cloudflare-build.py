"""Build static StudyFlow without changing original study materials."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
out = root / 'cloudflare-dist'
if out.exists():
    raise SystemExit('Output already exists; use a fresh build directory.')
out.mkdir()
manifest = {}
limit = 20 * 1024 * 1024
allowed = {'.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp', '.txt', '.woff', '.woff2'}
files = [p for p in root.iterdir() if p.is_file() and p.suffix.lower() in allowed]
for folder in ['Estudos', 'Fotos de fisica']:
    if (root / folder).exists():
        files.extend(p for p in (root / folder).rglob('*') if p.is_file())
for source in files:
    if source.is_symlink() or not source.resolve().is_relative_to(root):
        raise SystemExit('Unsafe source path')
    relative = source.relative_to(root).as_posix()
    if source.stat().st_size <= 25 * 1024 * 1024:
        target = out / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        continue
    key = hashlib.sha256(relative.encode()).hexdigest()[:24]
    parts = []
    digest = hashlib.sha256()
    with source.open('rb') as handle:
        while data := handle.read(limit):
            digest.update(data)
            part = f'_materiais/{key}/{len(parts)}.bin'
            target = out / part
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            parts.append(part)
    manifest[relative] = {'parts': parts, 'size': source.stat().st_size, 'sha256': digest.hexdigest()}

script = r'''
(() => {
const materials = __MANIFEST__;
document.addEventListener('click', async event => {
  const link = event.target.closest('a[href]');
  if (!link || event.button !== 0) return;
  const url = new URL(link.href, location.href);
  const base = new URL('./', location.href);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  let relative;
  try { relative = decodeURIComponent(url.pathname.slice(base.pathname.length)); } catch { return; }
  const item = materials[relative];
  if (!item) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const pdf = relative.toLowerCase().endsWith('.pdf');
  const preview = pdf ? window.open('about:blank', '_blank') : null;
  if (preview) preview.document.body.textContent = 'Preparando seu PDF…';
  const old = link.textContent;
  link.textContent = 'Preparando material…';
  try {
    const buffers = [];
    for (const part of item.parts) {
      const response = await fetch(new URL(part, base));
      if (!response.ok) throw new Error('Falha ao carregar o material.');
      buffers.push(await response.arrayBuffer());
    }
    const blob = new Blob(buffers, {type: pdf ? 'application/pdf' : 'application/octet-stream'});
    if (blob.size !== item.size) throw new Error('Download incompleto.');
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())), b => b.toString(16).padStart(2, '0')).join('');
    if (hash !== item.sha256) throw new Error('Não foi possível verificar o material.');
    const objectURL = URL.createObjectURL(blob);
    if (preview && !preview.closed) preview.location.href = objectURL;
    else {
      const download = document.createElement('a');
      download.href = objectURL;
      download.download = relative.split('/').pop();
      download.click();
    }
    setTimeout(() => URL.revokeObjectURL(objectURL), 3600000);
  } catch (error) {
    if (preview && !preview.closed) preview.close();
    alert('Não consegui abrir o material. Tente novamente. ' + error.message);
  } finally { link.textContent = old; }
}, true);
})();
'''.replace('__MANIFEST__', json.dumps(manifest, ensure_ascii=True))
(out / 'materiais-grandes.js').write_text(script, encoding='utf-8')
index = out / 'index.html'
index.write_text(index.read_text(encoding='utf-8').replace('</body>', '<script src="materiais-grandes.js"></script></body>'), encoding='utf-8')
(out / '_headers').write_text('/*\n  Cache-Control: no-cache, must-revalidate\n', encoding='utf-8')
published = list(p for p in out.rglob('*') if p.is_file())
assert len(published) <= 20000
assert all(p.stat().st_size <= 25 * 1024 * 1024 for p in published)
print(f'Build ready: {len(published)} files; {len(manifest)} large materials preserved.')