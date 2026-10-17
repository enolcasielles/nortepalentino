import type { Metadata } from 'next'

import { defaultLocale, type Locale } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/routes'
import { siteName } from '@/lib/site'

import { isSiteIndexable } from './indexability'

type BuildMetadataInput = {
  locale: Locale
  title: string
  description: string
  // Ruta de esta página en cada idioma en que existe. Debe incluir `locale`.
  paths: Partial<Record<Locale, string>>
  // Para páginas noindex por naturaleza (búsqueda, filtros por query param)
  noindex?: boolean
  // Título SEO escrito a mano: se respeta tal cual, sin la marca
  exactTitle?: boolean
  // Open Graph de tipo artículo (blog)
  article?: { publishedTime?: string | null; modifiedTime?: string | null; author?: string | null }
}

// Toda página obtiene sus metadatos de aquí (CLAUDE.md §7.1)
// Descripción meta: el primer tramo del texto, cortado en palabra
function toDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

export function buildMetadata({
  locale,
  title: rawTitle,
  description: rawDescription,
  paths,
  noindex,
  exactTitle,
  article,
}: BuildMetadataInput): Metadata {
  const title = exactTitle || rawTitle.includes(siteName) ? rawTitle : `${rawTitle} · ${siteName}`
  const description = toDescription(rawDescription)
  const canonicalPath = paths[locale]
  if (!canonicalPath) throw new Error(`buildMetadata: falta la ruta para "${locale}"`)

  const languages: Record<string, string> = {}
  for (const [lang, path] of Object.entries(paths)) {
    if (path) languages[lang] = absoluteUrl(path)
  }
  // x-default apunta a ES, solo si la página existe en ES
  if (paths[defaultLocale]) languages['x-default'] = absoluteUrl(paths[defaultLocale])

  const indexable = isSiteIndexable() && !noindex

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      // Solo se emite hreflang si existe más de un idioma
      languages: Object.keys(paths).length > 1 ? languages : undefined,
    },
    // Las páginas no indexables siguen enlaces (noindex,follow)
    robots: { index: indexable, follow: true },
    openGraph: {
      siteName,
      title,
      description,
      url: absoluteUrl(canonicalPath),
      locale: locale === 'es' ? 'es_ES' : 'en_GB',
      ...(article
        ? {
            type: 'article' as const,
            publishedTime: article.publishedTime ?? undefined,
            modifiedTime: article.modifiedTime ?? undefined,
            authors: article.author ? [article.author] : undefined,
          }
        : { type: 'website' as const }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
