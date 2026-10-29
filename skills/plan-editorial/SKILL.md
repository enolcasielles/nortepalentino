---
name: plan-editorial
description: Propone qué hacer ahora en Norte Palentino: enlaces caídos, fichas por reverificar, páginas casi listas, inglés pendiente, fichas y artículos nuevos. Para «¿qué hago?».
---

# Plan editorial

Respondes a "¿qué hago ahora?" con una lista corta de tareas concretas, ordenadas por impacto y esfuerzo, cada una con la skill que la resuelve. Trabajas con dos herramientas de la extensión **Norte Palentino CMS**: `cobertura`, que calcula el estado de todo el contenido con las mismas reglas que deciden qué páginas existen en la web, y `mantenimiento`, que da las incidencias de lo ya publicado. Las dos aplican reglas fijas: tú interpretas y priorizas. No escribes nada en el CMS.

## Cómo leer `cobertura`

- **`resumen`**: páginas que existen en cada idioma.
- **`listados`**: cada listado posible (negocios de una categoría en un municipio o en toda la comarca, rutas, rutas con niños, qué ver, blog). Por idioma trae `fichas` publicadas, `faltan_fichas` para llegar al mínimo (`minimo_listado`, 3), si tiene `intro` y la `pagina` (URL) si ya existe. `landing` es el id de su landing o `null` si no la tiene, y `borradores` son las fichas en borrador que sumarían al publicarse.
- **`municipios`**: por municipio, si tiene `pagina` e `intro` en cada idioma, cuántas `faqs` tiene, si tiene `autor`, sus `fichas` publicadas, sus `borradores` y cuántos `articulos` lo enlazan.
- **`fichas`**: las fichas publicadas. Para cada una: si `existe` en cada idioma y, si no, qué le `falta` en ese idioma; si tiene `coordenadas`; su `fecha_verificacion`; y cuántos `articulos` la enlazan.
- **`borradores`**: qué les falta `para_publicar` (fuente, fecha, cifras de ruta, autor) y `para_existir` en cada idioma (descripción, slug, cuerpo), y la fecha de su última modificación (`actualizado`).

Una ficha publicada solo existe en un idioma si tiene su texto en ese idioma. Un listado necesita al menos 3 fichas que existan en ese idioma y una landing con intro en ese idioma.

## Cómo leer `mantenimiento`

- **`enlaces_caidos`**: `fuente_url` o `web` de fichas publicadas que han fallado en 2 comprobaciones semanales seguidas (`fallos_seguidos`, `desde`, `codigo`, `detalle`). Un enlace caído **no significa que el negocio haya cerrado**: puede ser una web nueva, un cambio de dominio o un servidor caído. Hay que reverificar.
- **`enlaces_con_un_fallo`**: un solo fallo. Puede ser pasajero; no lo pongas en el plan, menciónalo solo si el editor pregunta.
- **`enlaces_sin_comprobar`**: webs que bloquean la comprobación automática (403, certificados). No son incidencias.
- **`verificacion_caducada`**: fichas publicadas verificadas hace más de 6 meses, de la más antigua a la más reciente.
- **`borradores_abandonados`**: borradores sin cambios en 60 días.
- **`ultima_comprobacion_enlaces`**: si tiene más de 8 días, el proceso semanal puede haber fallado; díselo al editor para que avise a quien mantiene la web.

## Prioridades

Ordena las tareas por estos grupos, de arriba abajo. Dentro de cada grupo, primero lo que interesa a **familias** (público prioritario: filtros `con-ninos`, rutas aptas para niños, alojamiento y restaurantes con atributos de familia) y después lo de las **tres cabeceras piloto**: Cervera de Pisuerga, Aguilar de Campoo y Guardo.

0. **Enlaces caídos.** Una ficha publicada con la web o la fuente caída puede estar dando información falsa. Va antes que todo, con `investigar-ficha` (modo reverificar).
1. **Desbloquear páginas casi listas.** Poco esfuerzo, una página nueva:
   - Listados a los que les falta **una** ficha, o solo la intro de la landing.
   - Borradores a los que solo les falta un paso: la descripción, la fecha de verificación o una cifra.
   - Municipios sin intro en español, porque sin ella no tienen página.
2. **Inglés de lo publicado.** Fichas, municipios y landings con texto en español y sin inglés: cada uno es una página más en `/en`. Primero lo de románico y rutas, que es lo que más busca el turista extranjero.
3. **Reverificar lo caducado.** Fichas de `verificacion_caducada`, en lotes de unas 10 por sesión: primero las más antiguas y las de listados con página. Con `investigar-ficha` (modo reverificar).
4. **Fichas nuevas** en las cabeceras piloto, empezando por los listados a los que les faltan 2 fichas y por las categorías vacías (lo que más se busca: dónde dormir, dónde comer, qué hacer con niños).
5. **Artículos.** Temas que enlacen fichas que hoy no tiene ningún artículo, o que acerquen el blog a los 3 artículos que necesita su índice.

Señala aparte, sin mezclarlo con el plan, lo que conviene arreglar aunque no desbloquee nada: fichas publicadas sin coordenadas (no tienen mapa ni "cerca de aquí"), municipios sin FAQs y borradores abandonados (propón terminarlos o descartarlos).

## Proceso

1. Llama a `cobertura` y a `mantenimiento`. Si el editor ha dado un foco ("solo Aguilar", "solo rutas", "lo que esté en inglés"), filtra por él.
2. Cuenta el estado en 2–3 líneas: páginas que existen en cada idioma y lo más llamativo (por ejemplo, "el blog no tiene índice: faltan 2 artículos").
3. Propón **5–8 tareas** como máximo, en orden. Para cada una, en una línea:
   - qué hacer, con el nombre del sitio, municipio o listado;
   - por qué (qué página desbloquea o qué mejora);
   - con qué skill: `investigar-ficha`, `redactar-ficha`, `escribir-articulo` o `revisar-publicacion`.

   Si el editor pide solo el mantenimiento ("¿qué hay que revisar?"), limita el plan a los grupos 0 y 3.

   Ejemplo: *"Redactar la descripción del borrador Casa Rural X (Cervera). Con ella, Alojamientos en Cervera llega a 3 fichas: falta la intro del listado. → `redactar-ficha`"*.
4. Termina con una pregunta: por cuál empieza. Si elige una tarea, sigue con la skill correspondiente en la misma conversación.

No enumeres todo lo que falta: el editor quiere saber por dónde seguir, no un inventario. Si te pide el detalle de algo, dáselo.

## Cuidado con

- **Una ficha nueva no es solo crearla.** Para contar en un listado necesita estar publicada y tener descripción en ese idioma. Una tarea de "ficha nueva" son tres pasos (investigar, redactar y publicar); dilo al estimar el esfuerzo.
- **Las landings son una sola por listado e idioma.** Si `landing` es `null`, hay que crearla (`redactar-ficha`); si existe pero `intro` es `false` en un idioma, solo falta su texto en ese idioma.
- **No inventes demanda.** Al priorizar, argumenta con el público del portal y con lo que ves en `cobertura`, no con volúmenes de búsqueda que no tienes.
