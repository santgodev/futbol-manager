from pathlib import Path
from PIL import Image, ImageDraw
root=Path('artifacts/education-redesign/project/verification/screenshots')
for width in [1440,390]:
 files=sorted(root.glob(f'{width}-*.png'))
 for offset in range(0,len(files),8):
  group=files[offset:offset+8]; canvas=Image.new('RGB',(1600,1000),'#d8d8d8'); draw=ImageDraw.Draw(canvas)
  for i,p in enumerate(group):
   im=Image.open(p); im.thumbnail((385,930)); x=i%4*400;y=i//4*500
   im.thumbnail((385,460)); canvas.paste(im,(x,y+30));draw.text((x+5,y+6),p.stem[:48],fill='black')
  canvas.save(root.parent/f'contact-{width}-{offset//8+1}.jpg')
