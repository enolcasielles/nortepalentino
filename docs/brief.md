# Norte Palentino — Brief del MVP

> Portal independiente de referencia sobre la Montaña Palentina. Guía de alojamiento, restauración, turismo activo, rutas y románico, en español e inglés. Este documento sirve como `CLAUDE.md` del repositorio y como contrato de datos entre desarrollo (Enol) y contenido (Pablo).

---

## 1\. Objetivo

Ser la primera opción en Google y en asistentes de IA (ChatGPT, Claude, Perplexity…) para planificar una escapada a la Montaña Palentina. El portal reúne toda la oferta de la zona.

- **Fase 1 (ahora):** todo gratis. Volumen de fichas, contenido de calidad y posicionamiento.  
- **Fase 2 (con tráfico demostrable):** fichas destacadas de pago, afiliación a reservas (alojamiento y actividades) y publicidad.

## 2\. Marca y dominios

| Dominio | Uso |
| :---- | :---- |
| `nortepalentino.com` | Principal |
| `nortepalentino.es` | Redirección 301 |
| `montanapalentina.com` | Redirección 301 (activo descriptivo) |
| `palenciamountains.com` | Redirección 301 a `/en/` |

- Subtítulo ES: *Guía de la Montaña Palentina*  
- Subtítulo EN: *Mountains, villages & Romanesque of northern Spain*  
- **Portal independiente.** Nunca presentarse como web oficial. Pie de página con aviso claro. ACD Montaña Palentina (`montanapalentina.es`) y la marca destino institucional (`visitmontañapalentina.com`) son vecinos a cuidar, no rivales.  
- Pendiente: comprobar "Norte Palentino" en la OEPM.

## 3\. Público

1. **Familias** (prioridad): escapada de fin de semana desde Madrid, País Vasco, Valladolid o Cantabria.  
2. Senderistas y montañeros.  
3. Turismo de naturaleza y fauna: oso, bisonte, berrea.  
4. Románico Palentino: turista nacional e internacional. Eje fuerte en inglés.

## 4\. Territorio

Comarca turística completa: Parque Natural Montaña Palentina (Cervera, La Pernía, Velilla, Triollo, San Salvador de Cantamuda…) \+ Aguilar de Campoo, Guardo, Barruelo, Brañosera, Alar del Rey y el Románico Norte.

## 5\. Stack

- **Next.js** (App Router) \+ **Payload CMS 3** (integrado en el mismo proyecto Next) \+ **PostgreSQL** (Neon o Supabase).  
- Deploy en **Vercel**.  
- Páginas estáticas con regeneración incremental (ISR).  
- i18n: rutas `/es/...` y `/en/...`, con campos localizados en Payload, `hreflang` y sitemap por idioma.

## 6\. Modelo de datos (colecciones Payload)

Municipio      nombre, slug, comarca\_zona, coordenadas, intro{es,en}, foto\_portada

Nucleo         nombre, slug, municipio→, coordenadas            (pedanías)

Categoria      slug, nombre{es,en}, tipo\_schema                 (restaurante, casa-rural, hotel, camping, albergue, turismo-activo, museo, iglesia-romanica…)

Negocio        nombre, slug, categoria→, nucleo→, direccion, coordenadas,

               telefono, web, email, horario\_texto, precio\_rango,

               descripcion{es,en}, atributos\_familia\[\], destacado(bool, fase 2),

               fuente\_url, fecha\_verificacion, estado(borrador|publicado)

Ruta           nombre{es,en}, slug, inicio\_nucleo→, distancia\_km, desnivel\_m,

               duracion\_h, dificultad, circular(bool), apta\_ninos(bool),

               apta\_carrito(bool), premio\_final{es,en}, temporada\[\],

               descripcion{es,en}, experiencia\_propia{es,en}, gpx(archivo)

Recurso        iglesias románicas, miradores, cascadas, museos… (TouristAttraction)

Plan           guías editoriales: "Fin de semana con niños", "Ruta de los Pantanos"…

               (relaciona rutas, negocios y recursos)

**Atributos de familia (enum):** `admite-ninos`, `cuna`, `trona`, `menu-infantil`, `accesible-carrito`, `jardin-cerrado`, `admite-mascotas`, `parking`, `chimenea`.

## 7\. Páginas que genera el MVP

| Ruta | Contenido |
| :---- | :---- |
| `/es` | Home: buscador, categorías, planes destacados, mapa |
| `/es/[municipio]` | Qué ver, dónde dormir, dónde comer, rutas desde allí |
| `/es/[municipio]/[categoria]` | Ej.: `/es/cervera-de-pisuerga/restaurantes` (páginas a escala) |
| `/es/[categoria]` | Ej.: `/es/turismo-activo` (toda la comarca) |
| `/es/negocio/[slug]` | Ficha de negocio |
| `/es/rutas` · `/es/rutas/[slug]` | Filtros: niños, carrito, dificultad, distancia |
| `/es/planes/[slug]` | Guías editoriales |
| `/en/...` | Espejo en inglés |

**Requisitos SEO/GEO en todas las páginas:**

- JSON-LD: `Restaurant`, `LodgingBusiness`, `TouristAttraction`, `TouristTrip`, `Place`, `BreadcrumbList`, `FAQPage` donde aplique.  
- `<title>` y meta únicos, generados desde los datos.  
- Bloque de FAQs por municipio y categoría (lo que se pregunta a las IAs).  
- `sitemap.xml` por idioma, `robots.txt` y `llms.txt` con la estructura del sitio.  
- Core Web Vitals en verde: imágenes optimizadas y sin JS innecesario.  
- **`noindex` global hasta el lanzamiento real.** No indexar fichas vacías o de prueba.

## 8\. Reglas de contenido

- **Datos factuales** (nombre, dirección, teléfono, horario, web): de la web del negocio o de fuentes oficiales. Se guardan siempre `fuente_url` y `fecha_verificacion`.  
- **Textos:** redacción propia. Nunca copiar descripciones de otros portales. Las fotos solo propias o con licencia, nunca copiadas.  
- **Inglés:** redacción nativa adaptada a cómo busca el turista extranjero, no traducción literal.  
- **Sin contenido masivo de relleno.** Mejor 30 fichas buenas que 300 vacías.  
- **Experiencia propia** en rutas y páginas clave desde el principio, que es lo que nos diferencia.

## 9\. Plan para esta noche (MVP)

Los dos frentes trabajan en paralelo. El contrato entre ambos son los ficheros JSON de `/seed`.

### Enol: desarrollo (Claude Code)

1. Crear el proyecto Next.js \+ Payload 3 \+ Postgres (plantilla oficial con Postgres) y subirlo a GitHub.  
2. Definir las colecciones del punto 6, con localización ES/EN.  
3. Script `seed/import.ts` que lea `/seed/*.json` y cree o actualice los registros (idempotente por `slug`).  
4. Plantillas: home, municipio, municipio+categoría, ficha de negocio, listado y ficha de ruta.  
5. JSON-LD, metadatos, `hreflang`, sitemap, `robots.txt` con `noindex` y `llms.txt`.  
6. Deploy en Vercel con base de datos en Neon. Probar primero en una URL de Vercel; el dominio se conecta después.

### Pablo: datos, contenido y marca (Claude)

1. Registrar los 4 dominios.  
2. Lista completa de municipios y núcleos de la comarca → `seed/municipios.json`.  
3. **Piloto en 3 cabeceras (Cervera de Pisuerga, Aguilar de Campoo y Guardo):**  
   - Restaurantes (todos los localizables) → `seed/negocios.json`  
   - Alojamientos (hoteles, casas rurales, campings) → `seed/negocios.json`  
   - Empresas de turismo activo de toda la comarca → `seed/negocios.json`  
4. 5 rutas aptas para familias, con datos técnicos → `seed/rutas.json`.  
5. Textos ES/EN de los 3 municipios piloto, con FAQs.  
6. Marca mínima: logotipo tipográfico, 2 o 3 colores y tipografías, para pasárselo a Enol.

### Formato de los seeds (contrato)

// seed/negocios.json

\[{

  "slug": "restaurante-ejemplo-cervera",

  "nombre": "Restaurante Ejemplo",

  "categoria": "restaurante",

  "nucleo": "cervera-de-pisuerga",

  "direccion": "C/ Ejemplo 1, 34840 Cervera de Pisuerga",

  "lat": 42.866, "lng": \-4.497,

  "telefono": "+34 979 000 000",

  "web": "https\://...",

  "horario\_texto": "Mar–Dom 13:00–16:00",

  "precio\_rango": "€€",

  "descripcion": { "es": "…", "en": "…" },

  "atributos\_familia": \["admite-ninos", "trona"\],

  "fuente\_url": "https\://...",

  "fecha\_verificacion": "2026-10-16"

}\]

// seed/rutas.json

\[{

  "slug": "senda-tejeda-tosande",

  "nombre": { "es": "Senda de la Tejeda de Tosande", "en": "Tosande Yew Forest Trail" },

  "inicio\_nucleo": "dehesa-de-montejo",

  "distancia\_km": 0, "desnivel\_m": 0, "duracion\_h": 0,

  "dificultad": "facil|moderada|dificil",

  "circular": true, "apta\_ninos": true, "apta\_carrito": false,

  "premio\_final": { "es": "…", "en": "…" },

  "temporada": \["primavera", "otono"\],

  "descripcion": { "es": "…", "en": "…" },

  "fuente\_url": "https\://...",

  "fecha\_verificacion": "2026-10-16"

}\]

> Los valores numéricos de las rutas se rellenan con datos verificados, no estimados.

### Definición de "MVP terminado esta noche"

- [ ] La web está desplegada en una URL de Vercel con `noindex`.  
- [ ] Hay 3 municipios con página completa en ES y EN.  
- [ ] Hay fichas de negocio reales de las 3 cabeceras, con JSON-LD válido (comprobado en el Rich Results Test de Google).  
- [ ] Hay 5 rutas familiares con filtros funcionando.  
- [ ] Payload admin es accesible para que Pablo edite sin tocar código.

## 10\. Después del MVP

- Ampliar a todos los municipios y categorías.  
- Contenido de experiencia propia (visitas, fotos, rutas recorridas).  
- Investigación de palabras clave en inglés.  
- Conectar dominios, Search Console, Bing Webmaster y analítica. Quitar el `noindex`.  
- Contacto con ACD Montaña Palentina.  
- Fase 2: área de negocios (reclamar ficha, destacado de pago).

## 11\. Riesgos abiertos

- Contenido reescrito a escala sin valor añadido → penalización de Google (*scaled content abuse*). Mitigación: calidad antes que volumen y experiencia propia.  
- Confusión con webs institucionales → aviso claro de portal independiente.  
- Datos desactualizados (horarios, negocios cerrados) → `fecha_verificacion` y revisión periódica.  
- Marca "Norte Palentino" sin verificar en la OEPM.