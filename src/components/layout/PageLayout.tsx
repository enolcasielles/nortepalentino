import type { ReactNode } from 'react'

import { JsonLd } from '@/components/seo/JsonLd'
import { getDictionary, type Locale } from '@/lib/i18n'

import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

type Props = {
  locale: Locale
  alternatePaths: Partial<Record<Locale, string>>
  breadcrumbs?: Crumb[]
  jsonLd?: object[]
  children: ReactNode
}

export function PageLayout({ locale, alternatePaths, breadcrumbs, jsonLd, children }: Props) {
  const dict = getDictionary(locale)
  return (
    <>
      <SiteHeader locale={locale} dict={dict} alternatePaths={alternatePaths} />
      <main id="contenido" className="container-page flex-1 pt-6 pb-12">
        {breadcrumbs && breadcrumbs.length > 1 && (
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} dict={dict} />
          </div>
        )}
        {children}
      </main>
      <SiteFooter locale={locale} dict={dict} />
      {jsonLd?.length ? <JsonLd data={jsonLd} /> : null}
    </>
  )
}
