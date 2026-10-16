import type { Crumb } from '@/components/layout/Breadcrumbs'
import type { Site } from '@/lib/data/site'
import { getDictionary, type Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'
import type { RouteMatch } from '@/lib/routes/match'

export type TemplateProps<T extends RouteMatch['type']> = {
  match: Extract<RouteMatch, { type: T }>
  site: Site
  path: string
  alternates: Partial<Record<Locale, string>>
  searchParams?: Record<string, string | string[] | undefined>
}

export type PageMeta = { title: string; description: string; noindex?: boolean }

export function homeCrumb(locale: Locale): Crumb {
  return { name: getDictionary(locale).a11y.home, path: homePath(locale) }
}

export function firstParagraph(text: string | null | undefined): string {
  return text?.split(/\n\s*\n/)[0]?.trim() ?? ''
}
