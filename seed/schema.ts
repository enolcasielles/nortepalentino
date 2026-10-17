import { z } from 'zod'

import { COORDINATE_BOUNDS } from '@/fields/coordinates'
import { filterSlugs } from '@/lib/i18n/segments'
import { categoryIconKeys } from '@/lib/icons'
import { isReservedSlug } from '@/lib/routes/reserved'
import { SLUG_PATTERN } from '@/lib/routes/slugify'
import {
  businessSchemaTypes,
  colorTokens,
  difficulties,
  estados,
  familyAttributes,
  priceRanges,
  seasons,
  sightSchemaTypes,
} from '@/lib/taxonomies'

// Mensajes de validación en español: el informe lo lee quien prepara los datos
z.config(z.locales.es())

// Contrato de los ficheros /seed/*.json (CLAUDE.md §10). Es la fuente de
// verdad del formato: seed/README.md lo resume y seed/examples/ lo ilustra.

const text = z.string().trim().min(1)

const slug = text
  .regex(SLUG_PATTERN, 'solo minúsculas, números y guiones, sin tildes')
  .refine((s) => !isReservedSlug(s), 'es un slug reservado del sitio')

// Texto traducido: { "es": "…", "en": "…" }. Cualquiera de los dos puede faltar.
const localized = z
  .object({ es: text.optional(), en: text.optional() })
  .strict()
  .refine((v) => v.es || v.en, 'necesita al menos "es" o "en"')

// Campo obligatorio en Payload: el ES siempre; el EN se exige aparte si el
// registro trae algo en inglés (ver requireEnWhenTranslated)
const localizedRequired = z.object({ es: text, en: text.optional() }).strict()

// Si un registro trae cualquier texto EN, Payload valida también en EN los
// campos obligatorios traducidos, así que tienen que venir en EN.
function hasEn(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasEn)
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([k, v]) => (k === 'en' && v !== undefined) || hasEn(v))
  }
  return false
}

function requireEnWhenTranslated<T extends Record<string, unknown>>(fields: (keyof T & string)[]) {
  return (rec: T, ctx: z.RefinementCtx) => {
    if (!hasEn(rec)) return
    for (const field of fields) {
      if (!(rec[field] as { en?: string } | undefined)?.en) {
        ctx.addIssue({ code: 'custom', path: [field, 'en'], message: 'obligatorio si el registro trae textos en inglés' })
      }
    }
  }
}

// Slug traducido: el ES es obligatorio porque es la clave de idempotencia
const localizedSlug = z.object({ es: slug, en: slug.optional() }).strict()

const url = text.regex(/^https?:\/\/\S+$/, 'debe ser una URL completa (https://…)')
const date = text.regex(/^\d{4}-\d{2}-\d{2}$/, 'formato AAAA-MM-DD')
const lat = z.number().min(COORDINATE_BOUNDS.minLat).max(COORDINATE_BOUNDS.maxLat)
const lng = z.number().min(COORDINATE_BOUNDS.minLng).max(COORDINATE_BOUNDS.maxLng)
const positive = z.number().positive()

const faqs = z.array(z.object({ pregunta: localized, respuesta: localized }).strict())

const verification = {
  fuente_url: url.optional(),
  fecha_verificacion: date.optional(),
  estado: z.enum(estados).optional(),
}

// Mismas reglas de publicación que en Payload (fields/validation.ts)
function requirePublished<T extends { estado?: string }>(fields: (keyof T & string)[]) {
  return (rec: T, ctx: z.RefinementCtx) => {
    if (rec.estado !== 'publicado') return
    for (const field of fields) {
      if (rec[field] === undefined || rec[field] === null) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'obligatorio para publicar' })
      }
    }
  }
}

export const autorSchema = z
  .object({
    slug,
    nombre: text,
    bio: localized.optional(),
    relacion_con_la_zona: localized.optional(),
    enlaces: z.array(z.object({ etiqueta: text, url }).strict()).optional(),
  })
  .strict()

const taxonomy = <T extends readonly [string, ...string[]]>(schemaTypes: T) =>
  z
    .object({
      slug: localizedSlug,
      nombre: localizedRequired,
      nombre_plural: localizedRequired,
      tipo_schema: z.enum(schemaTypes),
      color_token: z.enum(colorTokens),
      icono: z.enum(categoryIconKeys as [string, ...string[]]),
    })
    .strict()
    .superRefine(requireEnWhenTranslated(['nombre', 'nombre_plural']))

export const categoriaSchema = taxonomy(businessSchemaTypes)
export const tipoRecursoSchema = taxonomy(sightSchemaTypes)

export const nucleoSchema = z.object({ slug, nombre: text, lat, lng }).strict()

export const municipioSchema = z
  .object({
    slug,
    nombre: text,
    comarca_zona: localized.optional(),
    lat,
    lng,
    altitud_m: z.number().nonnegative().optional(),
    distancias_km: z
      .object({
        palencia: positive.optional(),
        santander: positive.optional(),
        madrid: positive.optional(),
        bilbao: positive.optional(),
      })
      .strict()
      .optional(),
    intro: localized.optional(),
    faqs: faqs.optional(),
    autor: slug.optional(),
    nucleos: z.array(nucleoSchema).optional(),
  })
  .strict()

export const negocioSchema = z
  .object({
    slug,
    nombre: text,
    categoria: slug, // slug ES de categorias_negocio
    nucleo: slug,
    direccion: text.optional(),
    lat,
    lng,
    telefono: text.regex(/^\+?[0-9 ]{9,}$/, 'formato +34 979 000 000').optional(),
    email: z.email().optional(),
    web: url.optional(),
    // Texto plano = solo ES (compatibilidad con el contrato del brief)
    horario_texto: z.union([text, localized]).optional(),
    precio_rango: z.enum(priceRanges).optional(),
    descripcion: localized.optional(),
    atributos_familia: z.array(z.enum(familyAttributes)).optional(),
    orden: z.number().int().optional(),
    ...verification,
  })
  .strict()
  .superRefine(requirePublished(['fuente_url', 'fecha_verificacion']))

export const recursoSchema = z
  .object({
    slug: localizedSlug,
    nombre: localizedRequired,
    tipo: slug, // slug ES de tipos_recurso
    nucleo: slug,
    lat,
    lng,
    resumen: localized.optional(),
    horario_acceso: localized.optional(),
    precio_entrada: localized.optional(),
    descripcion: localized.optional(),
    ...verification,
  })
  .strict()
  .superRefine(requirePublished(['fuente_url', 'fecha_verificacion']))
  .superRefine(requireEnWhenTranslated(['nombre']))

export const rutaSchema = z
  .object({
    slug: localizedSlug,
    nombre: localizedRequired,
    inicio_nucleo: slug,
    inicio_lat: lat.optional(),
    inicio_lng: lng.optional(),
    distancia_km: positive.optional(),
    desnivel_m: z.number().nonnegative().optional(),
    duracion_h: positive.optional(),
    dificultad: z.enum(difficulties).optional(),
    circular: z.boolean().optional(),
    apta_ninos: z.boolean().optional(),
    apta_carrito: z.boolean().optional(),
    temporada: z.array(z.enum(seasons)).optional(),
    resumen: localized.optional(),
    premio_final: localized.optional(),
    descripcion: localized.optional(),
    experiencia_propia: localized.optional(),
    // Ruta relativa al directorio de seeds, p. ej. "gpx/senda-tejeda-tosande.gpx"
    gpx: text.regex(/\.gpx$/i, 'debe ser un fichero .gpx').optional(),
    autor: slug.optional(),
    faqs: faqs.optional(),
    ...verification,
  })
  .strict()
  .refine((r) => (r.inicio_lat === undefined) === (r.inicio_lng === undefined), {
    message: 'inicio_lat e inicio_lng van juntas',
    path: ['inicio_lat'],
  })
  .superRefine(
    requirePublished(['fuente_url', 'fecha_verificacion', 'distancia_km', 'desnivel_m', 'duracion_h', 'dificultad']),
  )
  .superRefine(requireEnWhenTranslated(['nombre']))

const filtros = Object.values(filterSlugs).map((f) => f.es) as [string, ...string[]]

export const landingSchema = z
  .object({
    ambito: z.enum(['negocios', 'rutas', 'recursos', 'articulos']),
    municipio: slug.optional(),
    categoria: slug.optional(),
    filtro: z.enum(filtros).optional(),
    titulo: localized.optional(),
    intro: localized.optional(),
    faqs: faqs.optional(),
    autor: slug.optional(),
  })
  .strict()
  .superRefine((l, ctx) => {
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
    if (l.ambito === 'negocios' && !l.categoria) issue('categoria', 'un listado de negocios necesita categoría')
    if (l.ambito === 'negocios' && l.filtro && !l.municipio) issue('filtro', 'los filtros de negocios van dentro de un municipio')
    if (l.ambito !== 'negocios' && (l.municipio || l.categoria)) issue('ambito', 'municipio y categoría solo valen para negocios')
    if ((l.ambito === 'recursos' || l.ambito === 'articulos') && l.filtro) issue('filtro', 'este listado no tiene filtros')
  })

// Cuerpo en Markdown, como en la extensión (cms-mcp/src/lexical.mjs): enlaces
// internos [texto](interno:coleccion/slug) y tarjetas ::ficha[coleccion/slug],
// con el slug ES en los slugs traducidos
export const articuloSchema = z
  .object({
    slug: localizedSlug,
    titulo: localizedRequired,
    resumen: localized.optional(),
    cuerpo: localized.optional(),
    faqs: faqs.optional(),
    busqueda_objetivo: localized.optional(),
    busquedas_secundarias: z.object({ es: z.array(text).optional(), en: z.array(text).optional() }).strict().optional(),
    seo_titulo: localized.optional(),
    seo_descripcion: localized.optional(),
    autor: slug.optional(),
    estado: z.enum(estados).optional(),
  })
  .strict()
  .superRefine(requirePublished(['autor']))
  .superRefine(requireEnWhenTranslated(['titulo']))

export type AutorSeed = z.infer<typeof autorSchema>
export type CategoriaSeed = z.infer<typeof categoriaSchema>
export type MunicipioSeed = z.infer<typeof municipioSchema>
export type NegocioSeed = z.infer<typeof negocioSchema>
export type RecursoSeed = z.infer<typeof recursoSchema>
export type RutaSeed = z.infer<typeof rutaSchema>
export type LandingSeed = z.infer<typeof landingSchema>
export type ArticuloSeed = z.infer<typeof articuloSchema>
export type LocalizedSeed = z.infer<typeof localized> | z.infer<typeof localizedRequired>
export type FaqsSeed = z.infer<typeof faqs>

// Ficheros reconocidos, en orden de importación (las referencias van hacia atrás)
export const seedFiles = {
  autores: { file: 'autores.json', schema: autorSchema },
  categorias: { file: 'categorias.json', schema: categoriaSchema },
  tipos_recurso: { file: 'tipos_recurso.json', schema: tipoRecursoSchema },
  municipios: { file: 'municipios.json', schema: municipioSchema },
  negocios: { file: 'negocios.json', schema: negocioSchema },
  recursos: { file: 'recursos.json', schema: recursoSchema },
  rutas: { file: 'rutas.json', schema: rutaSchema },
  landings: { file: 'landings.json', schema: landingSchema },
  articulos: { file: 'articulos.json', schema: articuloSchema },
} as const

export type SeedKey = keyof typeof seedFiles
