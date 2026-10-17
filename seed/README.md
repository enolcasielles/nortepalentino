# Seeds: contrato de datos

Formato de los ficheros JSON que se cargan en Payload con `pnpm seed`. La definición exacta (y la que manda si hay dudas) es [`schema.ts`](schema.ts). En [`examples/`](examples/) hay un ejemplo válido de cada fichero, con datos `[DEMO]`.

## Cómo se importa

```bash
pnpm seed --dry-run      # valida y simula, sin escribir nada
pnpm seed                # crea lo que falta; lo que ya existe no se toca
pnpm seed --update       # además sobrescribe los campos que vengan en el JSON
pnpm seed --dir otra/carpeta
```

- **Idempotente por slug** (en los slugs traducidos, por el `es`). Las landings se identifican por su combinación de `ambito`, `municipio`, `categoria` y `filtro`.
- **Nunca borra nada.** Con `--update`, un campo ausente en el JSON se queda como está.
- **Todo o nada:** si un solo registro falla, no se importa nada y sale un informe con todos los errores (fichero, posición, slug y campo).
- Un registro sin `"estado"` entra como **borrador**. Para que se publique hay que poner `"estado": "publicado"`, y eso exige `fuente_url` y `fecha_verificacion`. Las rutas exigen además distancia, desnivel, duración y dificultad.

## Convenciones

- **Slugs:** minúsculas, sin tildes, con guiones (`brañosera` → `branosera`). Municipios, núcleos, negocios y autores tienen el mismo slug en los dos idiomas; categorías, tipos de recurso, recursos y rutas lo tienen traducido: `{ "es": "rutas-con-ninos", "en": "family-walks" }`.
- **Textos traducidos:** `{ "es": "…", "en": "…" }`. Si falta el `en`, esa ficha no existirá en inglés. Si un registro trae cualquier texto en inglés, su `nombre` (y `nombre_plural` en categorías) también tiene que venir en inglés.
- **Coordenadas:** `lat` y `lng` en grados decimales (`42.866`, `-4.497`). Fuera de la zona dan error, lo que también detecta latitud y longitud intercambiadas.
- **Fechas:** `AAAA-MM-DD`. **URLs:** completas, con `https://`.
- **Referencias** por slug: `categoria` y `tipo` usan el slug **ES**; `nucleo`, `inicio_nucleo`, `municipio` y `autor`, el slug normal. Pueden apuntar a algo del mismo lote o a algo que ya esté en la base de datos.
- Los números de las rutas son **verificados, nunca estimados**. Si no se conocen, se omiten (y la ruta no se puede publicar).

## Ficheros

Todos son opcionales; se importan en este orden.

| Fichero | Qué contiene | Clave |
| :-- | :-- | :-- |
| `autores.json` | Personas que firman: `nombre`, `bio`, `relacion_con_la_zona`, `enlaces` | `slug` |
| `categorias.json` | Categorías de negocio: `nombre`, `nombre_plural`, `tipo_schema`, `color_token`, `icono` | `slug.es` |
| `tipos_recurso.json` | Tipos de "qué ver", misma forma que las categorías | `slug.es` |
| `municipios.json` | Municipios con sus `nucleos` dentro, `intro`, `faqs`, datos clave | `slug` |
| `negocios.json` | Dónde dormir, comer, actividades, tiendas | `slug` |
| `recursos.json` | Lugares que se visitan (iglesias, miradores, museos…) | `slug.es` |
| `rutas.json` | Rutas con datos técnicos; `gpx` es una ruta a un `.gpx` dentro de la carpeta de seeds | `slug.es` |
| `landings.json` | Intro y FAQs de listados (`ambito`: `negocios`, `rutas`, `recursos` o `articulos`) | combinación |
| `articulos.json` | Artículos del blog: `titulo`, `resumen`, `cuerpo` en Markdown, `faqs`, campos SEO, `autor` | `slug.es` |

Valores cerrados (definidos en `src/lib/taxonomies.ts` y `src/lib/icons.ts`):

- `atributos_familia`: `admite-ninos`, `cuna`, `trona`, `menu-infantil`, `accesible-carrito`, `jardin-cerrado`, `admite-mascotas`, `parking`, `chimenea`
- `dificultad`: `facil`, `moderada`, `dificil` · `temporada`: `primavera`, `verano`, `otono`, `invierno`
- `precio_rango`: `€` a `€€€€` · `color_token`: `dormir`, `comer`, `activo`, `rutas`, `romanico`, `naturaleza`, `museo`
- `horario_texto` en negocios admite texto plano (se guarda solo en ES) o `{ "es", "en" }`.

El `cuerpo` de los artículos se escribe en Markdown, como en la extensión de Claude Desktop: `##` y `###`, listas, **negrita**, *cursiva*, enlaces externos y, para el directorio, `[texto](interno:coleccion/slug)` (`negocios`, `rutas`, `recursos`, `municipios`, `articulos`) y una línea sola con `::ficha[coleccion/slug]` (`negocios`, `rutas`, `recursos`). En los slugs traducidos se usa el ES en los dos idiomas. Un artículo puede enlazar a otro del mismo lote solo si va antes en el fichero. Publicar exige `autor`; `fecha_publicacion` se fija sola.

Las fotos no se importan: se gestionan en el panel (`/admin`) o con la extensión.

## Lote real

Los ficheros de esta carpeta son el primer lote de contenido real. Antes de llevarlos a producción, una persona tiene que revisar los textos y los puntos pendientes de [`REVISION.md`](REVISION.md).

## Contra producción

Por defecto el import se niega a escribir en una base de datos que no sea local. Para producción está `pnpm seed:prod`, que lee `.env.production.local` en lugar de `.env` y añade `--remote`:

```bash
vercel env pull .env.production.local --environment=production   # una vez; luego pega PAYLOAD_SECRET a mano
pnpm seed:prod --dry-run
pnpm seed:prod
```

Ese fichero trae `VERCEL_ENV=production`, así que los registros `[DEMO]` se rechazan. Lo cargado no se ve en la web hasta el siguiente despliegue.
