import { slugify } from '@/lib/routes/slugify'

// Lectura del JSON de Lexical (campo `cuerpo` de los artículos) sin depender
// del editor: lo usan el render, el hook que extrae los enlaces al directorio,
// la auditoría SEO y los .md. Tipos deliberadamente laxos: el JSON viene de la BD.

export type LexicalNode = {
  type: string
  children?: LexicalNode[]
  text?: string
  format?: number | string
  tag?: string
  listType?: string
  fields?: Record<string, unknown>
  value?: unknown
  relationTo?: string
  [key: string]: unknown
}

export type LexicalValue = { root: LexicalNode } | null | undefined

// Colecciones que se pueden enlazar desde un artículo (CLAUDE.md §6)
export const linkableCollections = ['negocios', 'rutas', 'recursos', 'municipios', 'articulos'] as const
export type LinkableCollection = (typeof linkableCollections)[number]

// Fichas que se pueden incrustar como tarjeta (bloque "ficha")
export const embeddableCollections = ['negocios', 'rutas', 'recursos'] as const
export type EmbeddableCollection = (typeof embeddableCollections)[number]

export type DocRef = { relationTo: LinkableCollection; id: number }

const isLinkable = (v: unknown): v is LinkableCollection =>
  typeof v === 'string' && (linkableCollections as readonly string[]).includes(v)

// id de una relación, poblada o no
function idOf(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  if (value && typeof value === 'object' && 'id' in value) return idOf((value as { id: unknown }).id)
  return null
}

function toRef(relationTo: unknown, value: unknown): DocRef | null {
  const id = idOf(value)
  return isLinkable(relationTo) && id !== null ? { relationTo, id } : null
}

// Destino interno de un nodo de enlace, si lo es
export function linkTarget(node: LexicalNode): DocRef | null {
  if (node.type !== 'link' && node.type !== 'autolink') return null
  const fields = node.fields as { linkType?: string; doc?: { relationTo?: unknown; value?: unknown } | null } | undefined
  if (fields?.linkType !== 'internal' || !fields.doc) return null
  return toRef(fields.doc.relationTo, fields.doc.value)
}

// Ficha de un bloque incrustado, si lo es
export function blockTarget(node: LexicalNode): DocRef | null {
  if (node.type !== 'block') return null
  const fields = node.fields as { blockType?: string; ficha?: { relationTo?: unknown; value?: unknown } } | undefined
  if (fields?.blockType !== 'ficha' || !fields.ficha) return null
  return toRef(fields.ficha.relationTo, fields.ficha.value)
}

export function walk(node: LexicalNode | undefined, visit: (node: LexicalNode) => void): void {
  if (!node) return
  visit(node)
  for (const child of node.children ?? []) walk(child, visit)
}

export type BodyRef = DocRef & { kind: 'link' | 'block' }

// Todo lo que el cuerpo enlaza o incrusta, en orden de aparición y sin repetir
export function bodyRefs(value: LexicalValue): BodyRef[] {
  const seen = new Set<string>()
  const refs: BodyRef[] = []
  walk(value?.root, (node) => {
    const link = linkTarget(node)
    const block = blockTarget(node)
    const ref = link ? { ...link, kind: 'link' as const } : block ? { ...block, kind: 'block' as const } : null
    if (!ref) return
    const key = `${ref.kind}:${ref.relationTo}:${ref.id}`
    if (seen.has(key)) return
    seen.add(key)
    refs.push(ref)
  })
  return refs
}

// Referencias únicas por documento (sin distinguir enlace y tarjeta)
export function uniqueDocs(refs: DocRef[]): DocRef[] {
  const seen = new Set<string>()
  return refs.filter((r) => {
    const key = `${r.relationTo}:${r.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function nodeText(node: LexicalNode | undefined): string {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'linebreak') return '\n'
  return (node.children ?? []).map(nodeText).join('')
}

const BLOCK_TYPES = new Set(['paragraph', 'heading', 'listitem', 'quote'])

// Texto plano por bloques, separado por líneas en blanco
export function plainText(value: LexicalValue): string {
  const parts: string[] = []
  walk(value?.root, (node) => {
    if (BLOCK_TYPES.has(node.type)) {
      const text = nodeText(node).trim()
      if (text) parts.push(text)
    }
  })
  return parts.join('\n\n')
}

export function hasText(value: LexicalValue): boolean {
  return plainText(value).length > 0
}

export function wordCount(value: LexicalValue): number {
  return plainText(value).split(/\s+/).filter(Boolean).length
}

// `index`: posición entre los hijos de la raíz, para que el render use el mismo id
// Minutos de lectura a ~200 palabras por minuto
export function readingMinutes(value: unknown): number {
  return Math.max(1, Math.round(wordCount(value as LexicalValue) / 200))
}

export type Heading = { id: string; text: string; level: 2 | 3; index: number }

// H2 y H3 del cuerpo con ids estables y únicos para el índice
export function headingsOf(value: LexicalValue): Heading[] {
  const used = new Map<string, number>()
  const headings: Heading[] = []
  for (const [index, node] of (value?.root.children ?? []).entries()) {
    if (node.type !== 'heading' || (node.tag !== 'h2' && node.tag !== 'h3')) continue
    const text = nodeText(node).trim()
    if (!text) continue
    const base = slugify(text) || 'seccion'
    const n = used.get(base) ?? 0
    used.set(base, n + 1)
    headings.push({ id: n ? `${base}-${n + 1}` : base, text, level: node.tag === 'h2' ? 2 : 3, index })
  }
  return headings
}

// Primer párrafo con texto
export function firstParagraphText(value: LexicalValue): string {
  for (const node of value?.root.children ?? []) {
    if (node.type !== 'paragraph') continue
    const text = nodeText(node).trim()
    if (text) return text
  }
  return ''
}
