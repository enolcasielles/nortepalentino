import type { Metadata } from 'next'

import { MunicipioCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import { Section } from '@/components/content/Section'
import { TrailArrow } from '@/components/content/TrailArrow'
import { PageLayout } from '@/components/layout/PageLayout'
import { getSite } from '@/lib/data/site'
import { getDictionary, locales, type Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld'

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

// DESIGN.md §6 · Home. Planes, buscador, mapa de la comarca, "quiénes somos" y
// FAQs llegan cuando existan sus páginas y su contenido.
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const dict = getDictionary(locale)
  const site = await getSite(locale)

  // Accesos por intención: solo a listados que existen (§7.4)
  const intents = [
    site.rutasListing('con-ninos') && { href: site.url.rutasListing('con-ninos'), label: dict.titles.rutasFiltered },
    site.rutasListing() && { href: site.url.rutasListing(null), label: dict.titles.rutas },
    site.recursosListing() && { href: site.url.recursosListing(), label: dict.titles.recursos },
    ...site.categorias.map((c) => {
      const listing = site.negociosListing(null, c.id)
      return listing && { href: site.url.negociosListing(listing), label: c.nombre_plural }
    }),
  ].filter((i): i is { href: string; label: string } => Boolean(i))

  return (
    <PageLayout locale={locale} alternatePaths={paths} jsonLd={[websiteJsonLd(locale), organizationJsonLd(locale)]}>
      <div className="space-y-14">
        <header className="space-y-3 py-6">
          <h1 className="max-w-3xl text-4xl">{dict.site.tagline}</h1>
        </header>

        {intents.length > 0 && (
          <nav aria-label={dict.nav.label}>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {intents.map((i) => (
                <li key={i.href}>
                  <a
                    href={i.href}
                    className="group flex min-h-14 items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 font-medium hover:shadow-card"
                  >
                    {i.label}
                    <TrailArrow />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {site.municipios.length > 0 && (
          <Section id="municipios" title={dict.sections.municipios}>
            <CardGrid>
              {site.municipios.map((m) => (
                <li key={m.id}>
                  <MunicipioCard municipio={m} site={site} dict={dict} />
                </li>
              ))}
            </CardGrid>
          </Section>
        )}
      </div>
    </PageLayout>
  )
}
