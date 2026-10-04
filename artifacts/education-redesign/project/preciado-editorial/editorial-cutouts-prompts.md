# Recortes para las tarjetas editoriales

Generados con image_gen integrada, a partir de las imágenes studio-v1. Los PNG conservan transparencia real; las versiones WebP conservan el canal alfa y se usan en la web.

Archivos en next-app/public/assets/images/:
- psicologia-editorial-v1.png y .webp
- formacion-editorial-v1.png y .webp
- asesorias-editorial-v1.png y .webp

Prompt aplicado por separado a cada retrato:

```text
Use case: background-extraction. Edit target: the supplied studio portrait. Remove ONLY the gray studio background and output a real transparent RGBA PNG. Preserve the exact original people, every face, expression, skin texture, hair, clothing, jewelry, lighting, pose and proportions pixel-faithfully. Do not redraw, retouch, beautify, relight or replace any person. Keep the original 4:3 canvas and exact subject placement and scale, with the same amount of transparent padding that the original gray background occupied. Preserve all people when there are two, all hair strands and shoulder edges. Full opaque people, naturally antialiased clean alpha edges. No background, no drop shadow, no glow, no text, no new objects. This cutout will be composited over a website background; transparent must be actual alpha, never checkerboard painted pixels.
```

