import { completeFaqs } from '@/components/content/FaqList'
import { imageOf } from '@/lib/data/media'
import type { Site } from '@/lib/data/site'
import {
  bodyRefs,
  firstParagraphText,
  headingsOf,
  walk,
  wordCount,
  type LexicalValue,
} from '@/lib/richtext/lexical'
import { slugify } from '@/lib/routes/slugify'
import { siteName, siteUrl } from '@/lib/site'
import type { Articulo } from '@/payload-types'

// Checklist SEO de un artículo en un idioma (CLAUDE.md §6). Avisa, no bloquea:
// lo usan el panel (campo "Revisión SEO") y la herramienta `revisar` de la
// extensión de Claude Desktop. Los umbrales son orientativos.

export const AUDIT_LIMITS = {
  titleMax: 60,
  descriptionMin: 120,
  descriptionMax: 160,
  minDirectoryLinks: 3,
  minWords: 800,
  minFaqs: 3,
  minH2: 2,
}

export type AuditCheck = {
  id: string
  ok: boolean
  // error: el artículo no cumple su función; aviso: mejorable
  level: 'error' | 'aviso'
  message: string
}

const DIRECTORY = new Set(['negocios', 'rutas', 'recursos'])

// Palabras significativas de una búsqueda, sin tildes ni palabras vacías
const STOPWORDS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'en', 'con', 'por', 'para', 'y', 'o', 'a', 'al', 'un', 'una', 'que', 'mas',
  'the', 'of', 'in', 'and', 'or', 'to', 'for', 'with', 'on', 'at', 'an', 'best',
])
function keywords(query: string): string[] {
  return slugify(query)
    .split('-')
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
}
function covers(text: string | null | undefined, query: string): boolean {
  const words = keywords(query)
  if (!words.length || !text) return false
  const haystack = new Set(slugify(text).split('-'))
  return words.every((w) => haystack.has(w))
}

// Enlaces escritos a mano a la propia web: deberían ser enlaces internos
function ownUrlLinks(value: LexicalValue): string[] {
  const host = siteUrl.replace(/^https?:\/\//, '')
  const urls: string[] = []
  walk(value?.root, (node) => {
    if (node.type !== 'link' && node.type !== 'autolink') return
    const fields = node.fields as { linkType?: string; url?: string } | undefined
    const url = fields?.url ?? ''
    if (fields?.linkType !== 'internal' && (url.startsWith('/') || url.includes(host) || url.includes('nortepalentino'))) {
      urls.push(url)
    }
  })
  return urls
}

export function auditArticle(a: Articulo, site: Site): AuditCheck[] {
  const checks: AuditCheck[] = []
  const add = (id: string, ok: boolean, level: AuditCheck['level'], message: string) =>
    checks.push({ id, ok, level, message })
  const cuerpo = a.cuerpo as LexicalValue
  const query = a.busqueda_objetivo?.trim() ?? ''

  // Búsqueda objetivo
  add('busqueda', Boolean(query), 'error', query ? `Búsqueda objetivo: "${query}".` : 'Falta la búsqueda objetivo.')
  if (query) {
    const title = a.seo_titulo || a.titulo
    add('busqueda-titulo', covers(title, query), 'error', 'La búsqueda objetivo aparece en el título SEO (o el título).')
    add('busqueda-slug', covers(a.slug, query), 'aviso', 'Las palabras de la búsqueda aparecen en el slug.')
    add(
      'busqueda-entrada',
      covers(a.resumen, query) || covers(firstParagraphText(cuerpo), query),
      'aviso',
      'La búsqueda aparece en el resumen o en el primer párrafo.',
    )
    const h2 = headingsOf(cuerpo).filter((h) => h.level === 2)
    add('busqueda-h2', h2.some((h) => keywords(query).some((w) => slugify(h.text).split('-').includes(w))), 'aviso', 'Algún H2 recoge palabras de la búsqueda.')
  }

  // Título y descripción
  const effectiveTitle = a.seo_titulo || `${a.titulo} · ${siteName}`
  add(
    'titulo-longitud',
    effectiveTitle.length <= AUDIT_LIMITS.titleMax,
    'aviso',
    `Título en Google de ${effectiveTitle.length} caracteres (máximo ${AUDIT_LIMITS.titleMax}).${a.seo_titulo ? '' : ' Sin título SEO se añade la marca.'}`,
  )
  const description = (a.seo_descripcion || a.resumen || '').trim()
  add(
    'descripcion',
    description.length >= AUDIT_LIMITS.descriptionMin && description.length <= AUDIT_LIMITS.descriptionMax,
    'aviso',
    description
      ? `Descripción de ${description.length} caracteres (ideal ${AUDIT_LIMITS.descriptionMin}–${AUDIT_LIMITS.descriptionMax}).`
      : 'Falta el resumen (y la descripción SEO).',
  )
  add('resumen', Boolean(a.resumen?.trim()), 'error', 'Tiene resumen answer-first bajo el título.')

  // Enlazado al directorio
  const refs = bodyRefs(cuerpo)
  const broken = refs.filter((r) => !site.docOf(r))
  const directory = new Set(
    refs.filter((r) => DIRECTORY.has(r.relationTo) && site.docOf(r)).map((r) => `${r.relationTo}:${r.id}`),
  )
  add(
    'enlaces-directorio',
    directory.size >= AUDIT_LIMITS.minDirectoryLinks,
    'error',
    `${directory.size} fichas del directorio enlazadas o incrustadas (mínimo ${AUDIT_LIMITS.minDirectoryLinks}).`,
  )
  add(
    'enlaces-rotos',
    broken.length === 0,
    'error',
    broken.length
      ? `Enlaces internos a páginas que no existen en este idioma (se verán como texto): ${broken.map((r) => `${r.relationTo} ${r.id}`).join(', ')}.`
      : 'Todos los enlaces internos existen en este idioma.',
  )
  const own = ownUrlLinks(cuerpo)
  add(
    'enlaces-pegados',
    own.length === 0,
    'aviso',
    own.length
      ? `Enlaces a la web pegados como URL (usa enlace interno para que no se rompan): ${own.join(', ')}.`
      : 'Ningún enlace a la propia web pegado como URL.',
  )

  // Contenido
  const words = wordCount(cuerpo)
  add('longitud', words >= AUDIT_LIMITS.minWords, 'aviso', `${words} palabras (orientativo: ${AUDIT_LIMITS.minWords} o más).`)
  const h2 = headingsOf(cuerpo).filter((h) => h.level === 2).length
  add('estructura', h2 >= AUDIT_LIMITS.minH2, 'aviso', `${h2} secciones H2 (mínimo ${AUDIT_LIMITS.minH2}).`)
  const faqs = completeFaqs(a.faqs).length
  add('faqs', faqs >= AUDIT_LIMITS.minFaqs, 'aviso', `${faqs} FAQs completas (mínimo ${AUDIT_LIMITS.minFaqs}).`)
  add('portada', Boolean(imageOf(site, a.foto_portada)), 'aviso', 'Foto de portada con alt en este idioma.')
  add('autor', Boolean(a.autor), 'error', 'Firmado por un autor.')

  return checks
}
