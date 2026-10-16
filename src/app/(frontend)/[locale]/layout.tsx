import { Inter, Inter_Tight } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { SkipLink } from '@/components/layout/SkipLink'
import { getDictionary, isLocale, locales } from '@/lib/i18n'
import { siteUrl } from '@/lib/site'

import '../globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
})

const interTight = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
  display: 'swap',
  variable: '--font-inter-tight',
})

export const metadata = {
  metadataBase: new URL(siteUrl),
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

// Cabecera y pie se pintan en cada página porque necesitan las URLs
// equivalentes en el otro idioma para el selector.
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)

  return (
    <html lang={locale} className={`${inter.variable} ${interTight.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink label={dict.a11y.skipToContent} />
        {children}
      </body>
    </html>
  )
}
