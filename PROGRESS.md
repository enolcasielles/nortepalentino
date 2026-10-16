# PROGRESS.md — Norte Palentino

Registro del avance de la implementación. **Léelo después de [`CLAUDE.md`](CLAUDE.md) y antes de tu primera tarea**, y actualízalo al terminar cada sesión: estado, qué hiciste, qué decidiste y qué queda. Las reglas viven en CLAUDE.md y DESIGN.md; aquí va el estado y el contexto que no se deduce del código.

---

## 1. Estado actual

| | |
| :-- | :-- |
| Última actualización | 2026-10-17 |
| Último commit en `main` | `b1959ee` (desplegado y verificado en producción) |
| Producción | https://nortepalentino.vercel.app (pública, `noindex` por `SITE_INDEXABLE=false`) |
| Contenido en producción | **Ninguno.** Neon solo tiene el usuario admin; solo existe la home. Las páginas aparecen al cargar datos que cumplan §7.4 |
| Admin | `/admin`. El primer usuario ya está creado |
| Dominio | Sin conectar; las URLs canónicas usan `nortepalentino.vercel.app` hasta que se defina `NEXT_PUBLIC_SITE_URL` |

**Fases del brief (§9, "MVP terminado"):**

- [x] Desplegada en una URL de Vercel con `noindex`
- [ ] 3 municipios con página completa en ES y EN → **falta contenido** (lo prepara Pablo; las plantillas están listas)
- [ ] Fichas reales de las 3 cabeceras con JSON-LD validado en el Rich Results Test → falta contenido y la validación
- [x] Filtros de rutas funcionando (faltan las 5 rutas reales)
- [x] Payload admin accesible para que Pablo edite

---

## 2. Arrancar en local

```bash
nvm use                       # Node 24 (.nvmrc). Con Node 22 la CLI de Payload falla al azar (ver §6)
pnpm install
docker compose up -d          # Postgres en el puerto 5435
cp .env.example .env          # y rellena PAYLOAD_SECRET (openssl rand -hex 32)
pnpm payload migrate
pnpm seed --dir seed/examples # fixtures [DEMO]: dan datos a todas las plantillas
pnpm dev                      # http://localhost:3000/es · /admin (crea un usuario local)
```

URLs útiles con los fixtures: `/es/demo-villa`, `/es/demo-villa/demo-restaurantes`, `/es/demo-villa/demo-restaurantes/con-ninos`, `/es/demo-restaurantes`, `/es/demo-villa/demo-restaurantes/demo-restaurante-ejemplo`, `/es/rutas`, `/es/rutas/con-ninos`, `/es/rutas/demo-senda-ejemplo`, `/es/que-ver`, `/es/que-ver/demo-iglesia-ejemplo` y sus equivalentes EN (`/en/routes/...`, `/en/sights/...`).

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
- **Componentes** (DESIGN.md §5): `KeyFacts`, `DifficultyMark`, `TrailArrow`, `FamilyAttributes`, `VerifiedNote`, `AuthorByline`, `FaqList`, `ExperienceBlock`, `Prose`, tarjetas (`BusinessCard`, `RouteCard`, `SightCard`, `MunicipioCard`), `ContactActions` (fijo abajo en móvil, con `data-event` para analítica futura), `NearbyList`, `RouteFilterBar`, `Breadcrumbs`, `SiteHeader` (menú con `<details>`), `SiteFooter`.
- **Mapas**: `MapFacade` (única isla de cliente) + imagen de Static Maps servida desde `/mapas/{locale}/{ruta de la página}` para no exponer la clave. Sin clave no se renderiza.
- **SEO**: `buildMetadata` (título con marca, descripción recortada, canonical, hreflang + `x-default`), JSON-LD por tipo en `lib/seo/jsonld/` (City, tipos de negocio, TouristTrip, Church/TouristAttraction, CollectionPage+ItemList, BreadcrumbList, FAQPage, WebSite, Organization), `/sitemap.xml` (índice) + `/sitemaps/{es,en}.xml` con alternates, `/llms.txt`, `/llms-full.txt`, `robots.txt` con bots de IA y sitemap.
- Microcopy ES/EN en `lib/i18n/{es,en}.ts` (incluye plurales y etiquetas de taxonomías); formateo de fechas/cifras en `lib/i18n/format.ts`.

**Verificado:** todas las plantillas en ES y EN con fixtures (código HTTP, título, canonical, hreflang, un único H1, tipos JSON-LD), filtros y redirect en build de producción, 360 px sin scroll horizontal y objetivos táctiles ≥ 44 px, despliegue en producción.

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
9. **Subidas no transaccionales**: los ficheros (GPX, imágenes) no se deshacen con un rollback; `--dry-run` no los sube.

---

## 7. Pendiente (en orden sugerido)

1. **Revalidación remota**: ruta protegida (p. ej. `/api/revalidar` con `REVALIDATE_SECRET`) que el import llame al terminar con `--remote`. Sin ella, un lote cargado en producción no se ve hasta el siguiente despliegue. **Necesario antes del primer lote real de Pablo.**
2. **Versiones `.md`** de cada página indexable (`{url}.md`, rewrite en `next.config` a un route handler), `<link rel="alternate" type="text/markdown">`, y que `llms.txt` apunte a ellas (CLAUDE.md §8).
3. **Planes** (`/planes`, `/planes/{slug}`): plantilla con rich text de Lexical, tarjetas incrustadas, índice si > 3 H2, JSON-LD `Article`. Añadir al índice, `matchRoute` e inventario.
4. **Autores** (`/autores/{slug}`, `ProfilePage` + `Person`) y enlazar `AuthorByline`.
5. **Búsqueda** (`/buscar?q=`, `noindex`, full-text con `unaccent`; migración con la extensión) y `SearchAction` en `WebSite`.
6. **Sobre nosotros y legales**: plantillas listas para textos que redacta una persona (no inventar contenido).
7. **Consentimiento + GA4** (`vanilla-cookieconsent`, Consent Mode v2) y la isla `AnalyticsEvents` que lea los `data-event` existentes.
8. **Imagen OG** con `next/og` y logotipo/símbolo SVG (DESIGN.md §9).
9. **FilterBar en listados de negocios** (atributos de familia).
10. **Email de Payload** (Resend o similar) para la recuperación de contraseña del admin.
11. **Claves de Google Maps** y estilo JSON definitivo de Static Maps (DESIGN.md §9).
12. Antes del lanzamiento: dominio + `NEXT_PUBLIC_SITE_URL`, validar plantillas en Rich Results Test, `SITE_INDEXABLE=true`, Search Console.

Ideas menores: el núcleo que cambia de municipio no actualiza sus negocios hasta que se guardan; test automatizados (no hay ninguno; las pruebas de esta sesión fueron scripts de humo contra la BD local).

---

## 8. Registro de sesiones

### Sesión 1 · 2026-10-16/17

Estructura inicial, modelo de datos completo con hooks y migraciones, despliegue en Vercel con Neon y Blob, import de seeds, plantillas de municipio/listados/fichas/rutas/recursos con SEO técnico, sitemap y `llms.txt`. Incidencias resueltas: idioma de escritura en hooks, esquema de Blob distinto entre entornos (build roto en prod), CLI de Payload inestable con Node 22, `dynamicParams` heredado, 500 con locale inválido, borrado accidental de las variables de Neon en Vercel (restauradas). Commits `ab49715` → `b1959ee`.
