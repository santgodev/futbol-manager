"""Package deliverables without source archives, portable runtimes, or bulky QA screenshots."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, json
from PIL import Image
root=Path(__file__).resolve().parents[1]
dest=root.parent
theme=root/'preciado-editorial'
shot=root/'verification/screenshots/1440-inicio.png'
with Image.open(shot) as im:
    top=im.crop((0,0,1440,1080));top.resize((1200,900),Image.Resampling.LANCZOS).save(theme/'screenshot.png')
    im.crop((0,0,1440,1000)).save(root/'verification/design-preview.png')
for source,pdf in [('Liderazgo-Financiero-Preciado-FyS-_-Presentacion.pdf','liderazgo-financiero.pdf'),('Presentacion-Taller-Sanar-para-crecer-crecer-para-liderar.pdf','sanar-para-crecer.pdf')]:
    original=dest/'source/wp-content/uploads/2025/01'/source
    copied=theme/'assets/documents'/pdf
    assert hashlib.sha256(original.read_bytes()).digest()==hashlib.sha256(copied.read_bytes()).digest(),pdf
with ZipFile(dest/'preciado-editorial-theme.zip','w',ZIP_DEFLATED) as z:
    for p in theme.rglob('*'):
        if p.is_file():z.write(p,p.relative_to(root).as_posix())
with ZipFile(dest/'preciado-redesign-project.zip','w',ZIP_DEFLATED) as z:
    for p in root.rglob('*'):
        if not p.is_file():continue
        rel=p.relative_to(root).as_posix()
        if '/screenshots/' in rel or '__pycache__' in rel or 'node_modules/' in rel:continue
        if rel.startswith('verification/') and p.suffix not in ['.json','.md']:continue
        if p.name in ['metrics.py','review_sheets.py','check-small.mjs']:continue
        z.write(p,'preciado-redesign/'+rel)
for name in ['preciado-editorial-theme.zip','preciado-redesign-project.zip']:
    p=dest/name
    with ZipFile(p) as z:
        assert z.testzip() is None
        assert not any('wp-config.php' in n or '.private/' in n for n in z.namelist())
        print(json.dumps({'file':name,'bytes':p.stat().st_size,'entries':len(z.namelist()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}))
