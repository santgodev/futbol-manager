# Auditoría de public_html.zip

Revisión: 26 de septiembre de 2026. Se enumeraron las 23.257 entradas (640.091.442 bytes descomprimidos) antes de implementar. El inventario completo está en `zip-inventory.json`.

## Tecnología y contenido

| Instalación | WordPress | Elementor | Tema disponible | Medios |
|---|---|---|---|---|
| `/` | 6.5.12 | 3.20.3 + Pro | Hello Elementor 3.0.1; Twenty Twenty Two/Three/Four | 452 archivos |
| `/psicologia/` | 6.6.5 | 3.23.4 + Pro | Hello Elementor; Twenty Twenty Two/Three/Four | 123 archivos |

Los temas instalados no demuestran cuál estaba activo: esa opción está en la base de datos. La presencia de CSS generado confirma uso de Elementor en psicología (IDs 6, 7, 46; no demuestra sus títulos ni URLs). Hay estilos de un formulario Elementor y botones WhatsApp, pero no sus acciones, campos completos ni destinatarios. Plugins adicionales: Hostinger, Image Optimization en principal y LiteSpeed Cache en psicología.

Contenido recuperable: identidad Preciado Formación y Soluciones; fotografías de Fabián y Sindy; presentación y tarifas de Sindy Díaz; terapia individual, de parejas, familiar y comportamental; liderazgo financiero y taller Sanar para crecer; promociones de liderazgo personal y financiero; Liderazgo 10; Kids, jóvenes, Impacto Juvenil; libros; podcast; portadas de blog; valores; café y fotografías del espacio. Dos PDF originales contienen programas, biografías, modalidades y contactos.

## Faltantes comprobados

- No hay dump SQL de contenido. Los únicos `.sql` pertenecen a estructuras internas de LiteSpeed, no contienen páginas.
- No hay WXR/XML de contenido, exportación Elementor de páginas ni caché HTML del sitio. Los HTML hallados corresponden al software/plugins.
- Faltan títulos, slugs, texto de páginas y artículos, menú, configuración activa, acciones de formularios, enlaces de inscripción/compra y metadatos guardados en WordPress.
- No se puede enumerar la totalidad de páginas originales ni diagnosticar sus enlaces rotos sin esa información. No se confunden nombres de imágenes con URLs verificadas.
- `preciadofys.com`, identificado dentro de los PDF, no se pudo recuperar: web no accesible y conexión HTTPS agotada. El usuario confirma no disponer de base de datos ni URLs adicionales.
- No hay PHP, MySQL ni Docker en el PATH local. El proyecto `arena-saas` abierto es otro proyecto Next.js y no es el sitio del ZIP; no se modifica.

## Decisión de implementación

Tema hijo de Hello Elementor, sin migración de WordPress; sistema visual compartido para contenido original restaurado y páginas reconstruidas con evidencia. Vista previa estática generada con los mismos fragmentos HTML/CSS/JS del tema para revisar los materiales recuperados sin base de datos. Rutas adicionales propuestas, nunca presentadas como rutas originales verificadas. No se inventan formularios, pasarelas, reseñas ni artículos. Los contactos nuevos enlazan exclusivamente a números/correo presentes en materiales originales; no se afirma haber restaurado acciones de formularios desconocidas.

Promociones históricas y precios se conservan junto a su contexto de archivo. Tarifas de psicología se transcriben de la presentación, sin asegurar vigencia. Los NIT de los PDF difieren y se conservan en sus documentos originales sin elegir uno como identificador legal del sitio.

## Dirección visual e investigación

- [The School of Life — Articles](https://www.theschooloflife.com/articles/): jerarquía por temas y lectura editorial; aplicación: navegación y catálogo legibles.
- [Aesop — Philosophy on design](https://www.aesop.com/philosophy-on-design.html): respeto por el contexto y materiales existentes; aplicación: fotografías reales, superficies cálidas, contención.
- [Pentagram — Education](https://www.pentagram.com/education): identidad consistente entre soportes; aplicación: una retícula y tipografía comunes con acentos por área.

Estas son interpretaciones de investigación, no una copia de diseños. Marfil, tinta azul, verde salvia y arcilla; serif editorial de sistema y sans de sistema, sin descarga de fuentes; reglas finas, márgenes amplios y fotografías con encuadre CSS. Se preservan completas las piezas con texto para no recortar ofertas o información.
