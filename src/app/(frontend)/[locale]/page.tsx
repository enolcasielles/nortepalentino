import type { Metadata } from 'next'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getDictionary, locales, type Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/buildMetadata'

type Props = { params: Promise<{ locale: Locale }> }

const paths = Object.fromEntries(locales.map((l) => [l, homePath(l)])) as Record<Locale, string>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const dict = getDictionary(locale)
  return buildMetadata({
    locale,
    title: `${dict.site.name} · ${dict.site.tagline}`,
    description: dict.site.tagline,
    paths,
  })
}

// Home provisional: la anatomía completa está en DESIGN.md §6
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale)

  return (
    <>
      <SiteHeader locale={locale} dict={dict} alternatePaths={paths} />
      <main id="contenido" className="container-page flex-1 py-12">
        <h1 className="text-4xl text-text">{dict.site.tagline}</h1>
      </main>
      <SiteFooter dict={dict} />
    </>
  )
}
