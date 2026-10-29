---
name: redactar-ficha
description: Redacta en español y adapta al inglés descripciones, resúmenes, FAQs e intros de fichas, municipios y listados de Norte Palentino, con datos verificados y notas del editor.
---

# Redactar los textos de una ficha

Escribes los textos que hacen que una ficha, un municipio o un listado **exista** en la web. Sin descripción o intro en un idioma, la página no se genera en ese idioma. Trabajas con la extensión **Norte Palentino CMS** (`buscar`, `leer`, `referencias`, `esquema`, `actualizar`, `crear`, `revisar`). Las reglas de tono y formato de la extensión siguen vigentes; aquí está el proceso.

No investigas datos ni publicas. Todo queda en borrador.

## Principio: nada que no esté en una fuente o en las notas del editor

Cada afirmación del texto tiene que salir de una de estas tres fuentes:

1. Los **datos de la ficha** (ya verificados).
2. Las **notas del editor**: su experiencia, lo que ha visto y lo que recomienda.
3. Una **fuente admitida** que consultes ahora, con las mismas reglas que `investigar-ficha`: web propia, fuentes oficiales, y Google Business solo para dirección, teléfono y horario. TripAdvisor, Booking y los blogs sirven de pista, nunca de fuente. El siglo de una iglesia, la especialidad de un restaurante o la historia de un pueblo necesitan una fuente así.

Lo que no puedas respaldar no se escribe, por bonito que quede. No supongas lo típico ("cocina casera", "ideal para familias", "vistas espectaculares") si nadie lo ha dicho. Si al terminar te falta material para un texto digno, dilo y pide notas en vez de rellenar.

## Proceso

### 1. Reunir el material

1. Localiza el documento con `buscar` y léelo entero con `leer`. Si no existe una ficha de negocio, ruta o recurso, para: primero hay que crearla con `investigar-ficha`. Los municipios ya existen (salen en `referencias`). Las landings sí puedes crearlas tú, con `crear`.
2. Si sus datos están incompletos o la `fecha_verificacion` tiene más de 6 meses, avísalo antes de escribir: el texto se apoyará en ellos.
3. **Pide las notas al editor** si no las ha dado: si ha estado allí, qué destacaría, a quién se lo recomendaría, algún consejo práctico (aparcamiento, mejor hora, reservar), qué no le convenció. Hay dos caminos:
   - **Con notas:** son el corazón del texto. Respeta su contenido y su opinión; mejora la forma, no el fondo.
   - **Sin notas:** escribe una versión **sobria**, solo con hechos de la ficha y de las fuentes. Sin opiniones, sin "te recomendamos", sin vivencias. Al entregarla, di que es una versión sin experiencia propia y que mejorará con sus notas.
4. Consulta fuentes si las necesitas y apunta qué sacaste de cada una.

### 2. Escribir en español

Escribe todos los textos que pida ese tipo (tabla de abajo) y enséñaselos al editor **antes de guardar**, con una lista corta de las fuentes usadas para cada hecho que no venga de la ficha ni de sus notas.

Cómo se escribe:

- **Answer-first.** La primera frase responde a lo que busca quien llega: qué es, dónde está y por qué ir. Las primeras 2–3 frases tienen que entenderse solas, porque son lo que citan Google y los asistentes de IA.
- **De tú, cercano y experto.** Frases cortas y datos concretos ("a 5 minutos andando de la plaza", "cierra los lunes"). Si el editor ha dado su opinión, se puede decir: "Pide la morcilla".
- **Prohibidos** los superlativos vacíos: paraje incomparable, maravilla, enclave privilegiado, rincón con encanto, joya, imprescindible, de ensueño.
- **Sin repetir la tabla de datos.** Teléfono, horario y precio ya aparecen en la ficha. Menciónalos solo si aportan algo ("abre solo en verano: llama antes").
- **Párrafos separados por una línea en blanco.** Sin Markdown: ni títulos, ni listas, ni negritas (son campos de texto plano).
- **Nombres propios tal cual:** municipios, núcleos y negocios no se traducen ni se adaptan.
- **Enlaces:** estos campos no admiten enlaces. No pongas URLs en el texto.

### 3. Guardar el español

**Municipios y landings no tienen estado: en cuanto guardas su intro, la página está en vivo** (la landing, si su listado ya tiene 3 fichas). Antes de guardarlos, pasa la checklist de `revisar-publicacion` y pide al editor confirmación expresa para publicar. Las fichas y los artículos quedan en borrador al guardar.

Con el visto bueno, `actualizar` (o `crear`, en landings) solo con los campos en español. Si el documento tiene campo `autor` y está vacío, pregunta al editor quién firma (los autores salen en `referencias`).

### 4. Adaptar al inglés

Parte del texto **español aprobado**, no de tus notas. Es una adaptación, no una traducción:

- **Para un turista extranjero** que no conoce la zona ni España. Sitúa lo que haga falta ("Palencia, in northern Spain", "Cantabrian Mountains") y explica lo que un local da por sabido (menú del día, horarios de comida tardíos, una casa rural).
- **Tono:** cálido y práctico, al estilo de las guías británicas. Vocabulario del visitante: *walking route*, *family-friendly*, *pushchair-friendly*, *Romanesque church*, *village*, *self-catering cottage*.
- **Unidades y formatos ingleses:** días y horas en formato inglés (1pm, Mon–Fri); las distancias se quedan en kilómetros.
- **Mismo contenido y los mismos hechos.** No añadas ni quites información. Si algo no tiene sentido para un extranjero, adáptalo o sáltalo y díselo al editor.
- Las FAQs en inglés pueden reformular la pregunta como la haría un turista ("Can I visit the church inside?"). Mantienen el orden: la FAQ en inglés se guarda en la misma posición que la española.

Enséñalo, y con el visto bueno guarda solo los campos en inglés.

### 5. Cerrar

Ejecuta `revisar` y entrega un resumen: qué textos quedaron en cada idioma, qué falta para publicar y si la página ya existe en ES y en EN. El siguiente paso es `revisar-publicacion`.

## Qué textos lleva cada tipo

Usa `esquema` si dudas: manda sobre esta tabla. Las longitudes son orientativas.

| Tipo | Campos | Notas |
| :-- | :-- | :-- |
| **Negocio** (`negocios`) | `descripcion` | 2–4 párrafos. El primero hace de meta descripción: answer-first, unos 150–160 caracteres. No tiene resumen ni FAQs |
| **Ruta** (`rutas`) | `resumen`, `premio_final`, `descripcion`, `experiencia_propia`, `faqs` | `resumen`: 2–3 frases con a quién va dirigida y qué tiene de especial. `premio_final`: qué hay al llegar, el gancho familiar (una cascada, un mirador, un merendero). `descripcion`: el recorrido por tramos, la orientación y dónde aparcar, sin repetir las cifras. `experiencia_propia`: **solo** con las notas del editor, en primera persona; sin notas, se deja vacía. `faqs`: 3–5 |
| **Recurso** (`recursos`) | `resumen`, `descripcion` | `resumen`: 2–3 frases. `descripcion`: qué ver, qué fijarse, contexto histórico con fuente y consejos de visita. No tiene FAQs |
| **Municipio** (`municipios`) | `intro`, `faqs`, `comarca_zona` | `intro`: 2–3 frases answer-first sobre qué es el pueblo y por qué ir. `faqs`: 4–6, sobre lo que se pregunta al planear la visita (qué ver, con niños, dónde comer, cómo llegar, mejor época) |
| **Landing** (`landings`) | `intro`, `faqs`, `titulo` (opcional) | Ver abajo |

### FAQs

- Preguntas reales de quien planifica la escapada, no preguntas inventadas para meter palabras clave.
- **Cada respuesta se entiende sola**: repite el nombre del sitio en vez de "aquí" o "este lugar". Las IAs la citan fuera de la página.
- 1–3 frases, con el dato concreto. Si la respuesta es "no lo sabemos", la pregunta sobra.
- Las listas se guardan completas: envía todas las FAQs, no solo las nuevas.

### Landings (intros de listados)

Una landing da intro y FAQs a un listado: restaurantes de un municipio, una categoría en toda la comarca, rutas con niños, el índice del blog. Su combinación de `ambito`, `municipio`, `categoria` y `filtro` define qué listado es.

- Antes de escribir, comprueba con `buscar` cuántas fichas publicadas tiene ese listado. **Con menos de 3, la página no se genera aunque tenga intro**: díselo al editor y deja la landing en borrador.
- `intro`: responde a la búsqueda del listado ("dónde comer en Cervera de Pisuerga"): qué tipo de sitios hay, qué distingue a la zona y un consejo útil. No enumeres las fichas: el listado ya las pinta y cambiará.
- `faqs`: preguntas del conjunto ("¿Hay restaurantes abiertos el lunes en Cervera?") cuya respuesta salga de las fichas o de fuentes. Ojo: estas respuestas caducan cuando cambian las fichas; menciónalo al editor.
- `titulo`: déjalo vacío salvo que el editor quiera otro; la plantilla genera uno bueno.

## Reescribir un texto existente

Si el editor pide mejorar un texto que ya existe, conserva todos sus hechos y la experiencia propia. Cambia la forma, no el contenido, y enseña el antes y el después. Si el texto contiene algo que no puedes respaldar, señálalo en vez de borrarlo en silencio.

Si se reescribe el español de algo que ya tiene inglés, avisa de que el inglés ha quedado desfasado y ofrece adaptarlo de nuevo.
