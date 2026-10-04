from pathlib import Path
import re, urllib.request
from fontTools import subset
root=Path('artifacts/education-redesign/project'); folder=root/'preciado-editorial/assets/fonts'; css=(folder/'google-original.css').read_text(encoding='utf-8-sig')
out=[]
for block in re.findall(r'@font-face\s*\{(.*?)\}',css,re.S):
 family=re.search(r"font-family: '([^']+)'",block).group(1); style=re.search(r'font-style: (\w+)',block).group(1);weight=re.search(r'font-weight: (\d+)',block).group(1)
 if family=='Manrope' and weight not in ['400','600']:continue
 if family=='Newsreader' and weight!='400':continue
 url=re.search(r'url\(([^)]+)\)',block).group(1);name=f'{family.lower()}-{style}-{weight}'
 temp=root.parent/'versions'/f'{name}.ttf';urllib.request.urlretrieve(url,temp)
 options=subset.Options(); options.flavor='woff2';font=subset.load_font(str(temp),options)
 sub=subset.Subsetter(options=options);sub.populate(unicodes=list(range(0x20,0x250))+list(range(0x2000,0x2070))+[0x20ac,0x2192,0x2197]);sub.subset(font)
 subset.save_font(font,str(folder/f'{name}.woff2'),options)
 out.append(f"@font-face{{font-family:'{family}';font-style:{style};font-weight:{weight};font-display:swap;src:url('./{name}.woff2') format('woff2')}}")
for family in ['manrope','newsreader']:
 urllib.request.urlretrieve(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt',folder/f'{family}-OFL.txt')
(folder/'fonts.css').write_text('\n'.join(out),encoding='utf-8')
print([(p.name,p.stat().st_size) for p in folder.glob('*.woff2')])
