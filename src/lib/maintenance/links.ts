import type { Payload } from 'payload'

import { isHiddenDemo } from '@/lib/seo/indexability'
import type { ComprobacionesEnlace } from '@/payload-types'

// Comprobación semanal de los enlaces de las fichas publicadas (cron de
// Vercel → /api/cms/mantenimiento/enlaces). Solo detecta: decidir si un
// negocio ha cerrado o un dato ha cambiado es trabajo del editor con la skill
// `investigar-ficha`.

const COLLECTIONS = ['negocios', 'rutas', 'recursos'] as const
const FIELDS = { negocios: ['fuente_url', 'web'], rutas: ['fuente_url'], recursos: ['fuente_url'] } as const
const TIMEOUT_MS = 15_000
const CONCURRENCY = 6
const USER_AGENT = 'Mozilla/5.0 (compatible; NortePalentinoBot/1.0; +https://nortepalentino.com)'
// Certificados mal servidos (p. ej. sin la cadena intermedia): los navegadores
// los abren y Node no, así que no cuentan como fallo
const TLS_ERROR = /CERT|UNABLE_TO_VERIFY|SELF_SIGNED|DEPTH_ZERO|ERR_TLS|ERR_SSL/

type Coleccion = (typeof COLLECTIONS)[number]
type Campo = ComprobacionesEnlace['campo']
type Result = Pick<ComprobacionesEnlace, 'estado' | 'codigo' | 'detalle'>
type Target = { coleccion: Coleccion; documento: number; campo: Campo; nombre: string; url: string }

const keyOf = (t: { coleccion: string; documento: number; campo: string }) => `${t.coleccion}:${t.documento}:${t.campo}`

// Muchos servidores no aceptan HEAD: si no responde bien, se repite con GET.
// 401/403/429 y los errores de certificado significan que el servidor existe
// pero no deja comprobar.
async function checkUrl(url: string): Promise<Result> {
  let last: Result = { estado: 'error', codigo: null, detalle: null }
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
      })
      await res.body?.cancel()
      if (res.ok) return { estado: 'ok', codigo: res.status, detalle: null }
      const blocked = [401, 403, 429].includes(res.status)
      last = { estado: blocked ? 'bloqueado' : 'error', codigo: res.status, detalle: res.statusText || null }
    } catch (error) {
      const cause = (error as { cause?: { code?: string } }).cause?.code
      const detalle = cause ?? (error as Error).name
      last = { estado: TLS_ERROR.test(detalle) ? 'bloqueado' : 'error', codigo: null, detalle }
    }
  }
  return last
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker))
  return results
}

async function targets(payload: Payload): Promise<Target[]> {
  const out: Target[] = []
  for (const coleccion of COLLECTIONS) {
    const { docs } = await payload.find({
      collection: coleccion,
      locale: 'es',
      depth: 0,
      pagination: false,
      overrideAccess: true,
      where: { estado: { equals: 'publicado' } },
    })
    for (const doc of docs as unknown as Record<string, unknown>[]) {
      const nombre = String(doc.nombre ?? '')
      if (isHiddenDemo(nombre)) continue
      for (const campo of FIELDS[coleccion]) {
        const url = doc[campo]
        if (typeof url === 'string' && /^https?:\/\//.test(url)) {
          out.push({ coleccion, documento: doc.id as number, campo, nombre, url })
        }
      }
    }
  }
  return out
}

export async function runLinkCheck(payload: Payload) {
  const list = await targets(payload)
  // Una sola petición por URL aunque la usen varios campos o fichas
  const urls = [...new Set(list.map((t) => t.url))]
  const checked = await pool(urls, CONCURRENCY, checkUrl)
  const resultByUrl = new Map(urls.map((url, i) => [url, checked[i]]))
  const { docs: previous } = await payload.find({
    collection: 'comprobaciones_enlaces',
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const previousByKey = new Map(previous.map((p) => [keyOf(p), p]))
  const now = new Date().toISOString()
  const summary = { enlaces: list.length, urls: urls.length, ok: 0, bloqueados: 0, errores: 0, eliminados: 0 }

  // Escrituras secuenciales: es una tabla pequeña y así no se satura el pool
  for (const target of list) {
    const result = resultByUrl.get(target.url)!
    summary[result.estado === 'ok' ? 'ok' : result.estado === 'bloqueado' ? 'bloqueados' : 'errores']++
    const prev = previousByKey.get(keyOf(target))
    previousByKey.delete(keyOf(target))
    // Una URL nueva empieza de cero; un fallo suma, cualquier respuesta del servidor reinicia
    const sameUrl = prev?.url === target.url
    const failed = result.estado === 'error'
    const data = {
      ...target,
      ...result,
      fallos_seguidos: failed ? (sameUrl ? (prev?.fallos_seguidos ?? 0) : 0) + 1 : 0,
      primer_fallo: failed ? (sameUrl && prev?.primer_fallo) || now : null,
      ultima_comprobacion: now,
    }
    if (prev) {
      await payload.update({ collection: 'comprobaciones_enlaces', id: prev.id, data, overrideAccess: true })
    } else {
      await payload.create({ collection: 'comprobaciones_enlaces', data, overrideAccess: true })
    }
  }

  // Enlaces de fichas que ya no están publicadas o que ya no tienen ese campo
  for (const stale of previousByKey.values()) {
    await payload.delete({ collection: 'comprobaciones_enlaces', id: stale.id, overrideAccess: true })
    summary.eliminados++
  }
  return summary
}
