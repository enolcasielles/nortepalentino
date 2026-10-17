import Image from 'next/image'
import type { ReactNode } from 'react'

import { BusinessCard, RouteCard, SightCard } from '@/components/cards'
import { imageOf } from '@/lib/data/media'
import type { Site } from '@/lib/data/site'
import { fill, type Dictionary } from '@/lib/i18n'
import { blockTarget, headingsOf, linkTarget, type LexicalNode, type LexicalValue } from '@/lib/richtext/lexical'

// Formato de texto de Lexical (máscara de bits)
const BOLD = 1
const ITALIC = 2
const STRIKETHROUGH = 4
const UNDERLINE = 8
const CODE = 16

type Ctx = { site: Site; dict: Dictionary; headingIds: Map<number, string> }

const linkClass = 'font-medium text-primary underline underline-offset-2 hover:text-primary-hover'

function renderText(node: LexicalNode, key: number): ReactNode {
  const format = typeof node.format === 'number' ? node.format : 0
  let out: ReactNode = node.text ?? ''
  if (format & CODE) out = <code className="rounded-sm bg-surface-alt px-1 text-[0.9em]">{out}</code>
  if (format & STRIKETHROUGH) out = <s>{out}</s>
  if (format & UNDERLINE) out = <u>{out}</u>
  if (format & ITALIC) out = <em>{out}</em>
  if (format & BOLD) out = <strong className="font-semibold text-ink">{out}</strong>
  return <span key={key}>{out}</span>
}

function renderChildren(node: LexicalNode, ctx: Ctx): ReactNode[] {
  return (node.children ?? []).map((child, i) => renderNode(child, i, ctx))
}

function renderLink(node: LexicalNode, key: number, ctx: Ctx): ReactNode {
  const children = renderChildren(node, ctx)
  const target = linkTarget(node)
  if (target) {
    // Enlace al directorio: se resuelve en el idioma de la página. Si la
    // ficha no existe en él, queda el texto sin enlace (nunca un 404).
    const href = ctx.site.url.ref(target)
    return href ? (
      <a key={key} href={href} className={linkClass}>
        {children}
      </a>
    ) : (
      <span key={key}>{children}</span>
    )
  }
  const fields = node.fields as { url?: string; newTab?: boolean } | undefined
  const url = fields?.url
  if (!url) return <span key={key}>{children}</span>
  const external = /^https?:\/\//.test(url)
  return (
    <a
      key={key}
      href={url}
      className={linkClass}
      {...(external && { rel: 'noopener' })}
      {...(fields?.newTab && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  )
}

// Tarjeta de una ficha incrustada; nada si no existe en este idioma
function renderFicha(node: LexicalNode, key: number, ctx: Ctx): ReactNode {
  const target = blockTarget(node)
  const doc = target ? ctx.site.docOf(target) : null
  if (!doc) return null
  const { site, dict } = ctx
  let card: ReactNode = null
  if (doc.relationTo === 'negocios') card = <BusinessCard negocio={doc.value} site={site} dict={dict} />
  if (doc.relationTo === 'rutas') card = <RouteCard ruta={doc.value} site={site} dict={dict} />
  if (doc.relationTo === 'recursos') card = <SightCard recurso={doc.value} site={site} dict={dict} />
  return card ? (
    <div key={key} className="my-8 max-w-md">
      {card}
    </div>
  ) : null
}

function renderUpload(node: LexicalNode, key: number, ctx: Ctx): ReactNode {
  if (node.relationTo !== 'media') return null
  const image = imageOf(ctx.site, node.value as number)
  if (!image) return null
  return (
    <figure key={key} className="my-8">
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 768px) 720px, 100vw"
        className="w-full rounded-lg"
      />
      {image.credit && (
        <figcaption className="mt-1 text-xs text-text-muted">{fill(ctx.dict.content.photoCredit, { credit: image.credit })}</figcaption>
      )}
    </figure>
  )
}

function renderNode(node: LexicalNode, key: number, ctx: Ctx, rootIndex?: number): ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node, key)
    case 'linebreak':
      return <br key={key} />
    case 'tab':
      return ' '
    case 'link':
    case 'autolink':
      return renderLink(node, key, ctx)
    case 'paragraph': {
      const children = renderChildren(node, ctx)
      return children.length ? <p key={key}>{children}</p> : null
    }
    case 'heading': {
      const id = rootIndex !== undefined ? ctx.headingIds.get(rootIndex) : undefined
      const children = renderChildren(node, ctx)
      // El H1 es el título de la página: dentro del cuerpo, h2 como mínimo
      if (node.tag === 'h3') {
        return (
          <h3 key={key} id={id} className="scroll-mt-24 pt-4 text-2xl text-ink">
            {children}
          </h3>
        )
      }
      if (node.tag === 'h4' || node.tag === 'h5' || node.tag === 'h6') {
        return (
          <h4 key={key} className="pt-2 text-xl text-ink">
            {children}
          </h4>
        )
      }
      return (
        <h2 key={key} id={id} className="scroll-mt-24 pt-8 text-3xl text-ink">
          {children}
        </h2>
      )
    }
    case 'list': {
      const ordered = node.listType === 'number'
      const Tag = ordered ? 'ol' : 'ul'
      return (
        <Tag key={key} className={`space-y-2 pl-6 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-primary`}>
          {renderChildren(node, ctx)}
        </Tag>
      )
    }
    case 'listitem':
      return <li key={key}>{renderChildren(node, ctx)}</li>
    case 'quote':
      return (
        <blockquote key={key} className="border-l-4 border-accent pl-5 text-text-muted italic">
          {renderChildren(node, ctx)}
        </blockquote>
      )
    case 'horizontalrule':
      return <hr key={key} className="my-10 border-border" />
    case 'upload':
      return renderUpload(node, key, ctx)
    case 'block':
      return renderFicha(node, key, ctx)
    default:
      return node.children ? <span key={key}>{renderChildren(node, ctx)}</span> : null
  }
}

// Cuerpo de un artículo (Lexical → HTML en servidor). Los enlaces internos y
// las fichas incrustadas se resuelven con el índice del sitio (lib/routes).
export function RichText({ value, site, dict }: { value: LexicalValue; site: Site; dict: Dictionary }) {
  if (!value?.root) return null
  const headingIds = new Map(headingsOf(value).map((h) => [h.index, h.id]))
  const ctx: Ctx = { site, dict, headingIds }
  return (
    <div className="max-w-prose space-y-5 text-lg leading-relaxed">
      {(value.root.children ?? []).map((node, i) => renderNode(node, i, ctx, i))}
    </div>
  )
}
