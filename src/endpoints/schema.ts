import type { Endpoint, FlattenedField, SanitizedCollectionConfig } from 'payload'

// Colecciones que no se exponen al editor por API
const HIDDEN = new Set(['users'])
// Campos que gestiona Payload o un hook: no se escriben a mano
const SYSTEM_FIELDS = new Set(['id', 'createdAt', 'updatedAt', 'sizes', 'focalX', 'focalY', 'prefix'])

type SchemaField = {
  nombre: string
  tipo: string
  traducido?: true
  obligatorio?: true
  solo_lectura?: true
  multiple?: true
  relacion?: string | string[]
  opciones?: string[]
  descripcion?: string
  campos?: SchemaField[]
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'es' in value && typeof value.es === 'string') return value.es
  return undefined
}

function describeFields(fields: FlattenedField[]): SchemaField[] {
  return fields
    .filter((field) => !SYSTEM_FIELDS.has(field.name) && !field.hidden && !field.admin?.disabled)
    .map((field) => {
      const out: SchemaField = { nombre: field.name, tipo: field.type }
      if (field.localized) out.traducido = true
      if ('required' in field && field.required) out.obligatorio = true
      if (field.admin?.readOnly) out.solo_lectura = true
      if ('hasMany' in field && field.hasMany) out.multiple = true
      if ('relationTo' in field) out.relacion = field.relationTo
      if ('options' in field) {
        out.opciones = field.options.map((option) => (typeof option === 'string' ? option : option.value))
      }
      const description = [text(field.label), text(field.admin?.description)].filter(Boolean).join('. ')
      if (description) out.descripcion = description
      if ('flattenedFields' in field) out.campos = describeFields(field.flattenedFields)
      return out
    })
}

function describeCollection(collection: SanitizedCollectionConfig) {
  return {
    slug: collection.slug,
    nombre: text(collection.labels.plural) ?? collection.slug,
    subida: Boolean(collection.upload),
    campos: describeFields(collection.flattenedFields),
  }
}

// Esquema de las colecciones editables para la extensión de Claude Desktop
// (cms-mcp/). Se sirve desde el propio despliegue para que la extensión no
// tenga que reempaquetarse cada vez que cambia el modelo de datos.
export const schemaEndpoint: Endpoint = {
  path: '/cms/esquema',
  method: 'get',
  handler: (req) => {
    if (!req.user) return Response.json({ error: 'No autorizado' }, { status: 401 })
    const collections = req.payload.config.collections
      .filter((collection) => !HIDDEN.has(collection.slug) && !collection.slug.startsWith('payload-'))
      .map(describeCollection)
    return Response.json({ locales: ['es', 'en'], colecciones: collections })
  },
}
