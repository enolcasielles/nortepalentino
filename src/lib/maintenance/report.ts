import type { Payload } from 'payload'

import { isHiddenDemo } from '@/lib/seo/indexability'

// Incidencias de mantenimiento con reglas fijas, para la skill `plan-editorial`
// (herramienta `mantenimiento` de la extensión de Claude Desktop).

// Una ficha verificada hace más de esto se tiene que reverificar
export const VERIFICATION_MAX_MONTHS = 6
// Un enlace se da por caído tras estos fallos seguidos (uno por semana)
export const LINK_FAILURES_TO_REPORT = 2
// Un borrador sin cambios en estos días se considera abandonado
export const DRAFT_STALE_DAYS = 60

const FICHAS = ['negocios', 'rutas', 'recursos'] as const
type Doc = Record<string, unknown> & { id: number }

const nameOf = (doc: Doc) => String(doc.nombre ?? doc.titulo ?? '')
const day = (value: unknown) => (typeof value === 'string' ? value.slice(0, 10) : null)

function monthsAgo(months: number): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date
}

async function findAll(payload: Payload, collection: (typeof FICHAS)[number] | 'articulos' | 'municipios') {
  const { docs } = await payload.find({ collection, locale: 'es', depth: 0, pagination: false, overrideAccess: true })
  return (docs as unknown as Doc[]).filter((d) => !isHiddenDemo(nameOf(d)))
}

export async function buildMaintenance(payload: Payload) {
  const municipios = new Map((await findAll(payload, 'municipios')).map((m) => [m.id, m.slug as string]))
  const fichas = Object.fromEntries(
    await Promise.all(FICHAS.map(async (c) => [c, await findAll(payload, c)] as const)),
  ) as Record<(typeof FICHAS)[number], Doc[]>
  const articulos = await findAll(payload, 'articulos')
  const describe = (coleccion: string, d: Doc) => ({
    coleccion,
    id: d.id,
    slug: d.slug as string,
    nombre: nameOf(d),
    municipio: municipios.get(d.municipio as number) ?? null,
  })

  // Verificaciones caducadas, de la más antigua a la más reciente
  const limit = monthsAgo(VERIFICATION_MAX_MONTHS).toISOString()
  const verificacion_caducada = FICHAS.flatMap((c) =>
    fichas[c]
      .filter((d) => d.estado === 'publicado' && (!d.fecha_verificacion || String(d.fecha_verificacion) < limit))
      .map((d) => ({ ...describe(c, d), fecha_verificacion: day(d.fecha_verificacion) })),
  ).sort((a, b) => (a.fecha_verificacion ?? '').localeCompare(b.fecha_verificacion ?? ''))

  // Enlaces: caídos (confirmados), con un primer fallo y los que no dejan comprobar
  const { docs: checks } = await payload.find({
    collection: 'comprobaciones_enlaces',
    depth: 0,
    pagination: false,
    overrideAccess: true,
    sort: '-fallos_seguidos',
  })
  const link = (c: (typeof checks)[number]) => {
    const doc = fichas[c.coleccion].find((d) => d.id === c.documento)
    return {
      ...(doc ? describe(c.coleccion, doc) : { coleccion: c.coleccion, id: c.documento, nombre: c.nombre }),
      campo: c.campo,
      url: c.url,
      codigo: c.codigo ?? null,
      detalle: c.detalle ?? null,
      fallos_seguidos: c.fallos_seguidos ?? 0,
      desde: day(c.primer_fallo),
    }
  }
  const failures = (c: (typeof checks)[number]) => (c.estado === 'error' ? (c.fallos_seguidos ?? 0) : 0)

  const draftLimit = new Date(Date.now() - DRAFT_STALE_DAYS * 86_400_000).toISOString()
  const borradores_abandonados = [
    ...FICHAS.flatMap((c) => fichas[c].map((d) => [c, d] as const)),
    ...articulos.map((d) => ['articulos', d] as const),
  ]
    .filter(([, d]) => d.estado !== 'publicado' && String(d.updatedAt) < draftLimit)
    .map(([c, d]) => ({ ...describe(c, d), actualizado: day(d.updatedAt) }))

  const lastRun = checks.map((c) => c.ultima_comprobacion).sort().at(-1)
  return {
    criterios: {
      verificacion_max_meses: VERIFICATION_MAX_MONTHS,
      fallos_para_avisar: LINK_FAILURES_TO_REPORT,
      borrador_abandonado_dias: DRAFT_STALE_DAYS,
    },
    ultima_comprobacion_enlaces: day(lastRun),
    enlaces_caidos: checks.filter((c) => failures(c) >= LINK_FAILURES_TO_REPORT).map(link),
    enlaces_con_un_fallo: checks.filter((c) => failures(c) > 0 && failures(c) < LINK_FAILURES_TO_REPORT).map(link),
    enlaces_sin_comprobar: checks.filter((c) => c.estado === 'bloqueado').map(link),
    verificacion_caducada,
    borradores_abandonados,
  }
}
