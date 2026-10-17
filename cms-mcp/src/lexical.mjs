// Conversión mínima Markdown ↔ Lexical para el campo `cuerpo` de los artículos.
// Cubre lo que usa un artículo: títulos (##, ###), párrafos, listas, citas,
// negrita, cursiva, enlaces y, para enlazar el directorio:
//   [texto](interno:negocios/slug)   enlace interno a un documento de la web
//   ::ficha[rutas/slug]              tarjeta de una ficha, en su propia línea
// La forma de los nodos es la que genera `convertMarkdownToLexical` de Payload.

import { randomBytes } from 'node:crypto'

const BOLD = 1
const ITALIC = 2

const block = (type, children, extra = {}) => ({ children, direction: null, format: '', indent: 0, type, version: 1, ...extra })
const textNode = (text, format = 0) => ({ detail: 0, format, mode: 'normal', style: '', text, type: 'text', version: 1 })
const linkNode = (url, children) => ({
  ...block('link', children),
  version: 3,
  fields: { linkType: 'custom', newTab: false, url },
  id: randomBytes(12).toString('hex'),
})
const internalLinkNode = (relationTo, value, children) => ({
  ...block('link', children),
  version: 3,
  fields: { linkType: 'internal', newTab: false, doc: { relationTo, value } },
  id: randomBytes(12).toString('hex'),
})
const fichaNode = (relationTo, value) => ({
  type: 'block',
  version: 2,
  format: '',
  fields: { id: randomBytes(12).toString('hex'), blockName: '', blockType: 'ficha', ficha: { relationTo, value } },
})

export const LINKABLE = ['negocios', 'rutas', 'recursos', 'municipios', 'articulos']
export const EMBEDDABLE = ['negocios', 'rutas', 'recursos']
const INTERNAL = /^interno:([a-z_]+)\/(\S+)$/
const FICHA_LINE = /^::ficha\[([a-z_]+)\/([^\]\s]+)\]$/

// Referencias "coleccion/slug" del Markdown que hay que convertir en ids
// antes de llamar a markdownToLexical
export function internalRefs(markdown) {
  const refs = []
  for (const m of markdown.matchAll(/\]\(interno:([a-z_]+)\/(\S+?)\)/g)) refs.push({ collection: m[1], ref: m[2], kind: 'enlace' })
  for (const m of markdown.matchAll(/^\s*::ficha\[([a-z_]+)\/([^\]\s]+)\]\s*$/gm)) refs.push({ collection: m[1], ref: m[2], kind: 'ficha' })
  return refs
}

// Negrita (**), cursiva (* o _) y enlaces [texto](url); sin anidar enlaces
function inline(source, format = 0, ids = new Map()) {
  const nodes = []
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\((\S+?)\)/g
  let last = 0
  for (const match of source.matchAll(pattern)) {
    if (match.index > last) nodes.push(textNode(source.slice(last, match.index), format))
    const [, bold, italicA, italicB, linkText, url] = match
    if (bold !== undefined) nodes.push(...inline(bold, format | BOLD, ids))
    else if (italicA !== undefined || italicB !== undefined) nodes.push(...inline(italicA ?? italicB, format | ITALIC, ids))
    else {
      const internal = url.match(INTERNAL)
      nodes.push(
        internal
          ? internalLinkNode(internal[1], ids.get(`${internal[1]}/${internal[2]}`), inline(linkText, format, ids))
          : linkNode(url, inline(linkText, format, ids)),
      )
    }
    last = match.index + match[0].length
  }
  if (last < source.length) nodes.push(textNode(source.slice(last), format))
  return nodes
}

// `ids`: Map "coleccion/slug" → id, resuelto antes con internalRefs()
export function markdownToLexical(markdown, ids = new Map()) {
  const children = []
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (paragraph.length) children.push(block('paragraph', inline(paragraph.join(' '), 0, ids), { textFormat: 0, textStyle: '' }))
    paragraph = []
  }
  const flushList = () => {
    if (list) children.push(list)
    list = null
  }

  for (const raw of lines) {
    const line = raw.trim()
    const heading = line.match(/^(#{1,4})\s+(.*)$/)
    const bullet = line.match(/^[-*]\s+(.*)$/)
    const numbered = line.match(/^\d+[.)]\s+(.*)$/)
    const quote = line.match(/^>\s?(.*)$/)
    const ficha = line.match(FICHA_LINE)

    if (ficha) {
      flushParagraph()
      flushList()
      children.push(fichaNode(ficha[1], ids.get(`${ficha[1]}/${ficha[2]}`)))
    } else if (!line) {
      flushParagraph()
      flushList()
    } else if (heading) {
      flushParagraph()
      flushList()
      // El H1 es el título de la página: un # en el cuerpo baja a h2
      const level = Math.max(2, heading[1].length)
      children.push(block('heading', inline(heading[2], 0, ids), { tag: `h${level}` }))
    } else if (bullet || numbered) {
      flushParagraph()
      const listType = bullet ? 'bullet' : 'number'
      if (list && list.listType !== listType) flushList()
      list ??= block('list', [], { listType, start: 1, tag: bullet ? 'ul' : 'ol' })
      list.children.push(block('listitem', inline((bullet ?? numbered)[1], 0, ids), { value: list.children.length + 1 }))
    } else if (quote) {
      flushParagraph()
      flushList()
      children.push(block('quote', inline(quote[1], 0, ids)))
    } else {
      flushList()
      paragraph.push(line)
    }
  }
  flushParagraph()
  flushList()
  return { root: block('root', children) }
}

// "coleccion/slug" de una relación (poblada o no); el slug en español si está traducido
function refOf(rel) {
  const value = rel?.value
  const slug = value && typeof value === 'object' ? value.slug : null
  const id = value && typeof value === 'object' ? value.id : value
  return `${rel?.relationTo}/${(slug && typeof slug === 'object' ? slug.es ?? slug.en : slug) || id}`
}

function inlineToMarkdown(nodes = []) {
  return nodes
    .map((node) => {
      if (node.type === 'link' && node.fields?.linkType === 'internal') {
        return `[${inlineToMarkdown(node.children)}](interno:${refOf(node.fields.doc)})`
      }
      if (node.type === 'link') return `[${inlineToMarkdown(node.children)}](${node.fields?.url ?? ''})`
      if (node.type === 'linebreak') return '\n'
      if (node.type !== 'text') return inlineToMarkdown(node.children)
      let text = node.text
      if (node.format & ITALIC) text = `*${text}*`
      if (node.format & BOLD) text = `**${text}**`
      return text
    })
    .join('')
}

export function lexicalToMarkdown(value) {
  if (!value?.root) return value ?? null
  return value.root.children
    .map((node) => {
      switch (node.type) {
        case 'heading':
          return `${'#'.repeat(Number(node.tag.slice(1)))} ${inlineToMarkdown(node.children)}`
        case 'list':
          return node.children
            .map((item, i) => `${node.listType === 'number' ? `${i + 1}.` : '-'} ${inlineToMarkdown(item.children)}`)
            .join('\n')
        case 'quote':
          return `> ${inlineToMarkdown(node.children)}`
        case 'paragraph':
          return inlineToMarkdown(node.children)
        case 'block':
          return node.fields?.blockType === 'ficha' ? `::ficha[${refOf(node.fields.ficha)}]` : `[bloque ${node.fields?.blockType}: edítalo en el panel]`
        default:
          // Bloques que no se escriben desde aquí (relaciones, uploads…): se señalan
          return `[bloque ${node.type}: edítalo en el panel]`
      }
    })
    .filter((text) => text !== '')
    .join('\n\n')
}
