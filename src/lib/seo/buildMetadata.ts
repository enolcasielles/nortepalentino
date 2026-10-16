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
}

// Toda página obtiene sus metadatos de aquí (CLAUDE.md §7.1)
export function buildMetadata({ locale, title, description, paths, noindex }: BuildMetadataInput): Metadata {
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
      type: 'website',
      siteName,
      title,
      description,
      url: absoluteUrl(canonicalPath),
      locale: locale === 'es' ? 'es_ES' : 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
