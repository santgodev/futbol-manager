from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from pypdf import PdfReader
root=Path('artifacts/education-redesign/source')
for p in root.rglob('*.pdf'):
 r=PdfReader(p)
 text='\n\n'.join(page.extract_text() or '' for page in r.pages)
 out=Path('artifacts/education-redesign')/(p.stem+'.txt')
 out.write_text(text,encoding='utf-8')
 print(p.name, len(r.pages), text[:24000])
files=[p for p in (root/'wp-content/uploads').rglob('*') if p.suffix.lower() in ['.jpg','.jpeg','.png','.webp'] and not __import__('re').search(r'-\d+x\d+\.',p.name)]
files+=list((root/'psicologia/wp-content/uploads/2024/08').glob('*935-507*.png'))[:4]
w=1000
canvas=Image.new('RGB',(w,((len(files)+4)//5)*155),'#eeeeee'); d=ImageDraw.Draw(canvas)
for i,p in enumerate(files):
 im=Image.open(p).convert('RGB'); im.thumbnail((190,120)); x=(i%5)*200;y=(i//5)*155
 canvas.paste(im,(x,y)); d.text((x,y+122),f'{i}: {p.name[:26]}', fill='black')
canvas.save('artifacts/education-redesign/contact-sheet.jpg')
Path('artifacts/education-redesign/image-index.json').write_text(__import__('json').dumps([str(p) for p in files]),encoding='utf-8')
