import { ApiError } from './api.mjs'
import { lexicalToMarkdown, markdownToLexical } from './lexical.mjs'

export const LOCALES = ['es', 'en']
const TITLE_FIELDS = ['nombre', 'titulo', 'nombre_interno', 'desde', 'filename']

// Texto principal de cada colección: sin él en un idioma, la página no existe
// en ese idioma (CLAUDE.md §7.4, lib/seo/indexability.ts)
const MAIN_TEXT = {
  municipios: 'intro',
  negocios: 'descripcion',
  rutas: 'descripcion',
  recursos: 'descripcion',
  planes: 'cuerpo',
  landings: 'intro',
  autores: 'bio',
}

// Requisitos para publicar que valida Payload (src/fields/validation.ts)
const REQUIRED_TO_PUBLISH = {
  negocios: ['fuente_url', 'fecha_verificacion'],
  recursos: ['fuente_url', 'fecha_verificacion'],
  rutas: ['fuente_url', 'fecha_verificacion', 'distancia_km', 'desnivel_m', 'duracion_h', 'dificultad'],
  planes: ['autor'],
}

const isEmpty = (value) =>
  value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const titleOf = (doc) => TITLE_FIELDS.map((name) => doc?.[name]).find((value) => !isEmpty(value))

export function createContent(api) {
  let schema

  async function collection(slug) {
    schema ??= await api.schema()
    const found = schema.colecciones.find((c) => c.slug === slug)
    if (!found) {
      throw new ApiError(`No existe la colección "${slug}". Disponibles: ${schema.colecciones.map((c) => c.slug).join(', ')}.`)
    }
    return found
  }

  // Un documento se identifica por id o por slug (en ES o EN). Las colecciones
  // sin slug (landings, media, redirects, GPX) admiten su nombre o título.
  async function resolveId(slug, ref) {
    if (typeof ref === 'number' || /^\d+$/.test(String(ref))) return Number(ref)
    const { campos } = await collection(slug)
    const key = campos.some((f) => f.nombre === 'slug') ? 'slug' : campos.find((f) => TITLE_FIELDS.includes(f.nombre))?.nombre
    if (key) {
      for (const locale of LOCALES) {
        const { docs } = await api.find(slug, { where: { [key]: { equals: ref } }, locale, depth: 0, limit: 1 })
        if (docs.length) return docs[0].id
      }
    }
    throw new ApiError(`No encuentro "${ref}" en ${slug}. Usa buscar para ver qué hay.`)
  }

  async function convert(field, value) {
    if (value === null) return null
    if (field.tipo === 'relationship' || field.tipo === 'upload') {
      const target = Array.isArray(field.relacion) ? null : field.relacion
      const one = async (v) => {
        if (typeof v === 'number' || /^\d+$/.test(String(v))) return Number(v)
        if (!target) throw new ApiError(`El campo ${field.nombre} necesita ids.`)
        return resolveId(target, v)
      }
      if (field.multiple) {
        if (!Array.isArray(value)) throw new ApiError(`El campo ${field.nombre} es una lista: usa [ ... ].`)
        const ids = []
        for (const v of value) ids.push(await one(v))
        return ids
      }
      return one(value)
    }
    if (field.tipo === 'richText' && typeof value === 'string') return markdownToLexical(value)
    return value
  }

  // Reparte los datos en lo común + ES (primera escritura) y lo EN (segunda).
  // Los campos traducidos llegan como { es, en }.
  async function split(fields, data, path = '') {
    const out = { es: {}, en: {} }
    for (const [key, value] of Object.entries(data)) {
      const field = fields.find((f) => f.nombre === key)
      const name = path + key
      if (!field) {
        if (key === 'id') continue
        throw new ApiError(`El campo "${name}" no existe. Campos válidos: ${fields.map((f) => f.nombre).join(', ')}.`)
      }
      if (field.solo_lectura) throw new ApiError(`El campo "${name}" se calcula solo y no se puede escribir.`)

      if (field.traducido) {
        const keys = isPlainObject(value) ? Object.keys(value) : []
        if (!keys.length || keys.some((k) => !LOCALES.includes(k))) {
          throw new ApiError(`El campo "${name}" está traducido: escríbelo como {"es": …, "en": …} (puedes poner solo uno).`)
        }
        for (const locale of keys) out[locale][key] = await convert(field, value[locale])
      } else if (field.tipo === 'group') {
        if (value === null) {
          out.es[key] = null
          continue
        }
        const sub = await split(field.campos, value, `${name}.`)
        if (Object.keys(sub.es).length) out.es[key] = sub.es
        if (Object.keys(sub.en).length) out.en[key] = sub.en
      } else if (field.tipo === 'array') {
        if (value === null) {
          out.es[key] = []
          continue
        }
        if (!Array.isArray(value)) throw new ApiError(`El campo "${name}" es una lista: usa [ ... ].`)
        const rows = []
        for (const [i, row] of value.entries()) rows.push(await split(field.campos, row, `${name}[${i}].`))
        // Las filas son comunes a los dos idiomas; el EN se asocia por posición
        if (rows.some((r) => Object.keys(r.es).length)) out.es[key] = rows.map((r, i) => withId(r.es, value[i]))
        if (rows.some((r) => Object.keys(r.en).length)) out.en[key] = rows.map((r, i) => withId(r.en, value[i]))
      } else {
        out.es[key] = await convert(field, value)
      }
    }
    return out
  }

  const withId = (row, source) => (source?.id ? { ...row, id: source.id } : row)

  // Las filas de una lista sin id se asocian por posición a las existentes, para
  // que el texto del otro idioma no se pierda al reescribir la lista
  function attachRowIds(fields, payload, current, { strict }) {
    for (const field of fields) {
      const value = payload[field.nombre]
      if (value === undefined || value === null) continue
      if (field.tipo === 'group') attachRowIds(field.campos, value, current?.[field.nombre] ?? {}, { strict })
      if (field.tipo !== 'array') continue
      const existing = current?.[field.nombre] ?? []
      if (strict && value.length > existing.length) {
        throw new ApiError(
          `"${field.nombre}" tiene ${value.length} filas en inglés y solo ${existing.length} en español. Añade antes las filas en español (o envía las dos versiones a la vez).`,
        )
      }
      value.forEach((row, i) => {
        if (!row.id && existing[i]?.id) row.id = existing[i].id
      })
    }
  }

  async function write(slug, ref, data) {
    const { campos } = await collection(slug)
    const { es, en } = await split(campos, data)
    let id = ref === undefined ? undefined : await resolveId(slug, ref)
    let doc

    if (id === undefined) {
      doc = await api.create(slug, es, 'es')
      id = doc.id
    } else if (Object.keys(es).length) {
      const current = await api.findById(slug, id, { locale: 'es', depth: 0 })
      attachRowIds(campos, es, current, { strict: false })
      doc = await api.update(slug, id, es, 'es')
    }

    if (Object.keys(en).length) {
      const current = doc ?? (await api.findById(slug, id, { locale: 'en', depth: 0 }))
      try {
        attachRowIds(campos, en, current, { strict: true })
        doc = await api.update(slug, id, en, 'en')
      } catch (error) {
        if (!doc) throw error
        throw new ApiError(`La parte en español se guardó (id ${id}), pero la inglesa no:\n${error.message}`)
      }
    }
    return { id, doc }
  }

  // Relaciones como { id, slug, nombre }, rich text como Markdown
  function simplify(fields, doc) {
    if (!doc) return doc
    const out = { id: doc.id }
    for (const field of fields) {
      const value = doc[field.nombre]
      if (value === undefined) continue
      out[field.nombre] = simplifyValue(field, value)
    }
    for (const key of ['url', 'filename', 'createdAt', 'updatedAt']) if (doc[key] !== undefined) out[key] = doc[key]
    return out
  }

  function simplifyValue(field, value) {
    if (value === null) return null
    if (field.traducido && isPlainObject(value) && Object.keys(value).every((k) => LOCALES.includes(k))) {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, simplifyValue({ ...field, traducido: false }, v)]))
    }
    switch (field.tipo) {
      case 'relationship':
      case 'upload':
        return Array.isArray(value) ? value.map(compactRelation) : compactRelation(value)
      case 'richText':
        return lexicalToMarkdown(value)
      case 'group':
        return simplify(field.campos, value)
      case 'array':
        return value.map((row) => {
          const { id: _id, ...rest } = simplify(field.campos, row)
          return rest
        })
      default:
        return value
    }
  }

  function compactRelation(value) {
    if (!isPlainObject(value)) return { id: value }
    const out = { id: value.id }
    if (value.slug !== undefined) out.slug = value.slug
    const title = titleOf(value)
    if (title !== undefined) out.nombre = title
    if (value.url) out.url = value.url
    if (value.alt !== undefined) out.alt = value.alt
    return out
  }

  // Qué falta para publicar y en qué idiomas existe la página
  function review(slug, campos, doc) {
    const lines = []
    const has = (name) => campos.some((f) => f.nombre === name)
    const missing = (REQUIRED_TO_PUBLISH[slug] ?? []).filter((name) => isEmpty(doc[name]))
    if (has('estado')) {
      lines.push(`Estado: ${doc.estado}`)
      lines.push(missing.length ? `Falta para publicar: ${missing.join(', ')}` : 'Tiene todo lo obligatorio para publicar.')
    }

    const main = MAIN_TEXT[slug]
    for (const locale of LOCALES) {
      const problems = []
      const title = TITLE_FIELDS.find((name) => campos.some((f) => f.nombre === name && f.traducido))
      if (title && isEmpty(doc[title]?.[locale])) problems.push(`sin ${title}`)
      if (main && isEmpty(doc[main]?.[locale])) problems.push(`sin ${main}`)
      if (has('estado') && doc.estado !== 'publicado') problems.push('no está publicado')
      if (has('fecha_verificacion') && isEmpty(doc.fecha_verificacion)) problems.push('sin fecha_verificacion')
      if (slug === 'landings') problems.push(`además necesita al menos 3 fichas publicadas en el listado`)
      const faqs = (doc.faqs ?? []).filter((f) => isEmpty(f.pregunta?.[locale]) !== isEmpty(f.respuesta?.[locale]))
      const label = locale === 'es' ? 'ES' : 'EN'
      const exists = problems.filter((p) => !p.startsWith('además')).length === 0
      lines.push(`${label}: ${exists ? 'la página existe' : 'la página NO existe'}${problems.length ? ` (${problems.join('; ')})` : ''}`)
      if (faqs.length) lines.push(`  ${label}: ${faqs.length} FAQ con pregunta o respuesta a medias (no se muestran)`)
    }
    return lines.join('\n')
  }

  return {
    LOCALES,
    collection,
    resolveId,
    write,
    simplify,
    review,
    titleOf,
    mainText: (slug) => MAIN_TEXT[slug],
  }
}
