# Norte Palentino CMS · extensión de Claude Desktop

Servidor MCP local, empaquetado como extensión de Claude Desktop (`.mcpb`), que deja gestionar el contenido de la web desde el chat de Claude: buscar, leer, crear y actualizar fichas en ES y EN, subir fotos y GPX, revisar qué falta para publicar y borrar.

Habla con la API REST de Payload del despliegue (`/api/...`) usando la API key del usuario. Pasa por los mismos hooks que el panel: validaciones para publicar, slugs reservados, redirects automáticos y revalidación de la caché, así que los cambios se ven en la web al momento. El esquema de campos lo sirve la propia web (`/api/cms/esquema`, `src/endpoints/schema.ts`). Por eso, si cambia una colección, **no hace falta reempaquetar la extensión**.

## Instalación (editor)

1. En `https://nortepalentino.vercel.app/admin` → *Usuarios* → tu usuario, marca **Habilitar la API key**, guarda y copia la clave.
2. Abre `nortepalentino-cms.mcpb` con doble clic (o *Ajustes → Extensiones → Instalar extensión…* en Claude Desktop).
3. En los ajustes de la extensión pega la API key. Deja la URL tal cual hasta que se conecte el dominio.
4. En un chat nuevo, prueba con: *"¿Qué municipios hay en Norte Palentino?"*.

Para subir fotos o GPX, indica a Claude la ruta del fichero en tu ordenador (p. ej. `/Users/pablo/Fotos/cervera.jpg`). Las imágenes adjuntadas al chat no se pueden subir. El máximo son 4,4 MB por fichero, que es el límite de las funciones de Vercel; las más grandes se suben desde `/admin`.

La API key da los mismos permisos que tu usuario del panel. No la compartas. Si se filtra, desactívala y genera otra en `/admin`.

## Herramientas

| Herramienta | Qué hace |
| :-- | :-- |
| `esquema` | Campos de una colección (tipo, traducido, obligatorio, valores) |
| `referencias` | Municipios con núcleos, categorías, tipos de recurso y autores, con slugs |
| `buscar` | Por texto, municipio o estado, incluidos borradores |
| `leer` | Documento completo, con los traducidos como `{es, en}` y el rich text en Markdown |
| `cobertura` | Estado de todo el contenido: listados frente al mínimo de 3, municipios, fichas por idioma y borradores incompletos (endpoint `/api/cms/cobertura`) |
| `mantenimiento` | Enlaces caídos (cron semanal), verificaciones de más de 6 meses y borradores abandonados (endpoint `/api/cms/mantenimiento`) |
| `revisar` | Qué falta para publicar y si la página existe en ES y EN. En artículos, la revisión SEO de cada idioma (endpoint `/api/cms/auditoria/:id`) |
| `crear` / `actualizar` | Escribe primero ES y luego EN. Relaciones por slug |
| `subir_imagen` / `subir_gpx` | Desde una ruta local |
| `borrar` | Irreversible. Solo si el editor lo pide expresamente |

Las reglas de contenido que recibe Claude están en [`src/instructions.mjs`](src/instructions.mjs).

El cuerpo de los artículos se escribe en Markdown, con dos extensiones para enlazar el directorio (`src/lexical.mjs`): `[texto](interno:coleccion/slug)` crea un enlace interno a un documento (sobrevive a cambios de slug) y una línea `::ficha[coleccion/slug]` incrusta la tarjeta de una ficha. Al leer, salen igual (con el id si la relación no viene poblada).

## Desarrollo

Es un paquete aparte del proyecto Next, en JS plano (sin TypeScript), que se empaqueta en un único fichero con esbuild.

```bash
cd cms-mcp
pnpm install --ignore-workspace
pnpm run package   # → nortepalentino-cms.mcpb (bundle en server/ + manifest.json)
```

Para probarlo contra local, `CMS_URL=http://localhost:3000 CMS_API_KEY=… node server/index.mjs` con cualquier cliente MCP. Necesitas un usuario local con la API key habilitada.

Sube `version` en `manifest.json` y en `src/index.mjs` cuando cambies las herramientas o las instrucciones, y vuelve a mandar el `.mcpb`.
