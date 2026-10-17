# Skills de contenido · Norte Palentino

Skills de Claude para que el editor (Pablo) mantenga y amplíe el contenido de la web desde Claude. Cada skill enseña **un proceso**; para leer y escribir en el CMS se apoyan en la extensión **Norte Palentino CMS** (`cms-mcp/`), que ya pasa por las validaciones, los redirects y la revalidación de la web.

Las reglas comunes (no inventar datos, tono, formato de los campos, publicar solo si se pide) viven en `cms-mcp/src/instructions.mjs` y Claude las recibe siempre que la extensión está conectada. Las skills no las repiten: solo añaden lo propio de su proceso.

| Skill | Para qué | Estado |
| :-- | :-- | :-- |
| [`investigar-ficha`](investigar-ficha/SKILL.md) | Datos verificados de negocios, rutas y recursos: ficha nueva, reverificación e inventario | Definida |
| `redactar-ficha` | Resumen, descripción y FAQs en ES y EN de fichas, municipios y landings | Pendiente |
| `escribir-articulo` | Artículos del blog orientados a una búsqueda y enlazados al directorio | Pendiente |
| `plan-editorial` | Qué hacer a continuación: huecos, listados por desbloquear, fichas sin EN | Pendiente |
| `revisar-publicacion` | Checklist antes de publicar y publicación con confirmación | Pendiente |
| `mantenimiento` | Revisión periódica: verificaciones caducadas, webs caídas, borradores olvidados | Pendiente |

Flujo típico de una ficha: `investigar-ficha` → `redactar-ficha` → `revisar-publicacion`. `plan-editorial` y `mantenimiento` generan trabajo para las demás.

## Decisiones de contenido

- **Fuentes** (de más a menos fiable): web propia, fuentes oficiales y, solo para dirección, teléfono y horario sin web propia, la ficha de Google Business. Portales como TripAdvisor o Booking sirven de pista, nunca de fuente.
- **Cifras de rutas**: fuente oficial, track del editor o, en último lugar, Wikiloc y blogs de montaña citando la página. Nunca estimadas.
- **Coordenadas**: de la fuente o del pin que pega el editor. Nunca geocodificadas a partir de la dirección.
- **`fecha_verificacion`**: el día en que Claude leyó la fuente. El editor revisa la tabla de datos antes de guardar y es quien publica.

## Instalación

Pendiente: se empaquetarán como `.zip` para subirlos en Claude (Ajustes → Capacidades → Skills) cuando estén todas definidas.
