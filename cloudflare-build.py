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
allowed = {'.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp', '.txt', '.woff', '.woff2', '.pdf'}
files = [p for p in root.iterdir() if p.is_file() and p.suffix.lower() in allowed]
for folder in ['Estudos', 'Fotos de fisica', 'vendor']:
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
window.studyMaterialManifest=materials;
window.studyLoadMaterial=async function(value,signal){
  const url=new URL(value,location.href),base=new URL('./',location.href);
  const relative=url.origin===base.origin && url.pathname.startsWith(base.pathname)?decodeURIComponent(url.pathname.slice(base.pathname.length)):'';
  const item=materials[relative];
  if(!item){const response=await fetch(url,{signal});if(!response.ok)throw new Error('Material indisponível.');return response.arrayBuffer();}
  const buffers=[];
  for(const part of item.parts){const response=await fetch(new URL(part,base),{signal});if(!response.ok)throw new Error('Falha ao carregar o material.');buffers.push(await response.arrayBuffer());}
  const blob=new Blob(buffers);
  if(blob.size!==item.size)throw new Error('Material incompleto.');
  const data=await blob.arrayBuffer();
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!==item.sha256)throw new Error('Não foi possível verificar o material.');
  return data;
};
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
