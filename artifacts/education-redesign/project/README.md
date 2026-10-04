# Preciado — rediseño editorial

Entrega: **29 páginas navegables reconstruidas con el contenido recuperable**, un **tema hijo de Hello Elementor** y **116 imágenes originales optimizadas**. No se migró el sitio a Next.js ni se modificó arena-saas. No se publicaron cambios en internet.

## Abrir el resultado

Desde esta carpeta, con Node.js instalado:

```powershell
npm run preview
```

Abre http://127.0.0.1:4175/ en el navegador. La vista previa contiene HTML completo y funciona sin PHP, WordPress, base de datos, cuenta o instalación de dependencias. `preview/` es un resultado de revisión, no una migración del CMS. Está marcado `noindex,nofollow` intencionadamente.

Para regenerar después de editar contenido o plantillas:

```powershell
npm run build
```

`content.json` contiene los textos recuperados y la correspondencia de imágenes. `scripts/build.mjs` genera **los mismos fragmentos** que consume el tema, además de la vista previa. Los estilos y el JavaScript son compartidos, no dos implementaciones diferentes.

No necesitas volver a procesar imágenes: las derivadas ya están incluidas. El script opcional `scripts/prepare.py` requiere Python/Pillow y los directorios originales `wp-content/uploads` y `psicologia/wp-content/uploads` bajo `../source/` respecto a esta carpeta; esa copia de trabajo no se duplica en la entrega.

## Alcance real y faltantes

El ZIP original tiene dos WordPress (`/` y `/psicologia/`) pero **no contiene sus bases de datos**. No se pueden recuperar ni enumerar todas las páginas originales, sus slugs, textos de artículos, menús ni acciones de formularios. Los 29 documentos son una reconstrucción verificable de los materiales disponibles, **no una certificación de restauración completa del sitio original**.

`preciadofys.com`, identificado en los PDF, no respondió a la consulta. El usuario no dispone de SQL ni de otras URL. La auditoría completa se entrega en `AUDIT.md`, junto con el inventario del ZIP.

Se conservan precios, fechas y promociones con avisos de archivo/vigencia. Los números, correo y canal YouTube proceden de las piezas suministradas. Los enlaces WhatsApp/teléfono/correo se construyen sobre esos datos verificados; no son una recuperación de los destinos desconocidos de los formularios. No se añadió formulario de envío ficticio. Las portadas de artículos permanecen accesibles, sin inventar sus artículos.

## Qué cambió

Consulta `page-summary.md` para la lista **página por página** y `CONTENT-SOURCES.md` para la procedencia de cada pieza. Inicio, catálogo de formación, psicología, nosotros, recursos, libros, contacto y archivo visual comparten navegación y pie. Cada curso, taller, terapia, libro y promoción tiene su propia ficha; Kids conserva las fotografías del espacio.

## Sistema visual

- Marfil `#f6f4ed`, tinta `#202f35`, verde `#29493e`, salvia `#e1e8dd` y arcilla `#91513c`. Psicología usa una variante verde más suave.
- Georgia en títulos y Arial en lectura/interfaz: contraste editorial sin descargas de fuentes ni dependencias externas.
- Retícula de 1440 px, márgenes fluidos, escala tipográfica adaptable, reglas finas y botones comunes.
- Las fotografías originales admiten encuadre CSS; las piezas con texto se muestran completas para preservar la información. No se usaron fotos nuevas de stock ni imágenes generadas.
- Movimiento limitado a interacción; alternativa `prefers-reduced-motion`, enlaces de salto, foco visible, menú con Escape y navegación por teclado. El contenido permanece disponible sin JavaScript.

Referencias e interpretación de la investigación en `AUDIT.md`: The School of Life, Aesop y Pentagram. No se copió una plantilla ni se inventaron testimonios.

## WordPress

El ZIP instalable es `preciado-editorial-theme.zip` (junto al paquete del proyecto). Requiere **Hello Elementor** en `wp-content/themes/hello-elementor`, incluido en el ZIP original. No modifica el tema padre, WordPress ni plugins. Elementor/Elementor Pro siguen siendo dependencias de las páginas y formularios originales cuando se restaure la base de datos; las páginas recuperadas no necesitan Elementor Pro.

1. Instala y activa Hello Elementor y después Preciado Editorial en una copia de prueba.
2. Para contenido original restaurado, asigna el menú original a «Preciado — Navegación principal». El tema respeta las ubicaciones de cabecera/pie/single de Elementor Theme Builder y llama a `the_content()`, `wp_head()`, `wp_footer()` y `wp_body_open()`.
3. Para importar las páginas reconstruidas, usa WP-CLI. La primera orden solo simula; la segunda crea **borradores**, sin reemplazar páginas, sin publicar y sin cambiar la portada:

```sh
wp eval-file /ruta/al/proyecto/scripts/import-recovery.php
wp eval-file /ruta/al/proyecto/scripts/import-recovery.php apply main
```

En la instalación separada `/psicologia/`:

```sh
wp eval-file /ruta/al/proyecto/scripts/import-recovery.php apply psychology
```

`apply all` sirve para un WordPress de prueba vacío que reúna todas las propuestas. No debe usarse para sustituir ambas instalaciones originales. El importador salta rutas existentes y es repetible sin duplicar los borradores ya creados. Debe revisarse cualquier colisión señalada.

4. Revisa los borradores y asigna la portada recuperada desde Ajustes → Lectura cuando proceda. Los fragmentos de recuperación se mantienen en `content.json` y `scripts/build.mjs`; el editor de WordPress no modifica esas fichas. Las páginas originales conservan su propio editor y contenido.
5. Los enlaces de las páginas importadas se resuelven por ID mediante la opción `preciado_recovery_pages`, de modo que un cambio posterior de permalink sea respetado. Para vincular páginas originales con rutas diferentes, configura `preciado_route_urls` (mapa clave de recuperación → URL real); `preciado_main_url` permite definir el origen de la instalación principal cuando sea necesario.

Las rutas nuevas son **propuestas**. No se inventaron redirecciones 301: falta el mapa de URL original. Se entrega `redirects.csv` vacío con encabezados para completarlo al recuperarlo. No se modificaron las reglas `.htaccess` suministradas.

## SEO y rendimiento implementados

- Un H1, títulos y descripciones específicos en las 29 páginas; contenido HTML rastreable, enlaces internos y nombres alternativos de imágenes.
- En WordPress se conserva `rel_canonical()` del núcleo y el sitemap del núcleo; no se crea un canonical de dominio inventado. La vista previa está excluida de indexación.
- Descripciones y Open Graph de respaldo para páginas recuperadas, omitiéndolos si existe Yoast, Rank Math, AIOSEO, SEOPress o The SEO Framework. Esquema `WebPage` solo para páginas recuperadas publicadas. Sin reseñas, acreditaciones ni ofertas estructuradas inventadas.
- Dos tamaños WebP por imagen cuando hay resolución suficiente, `srcset`, dimensiones, carga diferida y prioridad de la imagen principal. Los PDF permanecen idénticos al original. Las transparencias se conservan.
- Sin fuentes remotas, librerías de animación, framework de frontend ni solicitudes a CDNs. JavaScript diferido y CSS compartido. El archivo visual carga imágenes de forma diferida en uso normal.

## Verificación

Consulta `VERIFICATION.md` y `verification/report.json` para resultados reales y límites. Las capturas de cada página en escritorio y móvil quedan en `verification/screenshots/` en la carpeta de trabajo (no se duplican en el ZIP de entrega para reducir su tamaño).

Para repetir la comprobación de navegador, con Google Chrome instalado y la vista previa ejecutándose:

```powershell
npm install
npm run check
```

Playwright solo es una dependencia de desarrollo. Ni el tema ni la vista previa lo necesitan para funcionar.

## Lo que requiere información del propietario

- Confirmar vigencia de tarifas de psicología, fechas de formación y promociones antes de publicar.
- Recuperar desde el hosting, si todavía existe, las bases de datos para preservar **todas** las páginas, artículos, formularios y sus acciones exactas. Si no se recuperan, se necesitarán esos textos y destinos para completar esa parte.
- Aclarar la identidad fiscal antes de añadir datos legales al pie: los dos PDF incluyen NIT diferentes; ambos documentos se conservaron y no se eligió uno arbitrariamente.

No hace falta resolver estos puntos para abrir y revisar las 29 páginas entregadas.
