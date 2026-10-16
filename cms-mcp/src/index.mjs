import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

import { ApiError, createApi } from './api.mjs'
import { createContent } from './content.mjs'
import { instructions } from './instructions.mjs'

// Servidor MCP de Norte Palentino para Claude Desktop. Habla con la API REST
// de Payload del despliegue (CMS_URL) con la API key del usuario (CMS_API_KEY).
const baseUrl = process.env.CMS_URL || 'https://nortepalentino.vercel.app'
const apiKey = process.env.CMS_API_KEY

const api = createApi({ baseUrl, apiKey: apiKey ?? '' })
const content = createContent(api)

const server = new McpServer({ name: 'nortepalentino-cms', version: '0.1.0' }, { instructions })

const text = (value) => ({
  content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
})

// Los errores de la web vuelven a Claude como texto para que pueda corregir
function tool(name, config, handler) {
  server.registerTool(name, config, async (args) => {
    try {
      if (!apiKey) throw new ApiError('Falta la API key. Ponla en los ajustes de la extensión en Claude Desktop.')
      return text(await handler(args))
    } catch (error) {
      if (!(error instanceof ApiError)) console.error(error)
      return { ...text(error.message), isError: true }
    }
  })
}

const coleccion = z
  .string()
  .describe('Colección: municipios, nucleos, negocios, categorias_negocio, recursos, tipos_recurso, rutas, planes, landings, autores, media, archivos_gpx o redirects')
const ref = z.union([z.number(), z.string()]).describe('id numérico o slug (ES o EN) del documento')
const datos = z
  .record(z.string(), z.unknown())
  .describe('Campos a guardar. Los traducidos como {"es": …, "en": …}; las relaciones por slug o id')
const readOnly = { readOnlyHint: true, openWorldHint: true }

tool(
  'esquema',
  {
    title: 'Campos de una colección',
    description:
      'Devuelve los campos de una colección (o la lista de colecciones si no indicas ninguna): tipo, si están traducidos, si son obligatorios, valores admitidos y relaciones.',
    inputSchema: { coleccion: coleccion.optional() },
    annotations: readOnly,
  },
  async ({ coleccion: slug }) => {
    if (slug) return content.collection(slug)
    const { colecciones } = await api.schema()
    return colecciones.map((c) => ({ slug: c.slug, nombre: c.nombre }))
  },
)

tool(
  'referencias',
  {
    title: 'Municipios, categorías y autores',
    description:
      'Lista los municipios con sus núcleos, las categorías de negocio, los tipos de recurso y los autores, con sus slugs. Úsalo para rellenar relaciones.',
    inputSchema: {},
    annotations: readOnly,
  },
  async () => {
    const all = (slug, locale = 'es') => api.find(slug, { limit: 500, depth: 0, locale, sort: 'nombre' }).then((r) => r.docs)
    const municipios = await all('municipios')
    const nucleos = await all('nucleos')
    const taxonomy = (docs) => docs.map((d) => ({ id: d.id, slug: d.slug, nombre: d.nombre_plural }))
    return {
      municipios: municipios.map((m) => ({
        id: m.id,
        slug: m.slug,
        nombre: m.nombre,
        nucleos: nucleos.filter((n) => n.municipio === m.id).map((n) => n.slug),
      })),
      categorias_negocio: taxonomy(await all('categorias_negocio', 'all')),
      tipos_recurso: taxonomy(await all('tipos_recurso', 'all')),
      autores: (await all('autores')).map((a) => ({ id: a.id, slug: a.slug, nombre: a.nombre })),
    }
  },
)

tool(
  'buscar',
  {
    title: 'Buscar contenido',
    description:
      'Busca documentos de una colección por texto en el nombre o título, por municipio o por estado. Incluye borradores. Devuelve id, slug, estado, fecha de verificación y en qué idiomas tiene texto.',
    inputSchema: {
      coleccion,
      texto: z.string().optional().describe('Parte del nombre o título'),
      municipio: z.string().optional().describe('Slug del municipio'),
      estado: z.enum(['borrador', 'publicado']).optional(),
      limite: z.number().int().min(1).max(100).optional().describe('Por defecto 25'),
      pagina: z.number().int().min(1).optional(),
    },
    annotations: readOnly,
  },
  async ({ coleccion: slug, texto, municipio, estado, limite = 25, pagina = 1 }) => {
    const { campos } = await content.collection(slug)
    const has = (name) => campos.some((f) => f.nombre === name)
    const title = ['nombre', 'titulo', 'nombre_interno', 'desde', 'filename', 'alt'].find(has)
    const and = []
    if (texto && title) {
      // En los campos traducidos se busca en los dos idiomas
      const localized = campos.find((f) => f.nombre === title)?.traducido
      and.push(
        localized
          ? { or: content.LOCALES.map((l) => ({ [`${title}.${l}`]: { like: texto } })) }
          : { [title]: { like: texto } },
      )
    }
    if (municipio) {
      if (!has('municipio')) throw new ApiError(`${slug} no tiene municipio.`)
      and.push({ municipio: { equals: await content.resolveId('municipios', municipio) } })
    }
    if (estado) and.push({ estado: { equals: estado } })

    const result = await api.find(slug, {
      where: and.length ? { and } : undefined,
      limit: limite,
      page: pagina,
      depth: 0,
      locale: 'all',
      sort: '-updatedAt',
    })
    const main = content.mainText(slug)
    return {
      total: result.totalDocs,
      pagina: result.page,
      paginas: result.totalPages,
      documentos: result.docs.map((doc) => ({
        id: doc.id,
        nombre: content.titleOf(doc),
        slug: doc.slug,
        estado: doc.estado,
        fecha_verificacion: doc.fecha_verificacion,
        actualizado: doc.updatedAt,
        ...(main && { idiomas_con_texto: content.LOCALES.filter((l) => doc[main]?.[l]) }),
      })),
    }
  },
)

tool(
  'leer',
  {
    title: 'Leer un documento',
    description: 'Devuelve un documento completo con los campos traducidos en los dos idiomas ({es, en}).',
    inputSchema: { coleccion, ref },
    annotations: readOnly,
  },
  async ({ coleccion: slug, ref: docRef }) => {
    const { campos } = await content.collection(slug)
    const id = await content.resolveId(slug, docRef)
    return content.simplify(campos, await api.findById(slug, id, { locale: 'all', depth: 1 }))
  },
)

tool(
  'revisar',
  {
    title: 'Qué falta para publicar',
    description:
      'Indica qué le falta a un documento para poder publicarse y si su página existe en español y en inglés.',
    inputSchema: { coleccion, ref },
    annotations: readOnly,
  },
  async ({ coleccion: slug, ref: docRef }) => {
    const { campos } = await content.collection(slug)
    const id = await content.resolveId(slug, docRef)
    const doc = await api.findById(slug, id, { locale: 'all', depth: 0 })
    return `${content.titleOf(doc) ?? ''} (id ${id})\n${content.review(slug, campos, doc)}`
  },
)

tool(
  'crear',
  {
    title: 'Crear un documento',
    description:
      'Crea un documento. Entra como borrador salvo que pongas "estado": "publicado". Escribe primero el español y después el inglés.',
    inputSchema: { coleccion, datos },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  },
  async ({ coleccion: slug, datos: data }) => {
    const { campos } = await content.collection(slug)
    const { id, doc } = await content.write(slug, undefined, data)
    return { creado: id, slug: doc?.slug, revision: content.review(slug, campos, await api.findById(slug, id, { locale: 'all', depth: 0 })) }
  },
)

tool(
  'actualizar',
  {
    title: 'Actualizar un documento',
    description:
      'Cambia solo los campos que envíes. Para publicar, "estado": "publicado"; para despublicar, "borrador". Los campos traducidos admiten un solo idioma.',
    inputSchema: { coleccion, ref, datos },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ coleccion: slug, ref: docRef, datos: data }) => {
    const { campos } = await content.collection(slug)
    const { id } = await content.write(slug, docRef, data)
    return { actualizado: id, revision: content.review(slug, campos, await api.findById(slug, id, { locale: 'all', depth: 0 })) }
  },
)

tool(
  'subir_imagen',
  {
    title: 'Subir una foto',
    description:
      'Sube una imagen desde una ruta local del ordenador (máx. 4,4 MB) y devuelve su id para usarlo en fotos o foto_portada.',
    inputSchema: {
      ruta: z.string().describe('Ruta absoluta del fichero, p. ej. /Users/pablo/Fotos/cervera.jpg'),
      alt: z.object({ es: z.string(), en: z.string().optional() }).describe('Texto alternativo descriptivo'),
      credito: z.string().optional().describe('Autor de la foto; obligatorio si no es propia'),
      licencia: z.string().optional(),
      es_propia: z.boolean().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  },
  async ({ ruta, alt, credito, licencia, es_propia }) => {
    const doc = await api.upload('media', ruta, { alt: alt.es, credito, licencia, es_propia }, 'es')
    if (alt.en) await api.update('media', doc.id, { alt: alt.en }, 'en')
    return { id: doc.id, filename: doc.filename, url: doc.url }
  },
)

tool(
  'subir_gpx',
  {
    title: 'Subir un track GPX',
    description: 'Sube un .gpx desde una ruta local y devuelve su id para el campo gpx de una ruta.',
    inputSchema: { ruta: z.string().describe('Ruta absoluta del fichero .gpx') },
    annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  },
  async ({ ruta }) => {
    const doc = await api.upload('archivos_gpx', ruta, {}, 'es')
    return { id: doc.id, filename: doc.filename, puntos: doc.puntos }
  },
)

tool(
  'borrar',
  {
    title: 'Borrar un documento',
    description:
      'Borra un documento de forma irreversible. Solo si el editor lo pide expresamente y lo ha confirmado. Para quitar algo de la web sin perderlo, mejor pásalo a borrador.',
    inputSchema: { coleccion, ref },
    annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
  },
  async ({ coleccion: slug, ref: docRef }) => {
    const id = await content.resolveId(slug, docRef)
    await api.remove(slug, id)
    return `Borrado ${slug} ${id}.`
  },
)

await server.connect(new StdioServerTransport())
