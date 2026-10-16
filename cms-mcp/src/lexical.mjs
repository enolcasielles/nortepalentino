// Conversión mínima Markdown ↔ Lexical para el campo `cuerpo` de los planes.
// Cubre lo que usa una guía editorial: títulos (##, ###), párrafos, listas,
// citas, negrita, cursiva y enlaces. La forma de los nodos es la que genera
// `convertMarkdownToLexical` de Payload.

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

// Negrita (**), cursiva (* o _) y enlaces [texto](url); sin anidar enlaces
function inline(source, format = 0) {
  const nodes = []
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\((\S+?)\)/g
  let last = 0
  for (const match of source.matchAll(pattern)) {
    if (match.index > last) nodes.push(textNode(source.slice(last, match.index), format))
    const [, bold, italicA, italicB, linkText, url] = match
    if (bold !== undefined) nodes.push(...inline(bold, format | BOLD))
    else if (italicA !== undefined || italicB !== undefined) nodes.push(...inline(italicA ?? italicB, format | ITALIC))
    else nodes.push(linkNode(url, inline(linkText, format)))
    last = match.index + match[0].length
  }
  if (last < source.length) nodes.push(textNode(source.slice(last), format))
  return nodes
}

export function markdownToLexical(markdown) {
  const children = []
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    if (paragraph.length) children.push(block('paragraph', inline(paragraph.join(' ')), { textFormat: 0, textStyle: '' }))
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

    if (!line) {
      flushParagraph()
      flushList()
    } else if (heading) {
      flushParagraph()
      flushList()
      // El H1 es el título de la página: un # en el cuerpo baja a h2
      const level = Math.max(2, heading[1].length)
      children.push(block('heading', inline(heading[2]), { tag: `h${level}` }))
    } else if (bullet || numbered) {
      flushParagraph()
      const listType = bullet ? 'bullet' : 'number'
      if (list && list.listType !== listType) flushList()
      list ??= block('list', [], { listType, start: 1, tag: bullet ? 'ul' : 'ol' })
      list.children.push(block('listitem', inline((bullet ?? numbered)[1]), { value: list.children.length + 1 }))
    } else if (quote) {
      flushParagraph()
      flushList()
      children.push(block('quote', inline(quote[1])))
    } else {
      flushList()
      paragraph.push(line)
    }
  }
  flushParagraph()
  flushList()
  return { root: block('root', children) }
}

function inlineToMarkdown(nodes = []) {
  return nodes
    .map((node) => {
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
        default:
          // Bloques que no se escriben desde aquí (relaciones, uploads…): se señalan
          return `[bloque ${node.type}: edítalo en el panel]`
      }
    })
    .filter((text) => text !== '')
    .join('\n\n')
}
