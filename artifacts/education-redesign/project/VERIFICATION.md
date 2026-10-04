# Verificación y límites

Revisión final: 27 de septiembre de 2026.

## Resultados de la vista previa

- `node scripts/build.mjs`: 29 páginas generadas correctamente.
- `node scripts/serve.mjs`: servidor local en `http://127.0.0.1:4175/`.
- `node scripts/check.mjs`: **87 comprobaciones de página/viewport** (29 × 1440, 768 y 390 píxeles).
- **179 referencias internas** comprobadas: rutas locales, recursos y anclas existentes.
- **0 errores de consola**, **0 imágenes rotas**, **0 desbordamientos horizontales** en esos anchos.
- Comprobación adicional de las 29 páginas a 320 píxeles: sin desbordamientos horizontales.
- Un H1 por página, títulos únicos y descripciones presentes, atributos alternativos en imágenes, sin marcadores de plantilla sin resolver.
- Menú móvil abierto/cerrado, Escape, enlace de salto por teclado, filtro de talleres/promociones, búsqueda de archivo y estado vacío, despliegue de presentación original y preferencia de movimiento reducido: correctos.
- Capturas completas de las 29 páginas a 1440 y 390 px revisadas; correcciones aplicadas al favicon, transparencias de PNG y retrato de Sindy.

`verification/report.json` guarda el resultado por ruta. No se verificó entrega de mensajes a terceros ni se enviaron formularios o WhatsApp.

## Rendimiento de medios

Las 116 imágenes seleccionadas ocupaban **150.513.161 bytes** en sus archivos fuente. Las versiones WebP grandes ocupan **9.488.386 bytes**: reducción del **93,7 %** de ese conjunto. Se generaron versiones pequeñas adicionales por **2.768.178 bytes**. No es una puntuación Lighthouse ni una medición de velocidad de producción. Cada página carga solo sus imágenes y usa tamaños adaptables/carga diferida.

Los dos PDF fueron copiados sin modificación; se comprobaron sus hashes al empaquetar. No se agregaron fuentes web, imágenes remotas ni animaciones pesadas.

## PHP

Se descargó PHP 8.5.11 NTS desde php.net y se verificó SHA-256:

`0ea96e0d2b9b737a6036f05cf4e95c49313faa6d0f27bd97edb2742503f0c043`

El runtime Visual C++ del sistema era incompatible. Se usaron DLL locales del runtime de trabajo junto al ejecutable portátil, sin instalar ni modificar componentes del sistema.

Comando ejecutado para cada archivo:

```powershell
php.exe -n -l <archivo.php>
```

**6 archivos PHP sin errores de sintaxis**: functions, header, footer, page, page-recovered e import-recovery.

## Lo que no se pudo verificar

- Ejecución completa de WordPress/MySQL, activación del tema e importador contra una base real: el ZIP no incluye las bases y no hay MySQL disponible.
- Compatibilidad en ejecución de los formularios, correos, compras, registro y Theme Builder originales: faltan sus datos/configuración. Los puntos de integración se mantienen en el código, pero no equivale a una prueba de extremo a extremo de esos servicios.
- Inventario de todas las URL originales, su contenido completo, canonical de producción y redirecciones: no se pueden reconstruir solo con archivos de WordPress.
- Vigencia comercial de fechas, precios, acreditaciones y promociones: se preserva la información suministrada, no se confirma su actualidad.

No se ejecutó el build ni se alteró código del proyecto Next.js arena-saas, que es independiente del sitio WordPress del ZIP. No se desplegó el rediseño.
