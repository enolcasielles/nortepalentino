---
name: escribir-articulo
description: Escribe o reescribe un artículo del blog de Norte Palentino: analiza la búsqueda en la web, entrevista al editor, enlaza fichas del directorio y lo adapta al inglés.
---

# Escribir un artículo del blog

El blog trae tráfico de búsqueda y lo lleva al directorio. Un artículo funciona si **responde mejor que nadie a una búsqueda concreta**, **cuenta lo que solo sabe alguien que ha estado** y **enlaza las fichas** de lo que nombra. Trabajas con la extensión **Norte Palentino CMS** (`buscar`, `leer`, `referencias`, `esquema`, `crear`, `actualizar`, `revisar`, `subir_imagen`) y con la búsqueda web. Las reglas de la extensión para artículos siguen vigentes (formato del cuerpo, enlaces internos, `::ficha`). Aquí está el proceso.

No publicas. Todo queda en borrador hasta `revisar-publicacion`.

## Sin experiencia del editor no hay artículo

Un artículo hecho solo con información pública es contenido genérico: no posiciona y no aporta nada. Antes de redactar necesitas notas reales del editor (paso 2). Si no las hay, entrega el análisis y el esquema y para ahí. No escribas el cuerpo "para ir adelantando".

## Proceso

Avanza por fases y espera el visto bueno del editor al final de cada una. El editor puede saltarse alguna si ya trae el trabajo hecho (por ejemplo, si llega con la búsqueda decidida).

### 1. Búsqueda objetivo

Si el editor trae una búsqueda, analízala igualmente. Si solo trae un tema, propón **2–3 búsquedas** candidatas.

Para cada candidata, busca en la web y anota:
- **Qué sale arriba**: el tipo de página (guías, listas, fichas oficiales, foros) y qué cubre cada una. Lee los 3–5 primeros resultados.
- **Las preguntas relacionadas** que aparecen ("otras preguntas de los usuarios", búsquedas relacionadas, foros).
- **El hueco**: qué no responde bien nadie y nosotros sí podemos (experiencia propia, datos verificados, enfoque familiar, información actualizada).
- **Si encaja con el sitio**: que la Montaña Palentina tenga fichas que enlazar sobre ese tema.

No tienes datos de volumen de búsqueda: no te los inventes. Juzga por la especificidad (mejor "rutas con niños en Cervera de Pisuerga" que "rutas Palencia"), por si existen resultados que respondan exactamente a esa búsqueda y por el hueco que dejan.

Comprueba con `buscar` (colección `articulos`) que no hay ya un artículo sobre la misma búsqueda. Si lo hay, propón mejorar ese en vez de competir con él.

Cierra la fase con la búsqueda elegida, 3–6 `busquedas_secundarias` (variantes y preguntas) y el ángulo del artículo en una frase.

**Lo que no se hace con la competencia:** se lee para saber qué cubre, nunca para copiar su estructura, sus frases ni sus listas. El esquema sale de la búsqueda y de la experiencia del editor.

### 2. Entrevista al editor

Pregunta lo que el artículo necesita, en pocas preguntas concretas según el tema. Por ejemplo:
- ¿Lo has hecho o visitado tú? ¿Cuándo y con quién (con niños, de qué edad)?
- ¿Qué recomendarías y qué no? ¿Algún error que cometiste?
- Consejos prácticos: dónde aparcar, mejor hora o época, dónde comer después, qué llevar.
- ¿Hay algo que sepas tú y no salga en ninguna web?

Si las respuestas no dan para un artículo con experiencia real, dilo y propón otro tema o esperar a que el editor lo visite.

### 3. Fichas que enlazar

1. Con `buscar`, localiza las fichas **publicadas** relacionadas: negocios, rutas, recursos y municipios del tema y de la zona.
2. Elige las **1–3 protagonistas** (irán como `::ficha[coleccion/slug]`) y las secundarias (enlaces en el texto). Mínimo 3 enlaces al directorio.
3. Si el artículo va a nombrar sitios **sin ficha**, o con la ficha en borrador, avisa al editor con la lista y ofrécele crearlas o completarlas con `investigar-ficha` y `redactar-ficha` antes de seguir. Si prefiere seguir, esos sitios se nombran sin enlace. Un enlace a una ficha en borrador se pinta como texto y la revisión SEO lo marca.

### 4. Esquema

Propón el esquema antes de escribir:
- `titulo` con la búsqueda dentro (y `seo_titulo` de ≤ 60 caracteres si el título es más largo).
- El `resumen` answer-first: 2–3 frases que respondan a la búsqueda.
- Los `##` (al menos 2) y `###`, cada uno con la idea, la nota del editor que lo sostiene y las fichas que enlaza.
- 3–5 FAQs tomadas de las preguntas relacionadas.

### 5. Redacción en español

- **Answer-first.** El resumen y el primer párrafo responden a la búsqueda. El resto amplía.
- **La experiencia del editor en primera persona del plural o del singular, según prefiera**, integrada en el texto ("Cuando la hicimos con dos niños de 5 y 7 años…"), no en un bloque aparte.
- **Hechos solo de fuentes admitidas** (las de `investigar-ficha`) o de las fichas. Cifras de rutas, horarios y precios los coge de las fichas, y a cambio la ficha va enlazada.
- **Al menos 800 palabras de valor** (umbral de la revisión SEO), sin relleno. Si el tema no da para eso con contenido real, dilo en vez de alargar.
- Tono de la extensión: de tú, frases cortas, datos concretos, sin superlativos vacíos.
- **Formato del cuerpo** (Markdown de la extensión): `##` y `###`, listas, **negrita** con moderación, `[texto](interno:coleccion/slug)` para enlaces al directorio y una línea sola `::ficha[coleccion/slug]` para las tarjetas. Las fuentes externas, con enlace normal.
- **FAQs** que se entiendan solas, con el nombre del sitio en vez de "aquí".
- `seo_descripcion` de 120–160 caracteres con la búsqueda.

Enséñalo entero. Con el visto bueno, `crear` el artículo en borrador con los campos en español y el `autor` (pregunta quién firma si no lo sabes; sale en `referencias`). Si el editor tiene foto de portada, pídele la ruta del fichero y súbela con `subir_imagen` (con `alt` en los dos idiomas, `credito` y licencia).

### 6. Revisión SEO

Ejecuta `revisar` y resuelve los ✗ (errores) antes de seguir. Los avisos se comentan con el editor: alguno puede estar justificado.

### 7. Adaptación al inglés

El turista extranjero busca distinto: **repite la fase 1 en inglés** (búsqueda en inglés, resultados en inglés, preguntas relacionadas) y elige su `busqueda_objetivo` y sus `busquedas_secundarias` en inglés. Puede que el ángulo cambie (por ejemplo, más contexto sobre la zona o el románico).

Después adapta el artículo español aprobado:
- Mismos hechos y misma experiencia, sin añadir ni quitar información. Títulos, resumen y FAQs orientados a la búsqueda en inglés.
- Tono de guía británica, cálido y práctico. Explica lo que un local da por sabido.
- Los mismos enlaces internos y tarjetas: se resuelven solos al idioma. Si una ficha no existe en inglés, su enlace se pinta como texto. Avisa al editor y ofrécele adaptarla con `redactar-ficha`.
- `slug` en inglés con la búsqueda inglesa.

Enséñalo, guarda solo los campos en inglés y ejecuta `revisar` de nuevo para el inglés.

### 8. Cierre

Entrega un resumen: búsqueda objetivo en cada idioma, fichas enlazadas, fichas que faltan o están en borrador, resultado de `revisar` en ES y EN y qué falta para publicar. El siguiente paso es `revisar-publicacion`.

## Reescribir o ampliar un artículo

Lee el artículo con `leer` y revisa su búsqueda objetivo con la fase 1 (los resultados cambian). Conserva la experiencia del editor y los hechos. Propón los cambios como lista antes de tocar nada. Si el artículo ya está publicado, no cambies el slug salvo que el editor lo pida (se crea un redirect, pero se pierde la URL que ya se comparte). Si cambias el español, avisa de que el inglés queda desfasado.
