/**
 * Importa /seed/*.json en Payload (CLAUDE.md §10).
 *
 *   pnpm seed                      crea lo que falta; no toca lo existente
 *   pnpm seed --update             además sobrescribe los campos presentes en el JSON
 *   pnpm seed --dry-run            valida e importa en una transacción que se descarta
 *   pnpm seed --dir seed/examples  lee otro directorio
 *   pnpm seed --remote             necesario si DATABASE_URL no es local
 *
 * Los artículos llevan el cuerpo en Markdown con enlaces internos
 * (cms-mcp/src/lexical.mjs) y se convierten a Lexical al escribir.
 *
 * Idempotente por slug (ES en los slugs traducidos). Nunca borra nada. Valida
 * todo antes de escribir y escribe en una única transacción: o entra el lote
 * entero o no entra nada.
 */
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { createLocalReq, getDataLoader, getPayload, type CollectionSlug, type Where } from 'payload'
import type { z } from 'zod'

import { processGpx } from '@/lib/geo/gpx'
import { embeddableCollections, linkableCollections } from '@/lib/richtext/lexical'

import { internalRefs, markdownToLexical } from '../cms-mcp/src/lexical.mjs'

import {
  seedFiles,
  type FaqsSeed,
  type LocalizedSeed,
  type SeedKey,
} from './schema'

type Seeds = { [K in SeedKey]: z.infer<(typeof seedFiles)[K]['schema']>[] }
type Data = Record<string, unknown>

// ---------------------------------------------------------------- argumentos

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(`--${name}`)
const dirIndex = args.indexOf('--dir')
const seedDir = path.resolve(dirIndex >= 0 ? args[dirIndex + 1] : 'seed')
const update = flag('update')
const dryRun = flag('dry-run')

function fail(lines: string[]): never {
  console.error(`\n✗ Import cancelado. Nada se ha escrito.\n\n${lines.map((l) => `  · ${l}`).join('\n')}\n`)
  process.exit(1)
}

// Protección: contra una BD remota solo con --remote explícito (CLAUDE.md §1.7)
const dbHost = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? '').hostname
  } catch {
    return ''
  }
})()
if (!['localhost', '127.0.0.1', '::1'].includes(dbHost) && !flag('remote')) {
  fail([`DATABASE_URL apunta a "${dbHost || '(vacío)'}", que no es local. Añade --remote si de verdad quieres importar ahí.`])
}

// ------------------------------------------------- 1. lectura y validación

const errors: string[] = []

const seeds = Object.fromEntries(
  (Object.keys(seedFiles) as SeedKey[]).map((key) => {
    const { file, schema } = seedFiles[key]
    const fullPath = path.join(seedDir, file)
    if (!fs.existsSync(fullPath)) return [key, []]
    let raw: unknown
    try {
      raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
    } catch (error) {
      errors.push(`${file}: JSON inválido (${(error as Error).message})`)
      return [key, []]
    }
    if (!Array.isArray(raw)) {
      errors.push(`${file}: debe ser un array`)
      return [key, []]
    }
    const parsed: unknown[] = []
    raw.forEach((item, i) => {
      const result = schema.safeParse(item)
      if (result.success) {
        parsed.push(result.data)
        return
      }
      for (const issue of result.error.issues) {
        errors.push(`${file}[${i}] ${recordLabel(item)} ${issue.path.join('.') || '(registro)'}: ${issue.message}`)
      }
    })
    return [key, parsed]
  }),
) as Seeds

function recordLabel(item: unknown): string {
  const rec = (item ?? {}) as { slug?: unknown; ambito?: string }
  const slug = typeof rec.slug === 'string' ? rec.slug : (rec.slug as { es?: string } | undefined)?.es
  return slug ? `"${slug}"` : rec.ambito ? `(${rec.ambito})` : ''
}

// Slugs duplicados dentro del lote
function checkDuplicates(file: string, slugs: (string | undefined)[]) {
  const seen = new Set<string>()
  for (const s of slugs) {
    if (!s) continue
    if (seen.has(s)) errors.push(`${file}: el slug "${s}" está repetido`)
    seen.add(s)
  }
}
checkDuplicates('autores.json', seeds.autores.map((a) => a.slug))
checkDuplicates('municipios.json', seeds.municipios.map((m) => m.slug))
checkDuplicates('municipios.json (núcleos)', seeds.municipios.flatMap((m) => m.nucleos ?? []).map((n) => n.slug))
checkDuplicates('negocios.json', seeds.negocios.map((n) => n.slug))
for (const key of ['categorias', 'tipos_recurso', 'recursos', 'rutas', 'articulos'] as const) {
  for (const locale of ['es', 'en'] as const) {
    checkDuplicates(`${seedFiles[key].file} (${locale})`, seeds[key].map((r) => r.slug[locale]))
  }
}
for (const ruta of seeds.rutas) {
  if (ruta.gpx && !fs.existsSync(path.join(seedDir, ruta.gpx))) {
    errors.push(`rutas.json "${ruta.slug.es}" gpx: no existe el fichero "${ruta.gpx}" dentro de ${seedDir}`)
  }
}

if (errors.length) fail(errors)

const total = Object.values(seeds).reduce((n, list) => n + list.length, 0)
if (total === 0) fail([`No hay registros en ${seedDir}`])

// ------------------------------------------------- 2. referencias contra la BD

const payload = await getPayload({ config })
const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)

async function dbSlugs(collection: CollectionSlug, locale: 'es' | 'en' = 'es'): Promise<Map<string, number>> {
  const result = await payload.find({
    collection,
    pagination: false,
    depth: 0,
    locale,
    select: { slug: true },
    req,
  })
  const map = new Map<string, number>()
  for (const doc of result.docs as { id: number; slug?: string | null }[]) {
    if (doc.slug) map.set(doc.slug, doc.id)
  }
  return map
}

const known = {
  autores: new Set([...(await dbSlugs('autores')).keys(), ...seeds.autores.map((a) => a.slug)]),
  categorias: new Set([...(await dbSlugs('categorias_negocio')).keys(), ...seeds.categorias.map((c) => c.slug.es)]),
  categoriasEn: new Set([
    ...(await dbSlugs('categorias_negocio', 'en')).keys(),
    ...seeds.categorias.flatMap((c) => (c.slug.en ? [c.slug.en] : [])),
  ]),
  tipos: new Set([...(await dbSlugs('tipos_recurso')).keys(), ...seeds.tipos_recurso.map((t) => t.slug.es)]),
  municipios: new Set([...(await dbSlugs('municipios')).keys(), ...seeds.municipios.map((m) => m.slug)]),
  nucleos: new Set([
    ...(await dbSlugs('nucleos')).keys(),
    ...seeds.municipios.flatMap((m) => (m.nucleos ?? []).map((n) => n.slug)),
  ]),
}

function ref(file: string, label: string, field: string, value: string | undefined, set: Set<string>, what: string) {
  if (value && !set.has(value)) errors.push(`${file} "${label}" ${field}: no existe ${what} "${value}"`)
}

for (const m of seeds.municipios) {
  ref('municipios.json', m.slug, 'autor', m.autor, known.autores, 'el autor')
  if (known.categorias.has(m.slug) || known.categoriasEn.has(m.slug)) {
    errors.push(`municipios.json "${m.slug}": el slug coincide con el de una categoría`)
  }
}
for (const c of seeds.categorias) {
  for (const s of [c.slug.es, c.slug.en]) {
    if (s && known.municipios.has(s)) errors.push(`categorias.json "${c.slug.es}": el slug "${s}" coincide con el de un municipio`)
  }
}
for (const n of seeds.negocios) {
  ref('negocios.json', n.slug, 'categoria', n.categoria, known.categorias, 'la categoría')
  ref('negocios.json', n.slug, 'nucleo', n.nucleo, known.nucleos, 'el núcleo')
}
for (const r of seeds.recursos) {
  ref('recursos.json', r.slug.es, 'tipo', r.tipo, known.tipos, 'el tipo de recurso')
  ref('recursos.json', r.slug.es, 'nucleo', r.nucleo, known.nucleos, 'el núcleo')
}
for (const r of seeds.rutas) {
  ref('rutas.json', r.slug.es, 'inicio_nucleo', r.inicio_nucleo, known.nucleos, 'el núcleo')
  ref('rutas.json', r.slug.es, 'autor', r.autor, known.autores, 'el autor')
}
for (const l of seeds.landings) {
  const label = [l.ambito, l.municipio, l.categoria, l.filtro].filter(Boolean).join(' · ')
  ref('landings.json', label, 'municipio', l.municipio, known.municipios, 'el municipio')
  ref('landings.json', label, 'categoria', l.categoria, known.categorias, 'la categoría')
  ref('landings.json', label, 'autor', l.autor, known.autores, 'el autor')
}

// Enlaces internos y fichas del cuerpo de los artículos. Un artículo puede
// enlazar a otro del lote solo si va antes en el fichero (se escriben en orden).
const linkable = new Set<string>(linkableCollections)
const embeddable = new Set<string>(embeddableCollections)
const linkTargets: Record<string, Set<string>> = {
  negocios: new Set([...(await dbSlugs('negocios')).keys(), ...seeds.negocios.map((n) => n.slug)]),
  rutas: new Set([...(await dbSlugs('rutas')).keys(), ...seeds.rutas.map((r) => r.slug.es)]),
  recursos: new Set([...(await dbSlugs('recursos')).keys(), ...seeds.recursos.map((r) => r.slug.es)]),
  municipios: known.municipios,
  articulos: new Set((await dbSlugs('articulos')).keys()),
}
for (const a of seeds.articulos) {
  ref('articulos.json', a.slug.es, 'autor', a.autor, known.autores, 'el autor')
  for (const locale of ['es', 'en'] as const) {
    for (const r of internalRefs(a.cuerpo?.[locale] ?? '')) {
      const field = `cuerpo.${locale}`
      if (!linkable.has(r.collection) || (r.kind === 'ficha' && !embeddable.has(r.collection))) {
        errors.push(`articulos.json "${a.slug.es}" ${field}: no se puede ${r.kind === 'ficha' ? 'incrustar' : 'enlazar'} "${r.collection}"`)
      } else if (!linkTargets[r.collection].has(r.ref)) {
        errors.push(`articulos.json "${a.slug.es}" ${field}: no existe ${r.collection}/${r.ref} (o va después en el fichero)`)
      }
    }
  }
  linkTargets.articulos.add(a.slug.es)
}

if (errors.length) fail(errors)

// ------------------------------------------------- 3. escritura

type Stat = { created: number; updated: number; skipped: number }
const stats: Record<string, Stat> = {}
const stat = (collection: string) => (stats[collection] ??= { created: 0, updated: 0, skipped: 0 })

// Reparte un texto traducido entre los datos ES y EN. Un texto plano va a ES.
function put(es: Data, en: Data, key: string, value: LocalizedSeed | string | undefined) {
  if (value === undefined) return
  if (typeof value === 'string') {
    es[key] = value
    return
  }
  if (value.es !== undefined) es[key] = value.es
  if (value.en !== undefined) en[key] = value.en
}

function set(target: Data, key: string, value: unknown) {
  if (value !== undefined) target[key] = value
}

type Docs = { es: Data; en: Data; faqs?: FaqsSeed }

// Crea o (con --update) actualiza un documento. Escribe primero en ES y luego
// en EN; las FAQs en EN reutilizan los ids de fila creados en ES.
async function upsert(collection: CollectionSlug, where: Where, docs: Docs): Promise<number> {
  try {
    return await write(collection, where, docs)
  } catch (error) {
    // Identifica el registro que ha fallado sin perder los errores de campo de Payload
    const label = docs.es.slug ?? docs.es.nombre ?? JSON.stringify(where)
    throw Object.assign(new Error(`${collection} "${String(label)}": ${(error as Error).message}`), {
      data: (error as { data?: unknown }).data,
    })
  }
}

async function write(collection: CollectionSlug, where: Where, docs: Docs): Promise<number> {
  // El dataloader del req cachea las consultas de validación de relaciones
  // durante todo el lote: sin renovarlo, un documento creado después de una
  // consulta que no lo encontró (p. ej. un artículo enlazado) parecería no existir
  req.payloadDataLoader = getDataLoader(req)
  const found = await payload.find({ collection, where, limit: 1, depth: 0, locale: 'es', req })
  const existing = found.docs[0] as { id: number } | undefined
  if (existing && !update) {
    stat(collection).skipped++
    return existing.id
  }

  const esData: Data = { ...docs.es }
  if (docs.faqs) {
    esData.faqs = docs.faqs.map((f) => ({ pregunta: f.pregunta.es ?? null, respuesta: f.respuesta.es ?? null }))
  }
  const saved = (
    existing
      ? await payload.update({ collection, id: existing.id, data: esData, locale: 'es', depth: 0, req })
      : await payload.create({ collection, data: esData, locale: 'es', depth: 0, req })
  ) as { id: number; faqs?: { id: string }[] }

  const enData: Data = { ...docs.en }
  if (docs.faqs?.some((f) => f.pregunta.en || f.respuesta.en)) {
    enData.faqs = (saved.faqs ?? []).map((row, i) => ({
      id: row.id,
      pregunta: docs.faqs![i].pregunta.en ?? null,
      respuesta: docs.faqs![i].respuesta.en ?? null,
    }))
  }
  if (Object.keys(enData).length) {
    await payload.update({ collection, id: saved.id, data: enData, locale: 'en', depth: 0, req })
  }

  stat(collection)[existing ? 'updated' : 'created']++
  return saved.id
}

function idOf(map: Map<string, number>, slug: string | undefined): number | undefined {
  return slug ? map.get(slug) : undefined
}

// Un GPX se identifica por su nombre de fichero. Al resubirlo, Payload puede
// añadir un sufijo (-1, -2…), así que también se reconocen esas variantes.
// Con --update solo se resube si el track ha cambiado.
async function upsertGpx(relativePath: string): Promise<number | undefined> {
  const fullPath = path.join(seedDir, relativePath)
  const name = path.basename(fullPath)
  const base = name.replace(/\.gpx$/i, '')
  const pattern = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(-\\d+)?\\.gpx$`, 'i')
  const candidates = await payload.find({
    collection: 'archivos_gpx',
    where: { filename: { like: base } },
    pagination: false,
    depth: 0,
    req,
  })
  const existing = candidates.docs.find((d) => d.filename && pattern.test(d.filename))
  const data = fs.readFileSync(fullPath)
  const unchanged = existing?.polyline === processGpx(data.toString('utf8')).polyline
  if (existing && (!update || unchanged)) {
    stat('archivos_gpx').skipped++
    return existing.id
  }
  // Los ficheros subidos no son transaccionales: en simulación no se suben
  if (dryRun) {
    stat('archivos_gpx')[existing ? 'updated' : 'created']++
    return existing?.id
  }
  const file = { data, name, mimetype: 'application/gpx+xml', size: data.length }
  const saved = existing
    ? await payload.update({ collection: 'archivos_gpx', id: existing.id, data: {}, file, depth: 0, req })
    : await payload.create({ collection: 'archivos_gpx', data: {}, file, depth: 0, req })
  stat('archivos_gpx')[existing ? 'updated' : 'created']++
  return saved.id
}

async function run() {
  for (const a of seeds.autores) {
    const es: Data = { nombre: a.nombre, slug: a.slug }
    const en: Data = {}
    put(es, en, 'bio', a.bio)
    put(es, en, 'relacion_con_la_zona', a.relacion_con_la_zona)
    set(es, 'enlaces', a.enlaces)
    await upsert('autores', { slug: { equals: a.slug } }, { es, en })
  }

  for (const [key, collection] of [
    ['categorias', 'categorias_negocio'],
    ['tipos_recurso', 'tipos_recurso'],
  ] as const) {
    for (const c of seeds[key]) {
      const es: Data = { tipo_schema: c.tipo_schema, color_token: c.color_token, icono: c.icono }
      const en: Data = {}
      put(es, en, 'slug', c.slug)
      put(es, en, 'nombre', c.nombre)
      put(es, en, 'nombre_plural', c.nombre_plural)
      await upsert(collection, { slug: { equals: c.slug.es } }, { es, en })
    }
  }

  const autores = await dbSlugs('autores')
  for (const m of seeds.municipios) {
    const es: Data = { nombre: m.nombre, slug: m.slug, coordenadas: { lat: m.lat, lng: m.lng } }
    const en: Data = {}
    put(es, en, 'comarca_zona', m.comarca_zona)
    put(es, en, 'intro', m.intro)
    set(es, 'altitud_m', m.altitud_m)
    set(es, 'distancias_km', m.distancias_km)
    set(es, 'autor', idOf(autores, m.autor))
    const id = await upsert('municipios', { slug: { equals: m.slug } }, { es, en, faqs: m.faqs })
    for (const n of m.nucleos ?? []) {
      await upsert(
        'nucleos',
        { slug: { equals: n.slug } },
        { es: { nombre: n.nombre, slug: n.slug, municipio: id, coordenadas: { lat: n.lat, lng: n.lng } }, en: {} },
      )
    }
  }

  const categorias = await dbSlugs('categorias_negocio')
  const tipos = await dbSlugs('tipos_recurso')
  const nucleos = await dbSlugs('nucleos')

  for (const n of seeds.negocios) {
    const es: Data = {
      nombre: n.nombre,
      slug: n.slug,
      categoria: idOf(categorias, n.categoria),
      nucleo: idOf(nucleos, n.nucleo),
      coordenadas: { lat: n.lat, lng: n.lng },
    }
    const en: Data = {}
    for (const key of ['direccion', 'telefono', 'email', 'web', 'precio_rango', 'atributos_familia', 'orden'] as const) {
      set(es, key, n[key])
    }
    for (const key of ['fuente_url', 'fecha_verificacion', 'estado'] as const) set(es, key, n[key])
    put(es, en, 'horario_texto', n.horario_texto)
    put(es, en, 'descripcion', n.descripcion)
    await upsert('negocios', { slug: { equals: n.slug } }, { es, en })
  }

  for (const r of seeds.recursos) {
    const es: Data = {
      tipo: idOf(tipos, r.tipo),
      nucleo: idOf(nucleos, r.nucleo),
      coordenadas: { lat: r.lat, lng: r.lng },
    }
    const en: Data = {}
    put(es, en, 'slug', r.slug)
    put(es, en, 'nombre', r.nombre)
    for (const key of ['resumen', 'horario_acceso', 'precio_entrada', 'descripcion'] as const) put(es, en, key, r[key])
    for (const key of ['fuente_url', 'fecha_verificacion', 'estado'] as const) set(es, key, r[key])
    await upsert('recursos', { slug: { equals: r.slug.es } }, { es, en })
  }

  for (const r of seeds.rutas) {
    const es: Data = { inicio_nucleo: idOf(nucleos, r.inicio_nucleo) }
    const en: Data = {}
    put(es, en, 'slug', r.slug)
    put(es, en, 'nombre', r.nombre)
    for (const key of ['resumen', 'premio_final', 'descripcion', 'experiencia_propia'] as const) put(es, en, key, r[key])
    for (const key of [
      'distancia_km',
      'desnivel_m',
      'duracion_h',
      'dificultad',
      'circular',
      'apta_ninos',
      'apta_carrito',
      'temporada',
      'fuente_url',
      'fecha_verificacion',
      'estado',
    ] as const) {
      set(es, key, r[key])
    }
    if (r.inicio_lat !== undefined) es.inicio_coordenadas = { lat: r.inicio_lat, lng: r.inicio_lng }
    set(es, 'autor', idOf(autores, r.autor))
    if (r.gpx) set(es, 'gpx', await upsertGpx(r.gpx))
    await upsert('rutas', { slug: { equals: r.slug.es } }, { es, en, faqs: r.faqs })
  }

  const municipios = await dbSlugs('municipios')
  for (const l of seeds.landings) {
    const municipio = idOf(municipios, l.municipio)
    const categoria = idOf(categorias, l.categoria)
    const where: Where = {
      and: [
        { ambito: { equals: l.ambito } },
        municipio ? { municipio: { equals: municipio } } : { municipio: { exists: false } },
        categoria ? { categoria: { equals: categoria } } : { categoria: { exists: false } },
        l.filtro ? { filtro: { equals: l.filtro } } : { filtro: { exists: false } },
      ],
    }
    const es: Data = { ambito: l.ambito }
    const en: Data = {}
    set(es, 'municipio', municipio)
    set(es, 'categoria', categoria)
    set(es, 'filtro', l.filtro)
    set(es, 'autor', idOf(autores, l.autor))
    put(es, en, 'titulo', l.titulo)
    put(es, en, 'intro', l.intro)
    await upsert('landings', where, { es, en, faqs: l.faqs })
  }

  for (const a of seeds.articulos) {
    // Se consulta en cada artículo para que pueda enlazar a los anteriores del lote
    const ids = new Map<string, number>()
    for (const collection of linkableCollections) {
      for (const [slug, id] of await dbSlugs(collection)) ids.set(`${collection}/${slug}`, id)
    }
    const es: Data = {}
    const en: Data = {}
    put(es, en, 'slug', a.slug)
    put(es, en, 'titulo', a.titulo)
    for (const key of ['resumen', 'busqueda_objetivo', 'seo_titulo', 'seo_descripcion'] as const) put(es, en, key, a[key])
    for (const locale of ['es', 'en'] as const) {
      const target = locale === 'es' ? es : en
      const markdown = a.cuerpo?.[locale]
      if (markdown) target.cuerpo = markdownToLexical(markdown, ids)
      set(target, 'busquedas_secundarias', a.busquedas_secundarias?.[locale])
    }
    set(es, 'autor', idOf(autores, a.autor))
    set(es, 'estado', a.estado)
    await upsert('articulos', { slug: { equals: a.slug.es } }, { es, en, faqs: a.faqs })
  }
}

// Una única transacción para todo el lote
const transactionID = await payload.db.beginTransaction()
if (transactionID) req.transactionID = transactionID

try {
  await run()
  if (dryRun) {
    if (transactionID) await payload.db.rollbackTransaction(transactionID)
  } else if (transactionID) {
    await payload.db.commitTransaction(transactionID)
  }
} catch (error) {
  if (transactionID) await payload.db.rollbackTransaction(transactionID)
  const data = (error as { data?: { errors?: { path?: string; message?: string }[] } }).data
  const details = data?.errors?.map((e) => `${e.path}: ${e.message}`) ?? []
  fail([(error as Error).message, ...details])
}

console.log(`\n${dryRun ? 'Simulación (no se ha escrito nada)' : '✓ Import completado'} · ${path.relative(process.cwd(), seedDir) || '.'}${update ? ' · --update' : ''}\n`)
console.table(stats)
process.exit(0)
