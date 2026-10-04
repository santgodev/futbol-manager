from pathlib import Path
from PIL import Image
import json
root=Path('artifacts/education-redesign/project'); data=json.loads((root/'content.json').read_text(encoding='utf-8'))
source=root.parent/'source'; imgs=root/'preciado-editorial/assets/images'
original=sum((source/m['source']).stat().st_size for m in data['media'])
large=sum((root/'preciado-editorial/assets'/m['file']).stat().st_size for m in data['media'])
small=sum((root/'preciado-editorial/assets'/m['small']).stat().st_size for m in data['media'])
print(json.dumps(dict(original_image_bytes=original,large_webp_bytes=large,small_webp_bytes=small,reduction_percent=round((1-large/original)*100,1))))
(root/'verification/image-metrics.json').write_text(json.dumps(dict(original_image_bytes=original,large_webp_bytes=large,small_webp_bytes=small,reduction_percent=round((1-large/original)*100,1)),indent=2))
for name in ['1440-inicio','390-inicio','390-psicologia','390-formacion--sanar-para-crecer']:
 p=root/'verification/screenshots'/f'{name}.png'
 im=Image.open(p); im.crop((0,0,im.width,min(1000,im.height))).save(root/'verification'/f'{name}-top.png')
