import { readFile, stat } from 'node:fs/promises'
import { basename, extname } from 'node:path'

// Las funciones de Vercel no aceptan cuerpos de más de 4,5 MB
export const MAX_UPLOAD_BYTES = 4.4 * 1024 * 1024

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.gpx': 'application/gpx+xml',
}

export class ApiError extends Error {}

// Query string al estilo de Payload (qs): where[slug][equals]=x, where[or][0][...]
function toQuery(params, prefix = '') {
  const parts = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const name = prefix ? `${prefix}[${key}]` : key
    if (typeof value === 'object') parts.push(toQuery(value, name))
    else parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(String(value))}`)
  }
  return parts.filter(Boolean).join('&')
}

// Errores de validación de Payload en un mensaje legible por campo
function describeError(status, body) {
  const errors = body?.errors ?? []
  const lines = errors.flatMap((error) => {
    const fields = error.data?.errors ?? []
    if (fields.length) return fields.map((f) => `- ${f.path ?? f.field}: ${f.message}`)
    return [`- ${error.message}`]
  })
  if (status === 401 || status === 403) {
    lines.unshift('La API key no es válida o no tiene permiso. Revisa los ajustes de la extensión.')
  }
  return `Error ${status} de la web:\n${lines.join('\n') || JSON.stringify(body)}`
}

export function createApi({ baseUrl, apiKey }) {
  const root = baseUrl.replace(/\/+$/, '')
  const headers = { Authorization: `users API-Key ${apiKey}` }

  async function request(method, path, { query, json, form } = {}) {
    const qs = query ? toQuery(query) : ''
    const url = `${root}/api/${path}${qs ? `?${qs}` : ''}`
    let response
    try {
      response = await fetch(url, {
        method,
        headers: json ? { ...headers, 'Content-Type': 'application/json' } : headers,
        body: json ? JSON.stringify(json) : form,
      })
    } catch (error) {
      throw new ApiError(`No se pudo conectar con ${root}: ${error.cause?.message ?? error.message}`)
    }
    const text = await response.text()
    let body
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = { errors: [{ message: text.slice(0, 300) }] }
    }
    if (!response.ok) throw new ApiError(describeError(response.status, body))
    return body
  }

  // Un documento recién escrito llega envuelto en { doc, message }
  const unwrap = (body) => body?.doc ?? body

  return {
    root,
    schema: () => request('GET', 'cms/esquema'),
    me: () => request('GET', 'users/me'),
    find: (collection, query) => request('GET', collection, { query }),
    findById: (collection, id, query) => request('GET', `${collection}/${id}`, { query }),
    create: async (collection, data, locale) =>
      unwrap(await request('POST', collection, { query: { locale, depth: 0 }, json: data })),
    update: async (collection, id, data, locale) =>
      unwrap(await request('PATCH', `${collection}/${id}`, { query: { locale, depth: 0 }, json: data })),
    remove: (collection, id) => request('DELETE', `${collection}/${id}`),

    // Subida de un fichero local (imagen o GPX) con sus campos
    upload: async (collection, filePath, data, locale) => {
      const info = await stat(filePath).catch(() => null)
      if (!info?.isFile()) throw new ApiError(`No encuentro el fichero ${filePath}.`)
      if (info.size > MAX_UPLOAD_BYTES) {
        const mb = (info.size / 1024 / 1024).toFixed(1).replace('.', ',')
        throw new ApiError(
          `El fichero pesa ${mb} MB y el máximo por esta vía es 4,4 MB. Redúcelo (p. ej. exportándolo a 2500 px de lado largo) o súbelo desde /admin.`,
        )
      }
      const type = MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
      const form = new FormData()
      form.append('file', new Blob([await readFile(filePath)], { type }), basename(filePath))
      form.append('_payload', JSON.stringify(data))
      return unwrap(await request('POST', collection, { query: { locale, depth: 0 }, form }))
    },
  }
}
