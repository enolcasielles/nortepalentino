# CLAUDE.md — Norte Palentino

Portal **independiente** de referencia sobre la Montaña Palentina (alojamiento, restauración, turismo activo, rutas, románico), en español e inglés. Su razón de ser es **posicionar primero en Google y en asistentes de IA** (ChatGPT, Claude, Perplexity, Gemini) para quien planifica una escapada a la zona.

- Visión, público, territorio y fases de negocio: [`docs/brief.md`](docs/brief.md). Léelo antes de tu primera tarea.
- Sistema visual, componentes y anatomía de páginas: [`DESIGN.md`](DESIGN.md). Obligatorio antes de tocar UI.
- Estado de la implementación, trampas conocidas y siguientes pasos: [`PROGRESS.md`](PROGRESS.md). Léelo al empezar y actualízalo al terminar cada sesión.
- **Si este fichero contradice al brief, manda este fichero.** Las diferencias están listadas al final.

**Estructura del sitio.** Tres piezas con papeles distintos:

- **Directorio**: las fichas de lo que se puede monetizar (negocios: alojamiento, restaurantes, actividades; rutas y recursos para visitar), con sus listados por municipio y categoría y las páginas de municipio como índices. Datos verificados y JSON-LD.
- **Blog** (`articulos`): artículos que atraen tráfico de búsqueda. Cada uno responde a una búsqueda concreta (`busqueda_objetivo`), aporta valor real y **enlaza el directorio** cada vez que nombra algo con ficha (§6). Las fichas enlazan de vuelta a los artículos que hablan de ellas.
- **Home**: resumen de las dos anteriores. Cuidada, pero no es la que trae el tráfico.

---

## 1. Reglas no negociables

1. **Nunca inventes contenido publicable.** No redactes descripciones de negocios, textos de municipio, FAQs ni datos factuales (teléfonos, horarios, distancias, desniveles). Solo escribes microcopy de UI en ES/EN. Para desarrollar usa fixtures cuyo nombre empiece por `[DEMO]`; nunca llegan a producción ni al sitemap.
2. **Nunca te presentes como web oficial.** Ni en textos, ni en `Organization` JSON-LD, ni en metadatos. El aviso de portal independiente aparece en el pie de todas las páginas.
3. **Ninguna página fina o vacía es indexable** (ver §7.4). Un borrador o una ficha `[DEMO]` jamás se renderiza en producción.
4. **Server Components por defecto.** `'use client'` solo en las islas listadas en DESIGN.md. Cada KB de JS en cliente necesita justificación.
5. **Ningún script de terceros en el render inicial.** Google Maps y GA4 se cargan solo tras una acción o un consentimiento del usuario (§9).
6. **Todo lo visible existe en los dos idiomas.** Un componente o una plantilla sin su versión EN no está terminado.
7. **Nunca uses credenciales de producción** ni modifiques datos de producción. Payload es la fuente de verdad del contenido, y quien lo edita es una persona.
8. **Directo a `main`, pero solo en verde** (§3).

---

## 2. Stack

| Pieza | Elección |
| :-- | :-- |
| Framework | Next.js (App Router), TypeScript estricto |
| CMS | Payload CMS 3, integrado en el mismo proyecto Next (`/admin`) |
| Base de datos | PostgreSQL: Docker en local, Neon en producción |
| Media | Payload Upload + adaptador **Vercel Blob**, servido con `next/image` (AVIF/WebP) |
| Estilos | Tailwind CSS v4 con tokens en `@theme` y componentes propios (sin librería de UI) |
| Iconos | `lucide-react` (SVG renderizado en servidor) |
| Mapas | Google Maps JavaScript API detrás de una fachada estática (Static Maps API) |
| Analítica | GA4 con Consent Mode v2 y CMP autoalojada (`vanilla-cookieconsent`) |
| Búsqueda | Full-text de PostgreSQL (`unaccent`, configuraciones `spanish`/`english`) |
| Deploy | Vercel. Cada push a `main` despliega a producción |
| Gestor de paquetes | pnpm |
| Node | **24** (`.nvmrc`, `engines`). Con Node 22 la CLI de Payload falla al azar con código 13 (promesa sin resolver en sus `import()` dinámicos) |

No añadas dependencias sin necesidad clara. Antes de instalar una librería, comprueba si la plataforma (Next, Payload, la web nativa) ya lo resuelve.

### Comandos

| Comando | Para qué |
| :-- | :-- |
| `docker compose up -d` | Postgres local (puerto **5435** en el host) |
| `cp .env.example .env` | Primera vez: rellena `PAYLOAD_SECRET` (`openssl rand -hex 32`) |
| `pnpm dev` | Next + Payload en local (`/admin`) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint (flat config de `eslint-config-next`) |
| `pnpm build` | `payload migrate` + `next build` |
| `pnpm payload migrate` | Aplicar migraciones pendientes en local |
| `pnpm payload migrate:create <nombre>` | Nueva migración tras cambiar el esquema |
| `pnpm generate:types` | Regenerar `payload-types.ts` tras cambiar colecciones |
| `pnpm generate:importmap` | Regenerar el import map del admin tras añadir campos `richText`, plugins o componentes custom (si falta, el admin falla al cargar ese campo) |
| `pnpm seed [--update] [--dry-run] [--dir <ruta>]` | Importar `/seed/*.json` (§10). Contra una BD no local exige `--remote` |
| `pnpm seed:prod [--update] [--dry-run]` | Lo mismo contra producción, con `.env.production.local` (`vercel env pull .env.production.local --environment=production`; `PAYLOAD_SECRET` llega vacía y se pega a mano). Lo lanza una persona, nunca un agente |

`push` está desactivado también en local: el esquema solo cambia mediante migraciones.

---

## 3. Flujo de trabajo

- Se trabaja **directamente sobre `main`**, sin ramas ni PRs. Por eso los checks son la única barrera.
- **Antes de cada commit, sin excepción:** `pnpm typecheck && pnpm lint && pnpm build`. Si algo falla, no commitees. Arréglalo o deja el trabajo sin commitear y explica por qué.
- Commits pequeños y atómicos, con formato *Conventional Commits* en español: `feat(rutas): filtros por apta_carrito`, `fix(seo): canonical en landings de filtro`.
- **Esquema de datos:** si cambias una colección, genera la migración (`migrate:create`), regenera tipos y commitea todo junto. Nunca uses `push: true` fuera de local y no edites migraciones ya commiteadas.
- No toques `.env*` con valores reales y no commitees secretos. Si añades una variable, documéntala en `.env.example` y en §11.
- Si una tarea te obliga a romper una regla de este fichero o de DESIGN.md, para y pregunta. No la rompas en silencio.

### Definición de "hecho" para cualquier tarea

- [ ] typecheck, lint y build en verde.
- [ ] Funciona en `/es` y `/en` con slugs localizados y `hreflang` correcto.
- [ ] Metadatos únicos y JSON-LD correspondiente (§7). Si la plantilla es nueva, valídala en el Rich Results Test o en validator.schema.org.
- [ ] Sin JS de cliente nuevo fuera de las islas permitidas.
- [ ] Usable a 360 px de ancho y con teclado.
- [ ] Si toca datos: migración, tipos y revalidación (§6) cubiertos.

---

## 4. Estructura del proyecto (propuesta)

```
src/
  app/
    (frontend)/[locale]/...   # Rutas públicas (ver §5)
    (payload)/admin/...       # Payload admin (no tocar salvo configuración)
    sitemap.ts, robots.ts     # Por idioma, generados desde Payload
    llms.txt/, llms-full.txt/ # Route handlers
  collections/                # Una carpeta por colección Payload
  fields/                     # Campos reutilizables (slug localizado, faqs, coordenadas, fuente)
  hooks/                      # Hooks Payload (revalidación, redirects, validación de slugs)
  lib/
    seo/                      # buildMetadata, jsonld/*, hreflang, canonical
    i18n/                     # Diccionarios de UI, mapa de segmentos ES↔EN
    routes/                   # Construcción de URLs (ÚNICA fuente de URLs)
    search/                   # Consultas full-text
    markdown/                 # Serialización de páginas a .md
  components/                 # Ver DESIGN.md
seed/                         # JSON de contenido (contrato con Pablo) + import.ts
docs/                         # brief y documentación de producto
```

**Las URLs se construyen siempre con `lib/routes`** (`paths`, y `site.url.*` del índice de `lib/data/site.ts`, que solo devuelve URLs de lo que existe). Nunca las concatenes a mano en un componente. Así hreflang, sitemap, enlaces internos, `.md` y redirects comparten la misma lógica.

**Qué existe lo decide `lib/data/site.ts`** con las reglas de `lib/seo/indexability.ts`. `matchRoute` (resolver una URL) e `inventory` (enumerar todas: `generateStaticParams`, sitemap, `llms.txt`) se apoyan en ese índice; no dupliques esas reglas en otro sitio.

**Idioma del código:** colecciones, campos de Payload y claves de seeds en **español snake_case**, tal cual el contrato (`negocios`, `fecha_verificacion`, `apta_ninos`). Funciones, componentes, tipos y variables en **inglés** (`BusinessCard`, `buildLocalBusinessJsonLd`). Comentarios en español.

---

## 5. URLs e i18n

### Mapa de rutas

| Página | ES | EN |
| :-- | :-- | :-- |
| Home | `/es` | `/en` |
| Municipio | `/es/{municipio}` | `/en/{municipio}` |
| Municipio + categoría | `/es/{municipio}/{categoria}` | `/en/{municipio}/{category}` |
| Ficha de negocio | `/es/{municipio}/{categoria}/{negocio}` | `/en/{municipio}/{category}/{negocio}` |
| Categoría (comarca) | `/es/{categoria}` | `/en/{category}` |
| Rutas | `/es/rutas` · `/es/rutas/{ruta}` | `/en/routes` · `/en/routes/{route}` |
| Qué ver (recursos) | `/es/que-ver` · `/es/que-ver/{recurso}` | `/en/sights` · `/en/sights/{sight}` |
| Blog | `/es/blog` · `/es/blog/{articulo}` | `/en/blog` · `/en/blog/{article}` |
| Landing de filtro | `/es/rutas/con-ninos`, `/es/{municipio}/{categoria}/con-ninos` | `/en/routes/family-friendly`, … |
| Autor | `/es/autores/{autor}` | `/en/authors/{autor}` |
| Búsqueda (noindex) | `/es/buscar?q=` | `/en/search?q=` |
| Sobre nosotros y metodología | `/es/sobre-nosotros` | `/en/about` |
| Legales (LSSI/RGPD) | `/es/aviso-legal`, `/es/privacidad`, `/es/cookies` | `/en/legal-notice`, `/en/privacy`, `/en/cookies` |
| Markdown (GEO) | `{cualquier URL}.md` | ídem |

### Reglas de slugs

- **Se traduce todo.** Los segmentos fijos (`rutas`/`routes`), las categorías (`restaurantes`/`restaurants`) y los slugs de rutas, recursos, artículos y landings son campos `slug` **localizados** en Payload.
- Los **topónimos y nombres propios no se traducen**: municipios, núcleos y negocios tienen el mismo slug en ambos idiomas.
- Formato: minúsculas, ASCII, guiones, sin tildes; `ñ → n` (`branosera`, `la-pernia`). El slug se autogenera desde el nombre y se puede editar.
- **Slugs reservados:** un hook de validación impide que un municipio use el slug de una categoría, un segmento fijo (`rutas`, `blog`, `que-ver`, `buscar`, `autores`…) o un slug de filtro (`con-ninos`…), y al revés. Lo mismo aplica a negocios frente a slugs de filtro dentro de `{municipio}/{categoria}`. La lista vive en `lib/routes/reserved.ts`.
- **Cambio de URL = redirect 301 automático.** Si cambia el slug, el municipio o la categoría de un documento publicado, un hook `afterChange` crea la entrada en la colección `redirects`. La aplica el catch-all `[locale]/[...path]`: si una URL no existe, busca en `redirects` (siguiendo cadenas) antes de devolver 404 y responde con **308** (`permanentRedirect`, equivalente a 301 para buscadores). Nunca rompas una URL publicada.

### i18n

- `/` redirige con 308 a `/es`. **Prohibido** redirigir por IP o por `Accept-Language`. Como mucho, un aviso discreto que sugiera la versión EN.
- Cada página emite `<link rel="alternate" hreflang="es|en|x-default">` (con `x-default` apuntando a ES) y un `canonical` autorreferente. Si una página solo existe en un idioma, no emite hreflang al otro.
- El selector de idioma enlaza a la **URL equivalente localizada**, nunca a la home del otro idioma.
- Microcopy de UI en diccionarios tipados (`lib/i18n/{es,en}.ts`), con la misma forma de claves en ambos.
- Dominios: `nortepalentino.com` es el principal. `.es` y `montanapalentina.com` redirigen con 301 a la home; `palenciamountains.com` redirige con 301 a `/en`. Se configura en Vercel, no en código.

---

## 6. Modelo de datos (Payload)

Mantiene el del brief (§6) con estos cambios y añadidos. Los campos `{es,en}` son `localized: true`.

| Colección | Notas |
| :-- | :-- |
| `municipios` | Como el brief, más `faqs[]` localizadas, `autor→`, `foto_portada` opcional, `altitud_m` y `distancias_km{palencia,santander,madrid,bilbao}` opcionales (KeyFacts) |
| `nucleos` | Como el brief |
| `categorias_negocio` | `slug{es,en}`, `nombre{es,en}`, `nombre_plural{es,en}`, `tipo_schema` (Restaurant, Hotel, BedAndBreakfast, Campground, Hostel, LodgingBusiness, LocalBusiness…), `color_token`, `icono` |
| `tipos_recurso` | Misma forma que la anterior, para Recursos (iglesia-romanica, mirador, cascada, museo, yacimiento…) |
| `negocios` | Como el brief, más `fotos[]` opcionales y `orden` manual opcional. `horario_texto` localizado. `municipio→` derivado del núcleo (solo lectura). `destacado` existe pero **no se usa** en la fase 1 (no altera el orden ni el estilo) |
| `rutas` | Como el brief, más `slug{es,en}`, `resumen{es,en}`, `autor→`, `fotos[]`, `faqs[]`, `inicio_coordenadas` opcional y `municipio→` derivado de `inicio_nucleo`. Cifras y dificultad obligatorias para publicar. `gpx→archivos_gpx` |
| `recursos` | Lugares que se visitan aunque tengan entrada de pago: `nombre{es,en}`, `slug{es,en}`, `tipo→`, `nucleo→`, `municipio→` derivado, coordenadas, `resumen{es,en}`, `horario_acceso{es,en}`, `precio_entrada{es,en}`, `descripcion{es,en}`, `fotos[]`, `fuente_url`, `fecha_verificacion`, `estado` |
| `archivos_gpx` | Upload de tracks. Al subir, un hook calcula `polyline` (simplificada, para Static Maps), `bbox` y `puntos`. Nunca deriva distancias ni desniveles |
| `articulos` | Blog: `titulo{es,en}`, `slug{es,en}`, `resumen{es,en}` (answer-first y descripción por defecto), `foto_portada`, `cuerpo{es,en}` (Lexical con enlaces internos y bloque `ficha`), `faqs[]`, `busqueda_objetivo{es,en}`, `busquedas_secundarias{es,en}[]`, `seo_titulo{es,en}?`, `seo_descripcion{es,en}?`, `autor→` (obligatorio para publicar), `fecha_publicacion` (se fija al publicar), `estado`, y `enlaces{es,en}` (solo lectura, derivado del cuerpo). Revisión SEO en el panel y en `GET /api/cms/auditoria/:id` (`lib/seo/articleAudit.ts`) |
| `landings` | Intro y FAQs de listados: `ambito` (negocios · rutas · recursos · articulos), `municipio→?`, `categoria→?`, `filtro?`, `titulo{es,en}?`, `intro{es,en}`, `faqs[]`, `autor→`. Alimenta municipio+categoría, categoría comarcal, `/rutas`, `/que-ver`, `/blog` y landings de filtro. Un hook valida las combinaciones y que sean únicas |
| `autores` | Personas reales: `nombre`, `slug`, `bio{es,en}`, `foto`, `relacion_con_la_zona{es,en}`, `enlaces[]` |
| `redirects` | `desde`, `hacia`, `tipo` (exacto · prefijo), `locale`, `codigo` (301), `origen` (automático · manual). Se mantiene automáticamente (sin cadenas ni bucles) y también a mano. Se aplica con `resolveRedirect()` de `lib/routes/redirects.ts`, que sigue cadenas |
| `media` | Con `alt{es,en}` **obligatorio**, `credito`, `licencia` y `es_propia` (bool) |

**Publicar exige** `fuente_url` y `fecha_verificacion` (fichas) y las cifras de ruta; se valida en Payload (`fields/validation.ts`). Que la ficha exista en un idioma depende además de su texto en ese idioma (§7.4), y eso se comprueba al renderizar. Los registros `[DEMO]` se rechazan cuando `VERCEL_ENV=production`.

**Hooks y transacciones:** dentro de un hook, las operaciones con `req` comparten transacción. Hazlas **secuenciales** (nada de `Promise.all`) y no pases `context` a operaciones anidadas, porque se fusiona en `req.context` para el resto de la petición. Y nunca consultes otro idioma con `req` sin envolverlo en `withLocale()` (`lib/payload/withLocale.ts`): una operación con `locale` sobrescribe `req.locale` y la escritura del documento acabaría en ese idioma.

**Enlaces del blog al directorio:** el cuerpo de un artículo enlaza **documentos**, nunca URLs de la propia web: enlaces internos de Lexical (`negocios`, `rutas`, `recursos`, `municipios`, `articulos`) y el bloque `ficha` (tarjeta de un negocio, ruta o recurso). Se resuelven al renderizar con `site.url.ref()`, así que sobreviven a cambios de slug; si el destino no existe en ese idioma, el enlace se pinta como texto y la auditoría lo marca. Un hook `beforeChange` guarda lo enlazado en `enlaces`, de donde salen "Sitios de este artículo" y, en cada ficha y municipio, "Lo contamos en el blog" (`site.articulosAbout()`). La lectura del JSON de Lexical está en `lib/richtext/lexical.ts`.

**Frontera Negocio / Recurso:** un *Negocio* vende un servicio (comer, dormir, actividad guiada, tienda). Un *Recurso* es un lugar que se visita (iglesia, mirador, cascada, museo), aunque cobre entrada. Las taxonomías son separadas.

**Atributos de familia:** enum del brief (`admite-ninos`, `cuna`, `trona`, `menu-infantil`, `accesible-carrito`, `jardin-cerrado`, `admite-mascotas`, `parking`, `chimenea`). Las etiquetas ES/EN y los iconos se definen en código, no en la BD.

**FAQs:** campo reutilizable `fields/faqs.ts` (`pregunta{es,en}`, `respuesta{es,en}`). Cada respuesta tiene que entenderse sola, sin depender del resto de la página.

**Revalidación:** las páginas se generan estáticamente (`generateStaticParams`) con ISR. Cada colección tiene hooks `afterChange`/`afterDelete` que llaman a `revalidateTag` con tags por documento y por listado. Por ejemplo, un negocio invalida su ficha, su municipio+categoría, su categoría comarcal, su municipio, el sitemap y `llms-full.txt`. Las consultas de datos usan esos mismos tags.

---

## 7. SEO técnico

### 7.1 Metadatos

- Todo pasa por `lib/seo/buildMetadata()`: `title`, `description`, `canonical`, `alternates.languages`, Open Graph y Twitter. Nada de metadatos ad hoc en las páginas.
- `title` y `description` **únicos**, generados desde los datos con plantillas por tipo de página. Ejemplo: `Restaurantes en Cervera de Pisuerga · Norte Palentino`.
- `og:image`: foto propia si existe; si no, una imagen OG generada (`next/og`) con la marca.

### 7.2 JSON-LD

Un generador por tipo en `lib/seo/jsonld/`, tipado con `schema-dts`. **Solo incluye datos reales del documento; nunca rellenes campos.**

| Página | Tipos |
| :-- | :-- |
| Global (home) | `WebSite` (con `SearchAction`), `Organization` (portal independiente, sin afirmar oficialidad) |
| Municipio | `Place`/`City` con `geo` y `containedInPlace`, `BreadcrumbList`, `FAQPage` |
| Listados y landings | `CollectionPage` + `ItemList`, `BreadcrumbList`, `FAQPage` |
| Negocio | `categoria.tipo_schema` (`Restaurant`, `Hotel`, `Campground`…) con `address`, `geo`, `telephone`, `url`, `priceRange`, `openingHours` si está estructurado; `BreadcrumbList` |
| Ruta | `TouristTrip` + `Place` de inicio con `geo`; distancia, duración y dificultad en `additionalProperty`; `author`; `BreadcrumbList`; `FAQPage` |
| Recurso | `TouristAttraction` (o subtipo: `Church`, `Museum`…), `BreadcrumbList` |
| Artículo | `BlogPosting` con `author` (`Person`), `datePublished`, `dateModified`, `keywords` y `mentions` de lo enlazado; `BreadcrumbList`; `FAQPage` |
| Autor | `ProfilePage` + `Person` |

Google limita los rich results de FAQ, pero las FAQs se mantienen porque son el contenido que más citan los asistentes de IA.

### 7.3 Sitemaps y robots

- Un sitemap por idioma más un índice, generados desde Payload con `lastmod` = `updatedAt`. Solo incluyen URLs indexables (§7.4).
- `SITE_INDEXABLE` (env) controla el lanzamiento. Con `false` (por defecto, y siempre en previews), cada respuesta lleva `<meta name="robots" content="noindex">` y `X-Robots-Tag: noindex`, incluidas `.md` y `llms*.txt`. Con `true`, se aplica la indexación normal.
- `robots.txt` permite explícitamente los bots de IA: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `Bingbot`. Bloquea `/admin`, `/api` y `/*/buscar`.

### 7.4 Contenido fino: cuándo existe una página

- **Listados** (municipio+categoría, categoría comarcal, landing de filtro): se generan solo con **≥ 3 fichas publicadas Y una `landing` con intro propia** en ese idioma. Si no se cumple: 404, fuera del sitemap y sin enlaces internos hacia ella. El umbral es la constante `MIN_ITEMS_LISTING` en `lib/seo/indexability.ts`, y todas las plantillas, el sitemap y la navegación usan esa misma función.
- **Artículos**: `estado = publicado`, cuerpo con texto en ese idioma y autor. El índice `/blog` sigue la regla de los listados (≥ 3 artículos y `landing` de ámbito `articulos`).
- **Fichas** (negocio, ruta, recurso): requieren `estado = publicado`, una descripción propia en ese idioma y `fecha_verificacion`. Si falta el texto EN, la ficha no existe en EN.
- **Filtros por query param** (`?dificultad=facil`): se renderizan en servidor y funcionan sin JS, con `noindex,follow` y `canonical` a la página base. Solo las combinaciones curadas como `landing` tienen URL propia indexable.
- Paginación: `?pagina=2` con canonical autorreferente. Los listados del MVP deberían caber en una sola página.

### 7.5 Enlazado interno

Cada ficha enlaza a su municipio, a su municipio+categoría y a 3–6 elementos cercanos (por distancia geográfica) de otras categorías: "dormir cerca", "comer cerca", "rutas desde aquí". Breadcrumbs visibles en todas las páginas salvo la home.

---

## 8. GEO: contenido para asistentes de IA

- **Answer-first:** toda plantilla de contenido abre con un resumen factual de 2–3 frases, seguido de una tabla de datos clave (distancia, desnivel, horario, precio, temporada…) y, al final, las FAQs. La estructura está en DESIGN.md.
- **Fecha visible** "Verificado el {fecha}" en fichas, y "Actualizado el {fecha}" con el autor en contenido editorial.
- **`/llms.txt`**: descripción del sitio, aviso de independencia, secciones y enlaces a las páginas clave (municipios, categorías, rutas, blog) en ambos idiomas, apuntando a sus versiones `.md`.
- **`/llms-full.txt`**: volcado condensado de hechos generado desde Payload. Municipios, rutas con datos técnicos y fichas con dirección, contacto y atributos, cada una con su URL canónica y fecha de verificación.
- **Versión `.md` de cada página indexable** (`/es/rutas/senda-x.md`): Markdown limpio con el mismo contenido principal, datos clave y FAQs, sin navegación. Se anuncia con `<link rel="alternate" type="text/markdown">`. Una página no indexable tampoco tiene `.md`.
- HTML semántico y contenido completo en el HTML del servidor. Nada esencial puede depender de JS, porque la mayoría de los bots de IA no lo ejecutan.

---

## 9. Terceros, privacidad y rendimiento

- **Google Maps:** el render inicial muestra siempre una **imagen estática** (Static Maps API vía `next/image`, con marcadores o polyline de la ruta). El mapa interactivo (JS API) se carga solo cuando el usuario pulsa "Ver mapa interactivo". Las claves se restringen por referrer. Los GPX se convierten a polyline en el servidor y se ofrecen como descarga directa.
- **GA4:** Consent Mode v2 con todo `denied` por defecto. `gtag` se carga con `next/script` en `afterInteractive` y solo envía datos con consentimiento. Banner con `vanilla-cookieconsent` en ES/EN, que ofrece "Rechazar" con el mismo peso visual que "Aceptar". Los clics salientes (web, teléfono, cómo llegar) se miden como eventos para preparar la fase 2.
- **Enlaces salientes** a webs de negocios: `rel="noopener"`. En la fase 2, los de afiliación o pago llevarán `rel="sponsored"`.
- **Presupuesto de rendimiento** (móvil, 4G): LCP < 2,5 s, CLS < 0,1, INP < 200 ms. Imagen LCP con `priority` y tamaños correctos; fuentes autoalojadas con `next/font`; sin carruseles ni vídeo en la parte visible al cargar.

---

## 10. Contenido y seeds

### Reglas de contenido (resumen del brief §8)

- Los datos factuales salen de la web del negocio o de fuentes oficiales, siempre con `fuente_url` y `fecha_verificacion`.
- Textos con redacción propia; nunca copiados de otros portales. Fotos solo propias o con licencia, con `credito`.
- Inglés con redacción nativa para el turista extranjero, no una traducción literal.
- Calidad antes que volumen: mejor 30 fichas buenas que 300 vacías.
- **Tono:** cercano y experto, tuteando. Detalle en DESIGN.md §2.
- Los agentes de código **no redactan** este contenido (regla 1).

### Seeds e import

- **Payload es la fuente de verdad.** `/seed/*.json` sirve para la carga inicial y para los lotes de Pablo.
- `seed/import.ts` es **idempotente por `slug`**. Por defecto crea lo que falta y **no toca lo que ya existe**. Con `--update` sobrescribe solo los campos presentes en el JSON. Nunca borra nada.
- El import valida cada registro (con zod, contra el contrato) y falla con un informe legible si encuentra referencias rotas (`categoria`, `nucleo`), slugs reservados o campos obligatorios vacíos.
- Contrato actualizado respecto al brief: los slugs de `rutas`, `recursos` y las categorías son `{ "es": "...", "en": "..." }`. Los negocios usan `"categoria"` (slug ES de `categorias_negocio`). Se añaden `seed/categorias.json`, `seed/tipos_recurso.json`, `seed/recursos.json`, `seed/autores.json` y `seed/landings.json`; los núcleos van dentro de cada municipio en `municipios.json`. Mantén un ejemplo válido de cada fichero en `seed/examples/`.
- **El contrato es `seed/schema.ts`** (zod); `seed/README.md` lo resume para quien prepara los datos. Si cambias una colección, actualiza los dos y los ejemplos.
- El import escribe todo el lote en **una transacción** (o entra entero o nada), salvo los ficheros GPX, que se suben a disco/Blob y no se deshacen. Fotos y artículos no se importan: se gestionan en el panel o con la extensión de Claude Desktop (`cms-mcp/`).
- Los valores numéricos de las rutas son verificados, nunca estimados. Si faltan, el campo va vacío y la ficha no se publica.

---

## 11. Variables de entorno

| Variable | Uso |
| :-- | :-- |
| `DATABASE_URL` | Postgres (Docker en local, Neon en prod) |
| `PAYLOAD_SECRET` | Secreto de Payload |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob |
| `NEXT_PUBLIC_SITE_URL` | URL canónica base (`https://nortepalentino.com`) |
| `SITE_INDEXABLE` | `true` solo en producción tras el lanzamiento; por defecto `false` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps JS API (restringida por referrer) |
| `GOOGLE_MAPS_STATIC_API_KEY` | Static Maps (servidor) |
| `NEXT_PUBLIC_GA_ID` | GA4 |

---

## 12. Diferencias con `docs/brief.md`

| Brief | Decisión vigente |
| :-- | :-- |
| `/es/negocio/[slug]` | `/es/{municipio}/{categoria}/{negocio}` |
| Slugs iguales en EN ("espejo") | Slugs y segmentos traducidos (§5) |
| Una colección `Categoria` | `categorias_negocio` y `tipos_recurso` separadas |
| Neon también en desarrollo | Postgres en Docker en local; Neon solo en prod |
| Sin autores | Colección `autores`, contenido editorial firmado |
| Sin `landings` ni `redirects` | Añadidas (§6) |
| `Plan` (guías editoriales en `/planes`) | Blog: colección `articulos` en `/blog`, orientada a búsquedas y enlazada al directorio |
| `llms.txt` | Más `llms-full.txt` y versiones `.md` (§8) |
| Formato de seeds | Slugs localizados y ficheros nuevos (§10) |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
