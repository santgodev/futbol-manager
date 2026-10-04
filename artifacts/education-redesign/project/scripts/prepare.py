"""Prepare recoverable, source-attributed content and resized derivatives. Originals stay untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import json, re, shutil, hashlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / 'source'
THEME = ROOT / 'preciado-editorial'
ASSETS = THEME / 'assets' / 'images'
ASSETS.mkdir(parents=True, exist_ok=True)
media = []
lookup = {}
for path in sorted(SOURCE.rglob('*')):
    if '/uploads/' not in path.as_posix() or path.suffix.lower() not in ['.jpg','.jpeg','.png','.webp'] or re.search(r'-\d+x\d+\.',path.name):
        continue
    if 'placeholder' in path.name:
        continue
    rel = path.relative_to(SOURCE).as_posix()
    key = hashlib.sha256(rel.encode()).hexdigest()[:12]
    with Image.open(path) as original:
        im = ImageOps.exif_transpose(original).convert('RGBA' if 'A' in original.getbands() or 'transparency' in original.info else 'RGB')
        im.thumbnail((1600,1800),Image.Resampling.LANCZOS)
        width,height=im.size
        im.save(ASSETS/f'{key}.webp',quality=88,method=6)
        small=im.copy(); small.thumbnail((640,720),Image.Resampling.LANCZOS)
        small.save(ASSETS/f'{key}-small.webp',quality=83,method=6)
    item=dict(id=key,source=rel,file=f'images/{key}.webp',small=f'images/{key}-small.webp',width=width,height=height,title=path.stem.replace('-',' ').replace('_',' ').strip())
    media.append(item); lookup[rel]=item

def main(path): return lookup['wp-content/uploads/'+path]['id']
def psych(path): return lookup['psicologia/wp-content/uploads/2024/08/'+path]['id']
assets=dict(hero=main('2024/04/beautiful-sensitive-hands-concept-scaled.jpg'),logo=main('2024/04/Logo-de-color.png'),sindy=main('2024/05/Imagen2-e1714935765528.jpg'),couple=main('2024/05/sindy.png'),leadership=main('2025/01/Copia-de-Sanar-para-crecer-crecer-para-liderar.png'),growth=main('2025/01/Sanar-para-crecer-crecer-para-liderar.png'),presentation=psych('Presentacion-Sindy-Diaz-935-507.png'))
pages=[]
def add(slug,title,category,img,paragraphs=None,**kw):
    pages.append(dict(slug=slug,title=title,category=category,image=img,paragraphs=paragraphs or [],**kw))

bio='Teólogo, Mg. en recursos digitales aplicados a la educación, Esp. en Liderazgo, Esp. en Didáctica y Tic. Director del Seminario Bíblico Internacional Berea y Fundador de Preciado Formación y Soluciones. Contamos con el respaldo de Maxwell Leadership, la empresa del autor y conferencista más reconocido a nivel mundial, John Maxwell.'
add('formacion/liderazgo-financiero','Finanzas desde una perspectiva bíblica.','Formación',assets['leadership'],['1 Sesión: El plan financiero de Dios para tu vida.','2 Sesión: Manejo de deudas.','3 Sesión: Cómo aumentar mis ingresos.'],subtitle='Liderazgo Financiero',facilitator='Fabián Preciado',bio=bio,mode='Virtual & Presencial.',pdf='liderazgo-financiero.pdf',sourceImage=main('2025/01/Liderazgo-Financiero-Preciado-FyS-_-Presentacion-pdf.jpg'))
add('formacion/sanar-para-crecer','Sanar para crecer, crecer para liderar','Taller',assets['growth'],['Sanar para crecer: Los líderes reconocerán la importancia de abordar y sanar heridas emocionales y resentimientos del pasado como un paso fundamental para construir un liderazgo saludable, que fomente relaciones positivas y una influencia constructiva en sus entornos personales, familiares y en la iglesia.','Crecer para liderar: Los líderes identificarán la necesidad de un crecimiento personal continuo como base para un liderazgo efectivo, enfocándose en el desarrollo del carácter, la práctica de valores sólidos y el fortalecimiento de habilidades clave que les permitan influir positivamente y liderar con integridad.'],facilitator='Fabián y Sindy Preciado',bio='Pastores y educadores; fundadores de Preciado Formación y Soluciones, Directores del Seminario Bíblico Internacional Berea.',mode='Virtual & Presencial.',pdf='sanar-para-crecer.pdf',sourceImage=main('2025/01/Presentacion-Taller-Sanar-para-crecer-crecer-para-liderar-pdf.jpg'))
add('formacion/liderazgo-personal','Curso gratuito de Liderazgo Personal','Promoción',main('2024/07/Curso-Gratuito-935-x-507-px.png'),['Impartido por Fabián Preciado, con la metodología y respaldo de Maxwell Leadership.','Desarrollo de liderazgo · Manejo de relaciones · Finanzas','Jueves 18, 25 de julio y 01 de agosto. 8:00 p.m.'],price='Gratuito',mode='¡VIRTUAL!',archived=True)
add('formacion/semana-liderazgo-financiero','Semana de Liderazgo Financiero','Promoción',main('2024/08/Semana-de-Liderazgo-Financiero-935-507.png'),['Impartido por Fabián Preciado, con la metodología y respaldo de Maxwell Leadership.','Lunes 26 al viernes 30 de agosto','8:00 p.m. (Hora Colombia)'],price='47.000 Pesos Colombianos.',mode='¡VIRTUAL!',archived=True)
add('formacion/liderazgo-10','Liderazgo 10','Formación',main('2025/05/Portada-pagina-web.png'),['Jueves 6:00 p.m.'],archived=True)
for slug,title,img,price in [('individual','Terapia individual','Terapia-individual-_-935-507-.png','$ 80.000'),('de-parejas','Terapia de parejas','Terapia-de-parejas-_-935-507-.png','$ 150.000'),('familiar','Terapia familiar','Terapia-familiar-_-935-507.png','$ 250.000'),('comportamental','Terapia Comportamental','Terapia-Comportamental_-935-507-.png','$ 90.000')]:
    add('psicologia/terapia-'+slug,title,'Psicología',psych(img),[],price=price,mode='Modalidad virtual',facilitator='Sindy Díaz. Psicóloga',bio='T.P. 109077 · Universidad Incca',sourceImage=assets['presentation'],phone='573145445807',priceNote='Inversión indicada en la presentación original. Consulta la tarifa y disponibilidad actuales.')
add('jovenes/impacto-juvenil','Impacto Juvenil','Jóvenes',main('2025/09/POST-INSTAGRAM-.png'),['Temas: Fracaso · Autoestima · Liderazgo','Octubre y noviembre'],archived=True)
add('recursos/inteligencia-emocional','Cómo desarrollar inteligencia emocional en el liderazgo.','Blog',main('2025/03/inteligencia-emocional.png'),[],incomplete=True)
add('recursos/finanzas-2025','10 principios para administrar tus finanzas en este 2025','Blog',main('2025/01/10-principios-para-adm.png'),[],incomplete=True)
add('recursos/necesidades-gustos-y-caprichos','Cómo diferenciar necesidades, gustos y caprichos.','Blog',main('2025/01/presupuesto-familiar-2.png'),['Un enfoque para administrar mejor tus finanzas.'],incomplete=True)
add('recursos/la-ley-del-espejo','La ley del espejo','Blog',main('2025/02/Copia-de-La-ley-del-espejo-1900-x-556-px.png'),[],incomplete=True)
add('libros/31-principios-para-crecer','31 principios para crecer','Libros',main('2025/09/b541a7bc-211c-4b41-b83f-bc6234d58181.png'),['Fabián Preciado'])
add('libros/vive-tu-llamado','Vive tu llamado','Libros',main('2025/01/Vive-tu-llamado.jpg'),['Fabián Preciado'])
add('podcast','Preciado Podcast.','Podcast',main('2024/10/Preciado-Podcats-935-x-507-px.png'),['Por: Fabián Preciado.'],external='https://www.youtube.com/@preciadofys',externalLabel='YouTube @preciadofys')
add('kids','Preciados Kids','Kids',main('2025/01/Preciados-Kids-1.png'),[],gallery=[main('2025/02/frente-kids.jpeg'),main('2025/02/WhatsApp-Image-2025-02-11-at-10.20.18-AM.jpeg'),main('2025/02/WhatsApp-Image-2025-02-11-at-10.20.18-AM-1.jpeg')])
add('jovenes','Preciados Jóvenes','Jóvenes',main('2025/01/Jovenes-preciado.png'),[],related=['jovenes/impacto-juvenil'])
add('conferencias','Conferencias','Formación',main('2025/01/Conferencias-1.png'),[],related=['formacion/liderazgo-financiero','formacion/sanar-para-crecer'])
add('cafe','Café','Materiales',main('2025/01/Cafe-1.jpg'),[],gallery=[main('2025/01/Cafe-2.jpg')])

docs=THEME/'assets/documents'; docs.mkdir(parents=True,exist_ok=True)
for source,dest in [('Liderazgo-Financiero-Preciado-FyS-_-Presentacion.pdf','liderazgo-financiero.pdf'),('Presentacion-Taller-Sanar-para-crecer-crecer-para-liderar.pdf','sanar-para-crecer.pdf')]:
    shutil.copy2(SOURCE/'wp-content/uploads/2025/01'/source,docs/dest)
data=dict(brand='Preciado Formación y Soluciones',tagline='Te ayudamos a crecer integralmente.',assets=assets,media=media,pages=pages,bio=bio,sindyBio='Esposa, mamá y pastora; especialista en gestión educativa. Capellana del Seminario Bíblico Internacional Berea y fundadora junto a su esposo de Preciado FyS (Formación y Soluciones)')
(ROOT/'content.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'{len(media)} original images prepared; {len(pages)} detail pages; 2 unchanged PDFs.')
