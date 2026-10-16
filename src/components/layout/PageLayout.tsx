import type { ReactNode } from 'react'

import { JsonLd } from '@/components/seo/JsonLd'
import { getDictionary, type Locale } from '@/lib/i18n'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { PageHero, type PageHeroProps } from './PageHero'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

type Props = {
  locale: Locale
  alternatePaths: Partial<Record<Locale, string>>
  breadcrumbs?: Crumb[]
  // Cabecera a todo el ancho con el H1; si existe, lleva también las migas
  hero?: PageHeroProps
  // Bloque a todo el ancho propio de la página (el hero de la home)
  masthead?: ReactNode
  jsonLd?: object[]
  children: ReactNode
}

export function PageLayout({ locale, alternatePaths, breadcrumbs, hero, masthead, jsonLd, children }: Props) {
  const dict = getDictionary(locale)
  return (
    <>
      <SiteHeader locale={locale} dict={dict} alternatePaths={alternatePaths} />
      <main id="contenido" className="flex-1">
        {masthead}
        {hero && <PageHero {...hero} breadcrumbs={breadcrumbs} dict={dict} />}
        <div className={`container-page pb-16 ${hero || masthead ? 'pt-10 md:pt-14' : 'pt-6'}`}>
          {!hero && breadcrumbs && breadcrumbs.length > 1 && (
            <div className="mb-6">
              <Breadcrumbs items={breadcrumbs} dict={dict} />
            </div>
          )}
          {children}
        </div>
      </main>
      <SiteFooter locale={locale} dict={dict} />
      {jsonLd?.length ? <JsonLd data={jsonLd} /> : null}
    </>
  )
}
