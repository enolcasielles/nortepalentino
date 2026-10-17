# PROGRESS.md — Norte Palentino

Registro del avance de la implementación. **Léelo después de [`CLAUDE.md`](CLAUDE.md) y antes de tu primera tarea**, y actualízalo al terminar cada sesión: estado, qué hiciste, qué decidiste y qué queda. Las reglas viven en CLAUDE.md y DESIGN.md; aquí va el estado y el contexto que no se deduce del código.

---

## 1. Estado actual

| | |
| :-- | :-- |
| Última actualización | 2026-10-17 |
| Último commit en `main` | Ver `git log`. Desplegado y verificado en producción hasta `b1959ee`; el blog (sesión 4) está commiteado y **sin desplegar** |
| Producción | https://nortepalentino.vercel.app (pública, `noindex` por `SITE_INDEXABLE=false`) |
| Contenido en producción | **Ninguno.** Neon solo tiene el usuario admin; solo existe la home. Las páginas aparecen al cargar datos que cumplan §7.4 |
| Admin | `/admin`. El primer usuario ya está creado |
| Dominio | Sin conectar; las URLs canónicas usan `nortepalentino.vercel.app` hasta que se defina `NEXT_PUBLIC_SITE_URL` |

**Fases del brief (§9, "MVP terminado"):**

- [x] Desplegada en una URL de Vercel con `noindex`
- [ ] 3 municipios con página completa en ES y EN → **lote real en `seed/`** (sesión 5), cargado en local; falta revisarlo y llevarlo a producción
- [ ] Fichas reales de las 3 cabeceras con JSON-LD validado en el Rich Results Test → fichas en el lote; falta la validación
- [x] Filtros de rutas funcionando (5 rutas reales en el lote)
- [x] Payload admin accesible para que Pablo edite
- [x] Extensión de Claude Desktop para que Pablo gestione el contenido desde Claude (`cms-mcp/`)
- [x] Estructura Directorio + Blog + Home (sesión 4). Faltan los primeros artículos reales

---

## 2. Arrancar en local

```bash
nvm use                       # Node 24 (.nvmrc). Con Node 22 la CLI de Payload falla al azar (ver §6)
pnpm install
docker compose up -d          # Postgres en el puerto 5435
cp .env.example .env          # y rellena PAYLOAD_SECRET (openssl rand -hex 32)
pnpm payload migrate
pnpm seed                     # lote real (seed/*.json); o --dir seed/examples para los fixtures [DEMO]
pnpm dev                      # http://localhost:3000/es · /admin (crea un usuario local)
```

URLs útiles con los fixtures: `/es/demo-villa`, `/es/demo-villa/demo-restaurantes`, `/es/demo-villa/demo-restaurantes/con-ninos`, `/es/demo-restaurantes`, `/es/demo-villa/demo-restaurantes/demo-restaurante-ejemplo`, `/es/rutas`, `/es/rutas/con-ninos`, `/es/rutas/demo-senda-ejemplo`, `/es/que-ver`, `/es/que-ver/demo-iglesia-ejemplo` y sus equivalentes EN (`/en/routes/...`, `/en/sights/...`).

Con el lote real: `/es/cervera-de-pisuerga`, `/es/cervera-de-pisuerga/restaurantes`, `/es/cervera-de-pisuerga/casas-rurales/con-ninos`, `/es/aguilar-de-campoo/hoteles`, `/es/turismo-activo`, `/es/rutas/con-ninos`, `/es/rutas/senda-de-la-tejeda-de-tosande`, `/es/que-ver`, `/es/blog/que-ver-en-aguilar-de-campoo` y sus equivalentes EN. Los fixtures `[DEMO]` incluyen también 3 artículos y la landing del blog.

**El import de seeds no puede invalidar la caché de Next** (corre fuera de Next). En local, tras importar, reinicia `pnpm dev` borrando `.next`.

---

## 3. Infraestructura

| Pieza | Estado |
| :-- | :-- |
| GitHub | `git@github.com:enolcasielles/nortepalentino.git`, rama `main`. Cada push despliega a producción |
| Vercel | Proyecto `enolcasielles-projects/nortepalentino`, Node 24, funciones en `fra1` (`vercel.json`) |
| Neon | Recurso `neon-charcoal-lantern`, región Frankfurt. Conectado **solo a Production** |
| Vercel Blob | Store `nortepalentino-media` (público, `cdg1`), solo Production. `clientUploads` activo |
| Previews | **Sin base de datos a propósito**: su build fallará en vez de migrar la BD de producción. Para tener previews, activar en la integración de Neon una rama por preview |
| Protección | Las URLs de cada despliegue (`*-enolcasielles-projects.vercel.app`) piden login de Vercel; usa `vercel curl <ruta> --deployment <url>` para probarlas. `nortepalentino.vercel.app` es pública |

**Variables en Vercel (Production):** las 18 de Neon (`DATABASE_URL` con pooler, `DATABASE_URL_UNPOOLED`…), `BLOB_READ_WRITE_TOKEN`, `PAYLOAD_SECRET`, `SITE_INDEXABLE=false`.

**Sin definir todavía:** `NEXT_PUBLIC_SITE_URL` (al conectar el dominio → `https://nortepalentino.com`), `GOOGLE_MAPS_STATIC_API_KEY` (sin ella no se pinta ningún mapa), `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (mapa interactivo, restringida por referrer), `NEXT_PUBLIC_GA_ID`. Las claves las crea Enol.

---

## 4. Qué está hecho

### 4.1 Base (`ab49715`, `b5e9a23`, `0d02b01`)

- Next 16.3 + Payload 3.91 en el mismo proyecto, Postgres (Docker en local, Neon en prod), Tailwind v4 con los tokens de DESIGN.md en `@theme` y **sin paletas por defecto** (`text-green-700` no existe).
- Localización Payload `es`/`en` con `fallback: false`. Admin en español.
- `push: false` también en local: el esquema solo cambia con migraciones. `payload migrate` usa `DATABASE_URL_UNPOOLED` si existe (`PAYLOAD_MIGRATING=true` en el script `build`).
- `/` → 308 a `/es`. `noindex` global (meta + `X-Robots-Tag`) salvo `SITE_INDEXABLE=true`; las previews nunca son indexables.
- URL canónica: `NEXT_PUBLIC_SITE_URL` o, en Vercel, la URL de producción del proyecto (`lib/site.ts`).

### 4.2 Modelo de datos (`260f08a`, `a3fbf7b`)

Colecciones: `municipios`, `nucleos`, `negocios`, `categorias_negocio`, `recursos`, `tipos_recurso`, `rutas`, `archivos_gpx`, `planes`, `landings`, `autores`, `redirects`, `media`, `users`. Detalle de campos en CLAUDE.md §6 (actualizado).

- Campos reutilizables en `src/fields/`: slug (autogenerado, validación de formato y reservados), coordenadas (con control de zona), FAQs, verificación/estado.
- Publicar exige `fuente_url` + `fecha_verificacion`; en rutas, además, distancia, desnivel, duración y dificultad.
- API pública: solo lo publicado. `[DEMO]` rechazado cuando `VERCEL_ENV=production`.
- `municipio` derivado del núcleo en negocios, recursos y rutas.
- Colisiones de slug municipio ↔ categoría en ambos idiomas.
- **Redirects automáticos** al cambiar la URL de algo publicado: exactos, y por prefijo para municipios y categorías. La tabla se mantiene sin cadenas ni bucles.
- GPX → polyline simplificada + bbox en servidor (nunca deriva distancias).
- Revalidación por tags de colección y documento (`lib/cache/tags.ts`).
- El plugin de Blob usa `alwaysInsertFields`: el esquema es igual con y sin token.

### 4.3 Seeds (`7ba82aa`)

- `pnpm seed [--update] [--dry-run] [--dir] [--remote]`. Contrato en `seed/schema.ts` (zod), resumen para Pablo en `seed/README.md`, ejemplos `[DEMO]` en `seed/examples/`.
- Valida todo antes de escribir (forma, duplicados, referencias, colisiones) con informe en español; escribe el lote en **una transacción**; idempotente por slug; nunca borra; se niega a escribir en una BD no local sin `--remote`.
- Diferencias con el brief: slugs traducidos, `tipos_recurso.json`, núcleos dentro de `municipios.json`, `estado` explícito (por defecto borrador).

### 4.4 Plantillas y SEO (`a002784`, `b1959ee`)

- **Capa de datos** (`lib/data/`): cada colección se carga entera por idioma con `unstable_cache` + tag; `getSite(locale)` construye el índice de lo que existe aplicando `lib/seo/indexability.ts` (§7.4). Modelo de caché "anterior" de Next 16 (sin `cacheComponents`).
- **Enrutado**: catch-all `src/app/(frontend)/[locale]/[...path]` → `matchRoute` (`lib/routes/match.ts`). `siteInventory` (`lib/routes/inventory.ts`) enumera todas las URLs para `generateStaticParams`, sitemap y `llms.txt`. Si una URL no existe, se resuelve contra `redirects` (`resolveRedirect`, sigue cadenas) y responde **308**.
- **Plantillas** (`src/components/templates/`): home, municipio, listado de negocios (municipio+categoría, comarcal, filtro `con-ninos`), negocio, listado de rutas con filtros por query (sin JS, `noindex,follow`), ruta, listado de recursos, recurso. 404 bilingüe.
- **Componentes** (DESIGN.md §5, rediseñados en la sesión 2): `KeyFacts`, `DifficultyMark`, `TrailArrow`, `FamilyAttributes`, `VerifiedNote`, `AuthorByline`, `FaqList`, `ExperienceBlock`, `Prose`, tarjetas (`BusinessCard`, `RouteCard`, `SightCard`, `MunicipioCard`), `ContactActions` (fijo abajo en móvil, con `data-event` para analítica futura), `NearbyList`, `RouteFilterBar`, `Breadcrumbs`, `SiteHeader` (menú con `<details>`), `SiteFooter`.
- **Mapas**: `MapFacade` (única isla de cliente) + imagen de Static Maps servida desde `/mapas/{locale}/{ruta de la página}` para no exponer la clave. Sin clave no se renderiza.
- **SEO**: `buildMetadata` (título con marca, descripción recortada, canonical, hreflang + `x-default`), JSON-LD por tipo en `lib/seo/jsonld/` (City, tipos de negocio, TouristTrip, Church/TouristAttraction, CollectionPage+ItemList, BreadcrumbList, FAQPage, WebSite, Organization), `/sitemap.xml` (índice) + `/sitemaps/{es,en}.xml` con alternates, `/llms.txt`, `/llms-full.txt`, `robots.txt` con bots de IA y sitemap.
- Microcopy ES/EN en `lib/i18n/{es,en}.ts` (incluye plurales y etiquetas de taxonomías); formateo de fechas/cifras en `lib/i18n/format.ts`.

**Verificado:** todas las plantillas en ES y EN con fixtures (código HTTP, título, canonical, hreflang, un único H1, tipos JSON-LD), filtros y redirect en build de producción, 360 px sin scroll horizontal y objetivos táctiles ≥ 44 px, despliegue en producción.

### 4.5 Sistema visual "producto outdoor" (sesión 2)

- Nueva dirección en DESIGN.md: fondo blanco, verde bosque `#17734A`, `ink` para hero y pie, naranja atardecer como acento, tintes `-soft` por categoría, `Bricolage Grotesque` para títulos (sustituye a Inter Tight), radios 6/10/16/24 px y sombras suaves en reposo. Contrastes AA recalculados (tabla de DESIGN.md §3.1).
- Recursos gráficos propios: textura de curvas de nivel (`public/textures/contours.svg`, aplicada como máscara con la utilidad `contours`), siluetas de cumbres (`brand/Ridges.tsx`) y símbolo provisional de cumbres anidadas (`brand/Wordmark.tsx`). Se generaron con scripts de un solo uso (campo de alturas + `d3-contour`); no son dependencias del proyecto. Para regenerarlos hay que rehacer el script.
- `PageHero` (prop `hero` de `PageLayout`) en todas las plantillas salvo la home; la home usa `masthead`. Tarjetas 16:10 con `MediaPlaceholder` cuando no hay foto, píldora de categoría o baliza de dificultad, iconos en los datos de ruta. `KeyFacts` y acciones en columna lateral `sticky` desde `lg`.
- Microcopy nuevo: `home.eyebrow`, `home.lead`, `home.explore`, `footer.explore` (ES/EN). La entradilla de la home es provisional: cámbiala si el tono no convence.
- Verificado: ES/EN en home, municipio, listados, fichas y 404; 360 px sin scroll horizontal; sin islas de cliente nuevas.

### 4.6 Extensión de Claude Desktop (`cms-mcp/`, `ea24082`)

- Servidor MCP local empaquetado como `.mcpb` (`cd cms-mcp && pnpm run package`). Herramientas: `esquema`, `referencias`, `buscar`, `leer`, `revisar`, `crear`, `actualizar`, `subir_imagen`, `subir_gpx`, `borrar`. Reglas de contenido para Claude en `cms-mcp/src/instructions.mjs`; instalación en `cms-mcp/README.md`.
- Va por la **API REST** con la API key del usuario (`users` con `useAPIKey`), así que pasa por validaciones, redirects y **revalidación**: los cambios se ven al momento, sin el problema del import remoto.
- La web sirve el esquema de campos en `GET /api/cms/esquema` (`src/endpoints/schema.ts`, requiere sesión o API key): cambiar una colección no obliga a reempaquetar la extensión.
- Campos traducidos como `{es, en}`: escribe ES y luego EN con `PATCH ?locale=en`. Las filas de listas (FAQs) se asocian por posición para no perder el otro idioma. `planes.cuerpo` en Markdown ↔ Lexical (`cms-mcp/src/lexical.mjs`).
- La API key tiene **acceso total** (decisión de Enol): la herramienta `borrar` existe, y las instrucciones piden confirmación expresa.
- Subidas limitadas a 4,4 MB por el límite de cuerpo de las funciones de Vercel.
- Probado de extremo a extremo contra local (crear, actualizar parcial por idioma, FAQs, errores de validación, plan en Markdown, foto, GPX, borrar). **Sin probar todavía contra producción ni dentro de Claude Desktop.**

### 4.7 Directorio, blog y home (sesión 4)

- **Estructura del sitio** (CLAUDE.md, cabecera): *Directorio* (fichas monetizables y sus listados; municipios como índices), *Blog* (artículos para atraer tráfico que enlazan el directorio) y *Home* como resumen. URLs del directorio sin cambios.
- **`planes` → `articulos`** (`/es/blog`, `/en/blog`; migración `blog_articulos`, que borra las tablas de planes, vacías). Campos SEO (`busqueda_objetivo`, `busquedas_secundarias`, `seo_titulo`, `seo_descripcion`), `fecha_publicacion` automática y `enlaces` derivado del cuerpo. La landing de ámbito `articulos` da el índice `/blog` (≥ 3 artículos).
- **Editor del cuerpo** (`collections/Articulos/editor.ts`): enlaces internos a documentos y bloque `ficha`; sin el nodo de relación genérico. Render propio en servidor (`components/content/RichText.tsx`) sobre `lib/richtext/lexical.ts`.
- **Enlazado en las dos direcciones**: el artículo pinta los enlaces resueltos por idioma, las tarjetas incrustadas y *"Sitios que aparecen en este artículo"*; fichas y municipios muestran *"Lo contamos en el blog"*. JSON-LD `BlogPosting` con `mentions`; OG `article`.
- **Revisión SEO** (`lib/seo/articleAudit.ts`): en el panel (campo `ui` en el desplegable SEO), en `GET /api/cms/auditoria/:id[?locale=]` y en `revisar` de la extensión. Avisa, no bloquea; umbrales en `AUDIT_LIMITS`.
- **Extensión 0.2.0**: `[texto](interno:coleccion/slug)` y `::ficha[coleccion/slug]` en el Markdown; instrucciones para escribir artículos. **Hay que reinstalar el `.mcpb`** (se regenera con `pnpm run package`).
- **Cabecera**: *Directorio* (desplegable `<details>`) + *Blog*; enlaces comunes en `components/layout/nav.ts`. **Home**: hero con accesos rápidos, rejilla del directorio con recuentos, últimos artículos, municipios, rutas y qué ver.
- Verificado en local con artículos `[DEMO]`: ES/EN, hreflang, enlaces resueltos y a borrador como texto, índice, tarjetas, enlaces de vuelta, sitemap y `llms.txt`, auditoría por API y extensión de extremo a extremo; móvil sin scroll horizontal. **Sin verificar**: el desplegable de escritorio a ojo (la ventana del navegador de pruebas no pasaba de 500 px) y el panel de revisión SEO dentro del admin (el endpoint sí).

### 4.8 Primer lote de contenido real (sesión 5)

- **`seed/*.json`**: 7 municipios (Cervera de Pisuerga, Aguilar de Campoo, Guardo y La Pernía con página; Brañosera y Pomar de Valdivia con intro corta; Dehesa de Montejo solo como contenedor) con 40 núcleos, 4 categorías (`restaurantes`, `hoteles`, `casas-rurales`/`holiday-cottages`, `turismo-activo`), 5 tipos de recurso, 19 negocios (uno en borrador), 6 recursos, 5 rutas con cifras de los folletos oficiales, 13 landings y 3 artículos. Autor: Pablo Aguado (solo nombre).
- Datos investigados en la web con `fuente_url` por registro; las notas de fuentes por colección están en `seed/notas/`. **Textos redactados por Claude por encargo expreso de Enol** (excepción a la regla 1): hay que revisarlos antes de `seed:prod`. Lista de comprobación y dudas en `seed/REVISION.md`.
- **El import admite artículos** (`seed/articulos.json`, cuerpo en Markdown con `interno:` y `::ficha[]`, mismo conversor que la extensión) y landings de ámbito `articulos`. Valida que cada enlace interno exista en el lote o en la BD.
- En local, la BD se reinició y tiene solo el lote real (copia de la anterior, solo `[DEMO]` y sin usuarios, en el scratchpad de la sesión). Hay que crear un usuario en `/admin`.

---

## 5. Decisiones y desviaciones (ya reflejadas en CLAUDE.md)

- **Redirects con 308** (`permanentRedirect` desde el catch-all), no 301 desde middleware. Equivalente para buscadores; evita consultar la BD en cada petición.
- **Un catch-all** en vez de carpetas por sección, porque los segmentos fijos están traducidos (`rutas`/`routes`).
- **Colecciones enteras en caché** en lugar de una consulta por página: el sitio tendrá cientos de fichas, no miles. Si crece mucho, revisar `lib/data/load.ts`.
- Campos añadidos al modelo respecto al brief: `resumen{es,en}` (rutas, recursos, planes), `altitud_m` y `distancias_km` en municipios, `inicio_coordenadas` en rutas, `ambito` y `titulo` en landings, `tipo`/`origen` en redirects, colección `archivos_gpx`.
- `WebSite` sin `SearchAction` hasta que exista la página de búsqueda.
- La firma de autor aún no enlaza (no existe la página de autor).

---

## 6. Trampas conocidas (no las repitas)

1. **Payload muta `req.locale`**: una operación local con `locale` y el `req` del hook cambia el idioma de toda la petición; la escritura acaba en ese idioma. En hooks, toda consulta a otro idioma va en `withLocale(req, fn)`.
2. **`context` en operaciones anidadas** se fusiona en `req.context` para el resto de la petición. Usa una marca en `req.context` y retírala en `finally` (ver `collections/Redirects`).
3. **Nada de `Promise.all` con `req`** dentro de hooks: misma transacción, consultas concurrentes.
4. **Import map del admin**: tras añadir `richText`, plugins o componentes custom, `pnpm generate:importmap`; si no, el admin falla al cargar el campo.
5. **Esquema dependiente del entorno**: cualquier plugin que añada campos solo con su clave rompe el build de producción (pasó con Blob). Genera migraciones con el esquema completo.
6. **Node 22 + CLI de Payload**: fallos aleatorios con código 13 y sin mensaje. Usa Node 24.
7. **`dynamicParams = false` en un layout** se hereda y bloquea las rutas no generadas (incluidas las URLs antiguas que deben redirigir). La home valida el locale ella misma.
8. **`vercel env rm NOMBRE <entorno>`** borra la variable entera si una entrada cubre varios entornos. Para variables de integraciones, reconecta el recurso con `vercel integration resource connect ... -e production`.
9. **`.env.production.local` en local**: `next build` y `next start` (modo producción) lo cargan, así que en local leen la BD de **producción** de Neon (y `next start` escribiría en ella y en Blob). `payload migrate` no (carga `.env`). Para un `next start` local, anula esas variables en el comando o no tengas el fichero.
10. **`migrate:create` pregunta en modo interactivo** ("created or renamed?") cuando desaparece una tabla o columna, y sin TTY muere con código 13. Ejecútalo con `expect` respondiendo Intro (crear) o desde una terminal. Revisa el SQL generado: tras un `DROP TABLE … CASCADE` emitió un `DROP CONSTRAINT` de una FK ya borrada (se corrigió con `IF EXISTS` antes de commitear).
11. **El `next dev` en marcha no recarga la configuración de Payload** (colecciones, endpoints) y puede **reescribir `importMap.js` con la configuración vieja**. Tras cambiar la configuración, reinicia `pnpm dev` y comprueba el import map antes de commitear.
12. **Subidas no transaccionales**: los ficheros (GPX, imágenes) no se deshacen con un rollback; `--dry-run` no los sube.
13. **El dataloader de un `req` cachea consultas**: en un proceso largo con un solo `req` (el import), la validación de relaciones puede dar por inexistente un documento creado después de una consulta que no lo encontró. El import renueva `req.payloadDataLoader` antes de cada escritura.
14. **`pnpm build` en local con `.env.production.local` presente** lee Neon de producción (trampa 9). Para los checks, exporta vacías las variables de ese fichero y carga `.env` en el mismo comando.

---

## 7. Pendiente (en orden sugerido)

1. **Pablo**: activar su API key en `/admin` de producción, mandarle `cms-mcp/nortepalentino-cms.mcpb` y probarlo con él en Claude Desktop.
2. **Revalidación remota**: ruta protegida (p. ej. `/api/revalidar` con `REVALIDATE_SECRET`) que el import llame al terminar con `--remote`. Sin ella, un lote cargado en producción no se ve hasta el siguiente despliegue. Solo afecta al import por seeds: lo que entra por la extensión o el panel ya revalida.
3. **Versiones `.md`** de cada página indexable (`{url}.md`, rewrite en `next.config` a un route handler), `<link rel="alternate" type="text/markdown">`, y que `llms.txt` apunte a ellas (CLAUDE.md §8).
4. **Lote real a producción**: revisar `seed/REVISION.md` y los textos, **desplegar** la sesión 4 (la migración borra las tablas de planes, vacías en producción), `pnpm seed:prod --dry-run` y `pnpm seed:prod` (lo lanza una persona), y validar `BlogPosting`, `Hotel`/`Restaurant`, `TouristTrip` y `Church` en el Rich Results Test.
5. **Autores** (`/autores/{slug}`, `ProfilePage` + `Person`) y enlazar `AuthorByline`.
6. **Búsqueda** (`/buscar?q=`, `noindex`, full-text con `unaccent`; migración con la extensión) y `SearchAction` en `WebSite`.
7. **Sobre nosotros y legales**: plantillas listas para textos que redacta una persona (no inventar contenido).
8. **Consentimiento + GA4** (`vanilla-cookieconsent`, Consent Mode v2) y la isla `AnalyticsEvents` que lea los `data-event` existentes.
9. **Imagen OG** con `next/og` y logotipo/símbolo SVG (DESIGN.md §9).
10. **FilterBar en listados de negocios** (atributos de familia).
11. **Email de Payload** (Resend o similar) para la recuperación de contraseña del admin.
12. **Claves de Google Maps** y estilo JSON definitivo de Static Maps (DESIGN.md §9).
13. Antes del lanzamiento: dominio + `NEXT_PUBLIC_SITE_URL`, validar plantillas en Rich Results Test, `SITE_INDEXABLE=true`, Search Console.

Ideas menores: el núcleo que cambia de municipio no actualiza sus negocios hasta que se guardan; test automatizados (no hay ninguno; las pruebas de esta sesión fueron scripts de humo contra la BD local).

---

## 8. Registro de sesiones

### Sesión 1 · 2026-10-16/17

Estructura inicial, modelo de datos completo con hooks y migraciones, despliegue en Vercel con Neon y Blob, import de seeds, plantillas de municipio/listados/fichas/rutas/recursos con SEO técnico, sitemap y `llms.txt`. Incidencias resueltas: idioma de escritura en hooks, esquema de Blob distinto entre entornos (build roto en prod), CLI de Payload inestable con Node 22, `dynamicParams` heredado, 500 con locale inválido, borrado accidental de las variables de Neon en Vercel (restauradas). Commits `ab49715` → `b1959ee`.

### Sesión 2 · 2026-10-17

Rediseño de la UI hacia "producto outdoor" (§4.5): tokens, tipografía, cabecera fija, pie con siluetas, hero de la home, `PageHero`, tarjetas, KeyFacts, FAQs, filtros y acciones. DESIGN.md actualizado al nuevo sistema.

### Sesión 4 · 2026-10-17

Reorganización en Directorio + Blog + Home (§4.7): colección `articulos` con enlaces internos y bloque de ficha, plantillas de artículo e índice, enlaces de vuelta desde fichas y municipios, cabecera y home nuevas, revisión SEO (panel, API y extensión) y extensión 0.2.0. Commits `5bd64e4` → docs.

### Sesión 5 · 2026-10-17

Primer lote de contenido real (§4.8): investigación en la web con fuentes, textos ES/EN, import de artículos en los seeds y corrección del dataloader en el import. Cargado y verificado en local (todas las plantillas en ES/EN, enlaces de los artículos resueltos, idempotencia con y sin `--update`). Sin cargar en producción.

### Sesión 3 · 2026-10-17

Extensión de Claude Desktop (`cms-mcp/`, §4.6) para gestionar el contenido por la API REST de Payload: API keys en `users` (migración `api_keys_usuarios`), endpoint `/api/cms/esquema` y servidor MCP empaquetado como `.mcpb`. Commit `ea24082`.
