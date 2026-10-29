# Skills de contenido · Norte Palentino

Skills de Claude para que el editor (Pablo) mantenga y amplíe el contenido de la web desde Claude. Cada skill enseña **un proceso**; para leer y escribir en el CMS se apoyan en la extensión **Norte Palentino CMS** (`cms-mcp/`), que ya pasa por las validaciones, los redirects y la revalidación de la web.

Las reglas comunes (no inventar datos, tono, formato de los campos, publicar solo si se pide) viven en `cms-mcp/src/instructions.mjs` y Claude las recibe siempre que la extensión está conectada. Las skills no las repiten: solo añaden lo propio de su proceso.

| Skill | Para qué | Estado |
| :-- | :-- | :-- |
| [`investigar-ficha`](investigar-ficha/SKILL.md) | Datos verificados de negocios, rutas y recursos: ficha nueva, reverificación e inventario | Definida |
| [`redactar-ficha`](redactar-ficha/SKILL.md) | Resumen, descripción y FAQs de fichas, municipios y landings: español primero, inglés adaptado después | Definida |
| [`escribir-articulo`](escribir-articulo/SKILL.md) | Artículos del blog: búsqueda analizada en la web, entrevista al editor, enlaces al directorio, ES y luego EN con su propia búsqueda | Definida |
| [`plan-editorial`](plan-editorial/SKILL.md) | Qué hacer a continuación, priorizado, a partir de `cobertura` y `mantenimiento` (incluye lo que hay que reverificar) | Definida |
| [`revisar-publicacion`](revisar-publicacion/SKILL.md) | Checklist (bloquea / aviso) y publicación o despublicación con confirmación expresa | Definida |

Flujo típico de una ficha: `investigar-ficha` → `redactar-ficha` → `revisar-publicacion`. `plan-editorial` genera trabajo para las demás.

**El mantenimiento no es una skill: es determinista.** Un cron semanal de Vercel comprueba los enlaces de las fichas publicadas y guarda el resultado (`comprobaciones_enlaces`); la herramienta `mantenimiento` de la extensión devuelve las incidencias con reglas fijas (`src/lib/maintenance/`). `plan-editorial` las prioriza y `investigar-ficha` las resuelve. Solo la parte que exige criterio (leer la fuente, decidir si algo ha cambiado o cerrado) pasa por Claude.

## Decisiones de contenido

- **Fuentes** (de más a menos fiable): web propia, fuentes oficiales y, solo para dirección, teléfono y horario sin web propia, la ficha de Google Business. Portales como TripAdvisor o Booking sirven de pista, nunca de fuente.
- **Cifras de rutas**: fuente oficial, track del editor o, en último lugar, Wikiloc y blogs de montaña citando la página. Nunca estimadas.
- **Coordenadas**: de la fuente o del pin que pega el editor. Nunca geocodificadas a partir de la dirección.
- **`fecha_verificacion`**: el día en que Claude leyó la fuente. El editor revisa la tabla de datos antes de guardar y es quien publica. Caduca a los 6 meses.
- **Mantenimiento**: un enlace se da por caído tras 2 fallos semanales seguidos; 403, 429 y errores de certificado no cuentan como fallo. Un borrador se considera abandonado a los 60 días. Sin revisión de temporada por ahora.
- **Textos**: cada afirmación sale de los datos de la ficha, de las notas del editor o de una fuente admitida. Sin notas del editor se escribe una versión sobria, sin opiniones, y `experiencia_propia` queda vacía.
- **Idiomas**: primero el español, validado por el editor; después el inglés, adaptado desde ese español para el turista extranjero.
- **Artículos**: la búsqueda objetivo se elige analizando los resultados en la web (sin datos de volumen por ahora). La competencia se lee para ver qué cubre, nunca para copiarla. Sin experiencia del editor no se escribe el cuerpo. Si se nombra un sitio sin ficha, se avisa y se ofrece crearla.
- **Prioridades del plan editorial**: primero los enlaces caídos, después desbloquear páginas casi listas, el inglés de lo publicado, reverificar lo caducado (lotes de ~10), fichas nuevas en las cabeceras piloto y por último artículos. Dentro de cada grupo, primero lo de familias. El plan vive en la conversación y se regenera con `cobertura` y `mantenimiento`.
- **Publicar**: lo hace la skill tras la confirmación expresa del editor. Se puede publicar solo con el español, avisando de que falta el inglés. No se comprueba en la web si el texto está copiado. Municipios y landings no tienen estado: guardar su intro es publicarlos, así que pasan la checklist antes de guardarse.

## Instalación (editor)

Requisito: la extensión **Norte Palentino CMS** 0.3.0 o posterior instalada en Claude Desktop (`cms-mcp/README.md`), porque `plan-editorial` usa sus herramientas `cobertura` y `mantenimiento`. Para `investigar-ficha` y `escribir-articulo`, la búsqueda web de Claude tiene que estar activada.

1. Recibe los `.zip` de `skills/dist/` (uno por skill).
2. En Claude, ve a **Personalizar → Skills** (claude.ai/customize/skills), sube cada `.zip` y actívalo. Las skills son de tu cuenta: sirven en cualquier chat o proyecto.
3. Prueba en un chat nuevo: *"¿Qué hago ahora en Norte Palentino?"* debería activar `plan-editorial`.

Para actualizar una skill, sube el `.zip` nuevo en lugar del anterior.

## Desarrollo

Cada skill es una carpeta con su `SKILL.md`. La cabecera lleva `name` (igual que la carpeta) y `description`, de **200 caracteres como máximo** en claude.ai. Claude decide cuándo usar la skill solo a partir de la descripción, así que tiene que nombrar lo que pide el editor.

```bash
pnpm skills:package   # → skills/dist/<skill>.zip (ignorado por git)
```

Si una skill necesita datos que la extensión no da, añádelos en la web (un endpoint en `src/endpoints/`) y una herramienta en `cms-mcp/`, como se hizo con `cobertura` y `mantenimiento`. No pidas a Claude que los calcule recorriendo el CMS.
