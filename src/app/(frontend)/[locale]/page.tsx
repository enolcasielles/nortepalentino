import { Baby, Church, Footprints, MapPin, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Ridges } from '@/components/brand/Ridges'
import { MunicipioCard, RouteCard, SightCard } from '@/components/cards'
import { CardGrid, categoryIcon } from '@/components/cards/Card'
import { Section } from '@/components/content/Section'
import { PageLayout } from '@/components/layout/PageLayout'
import { getSite } from '@/lib/data/site'
import { getDictionary, isLocale, locales, type Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld'

type Props = { params: Promise<{ locale: string }> }

const HOME_CARDS = 3

const paths = Object.fromEntries(locales.map((l) => [l, homePath(l)])) as Record<Locale, string>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
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
  // El layout también lo valida, pero la página se ejecuta en paralelo
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const site = await getSite(locale)

  // Accesos por intención: solo a listados que existen (§7.4)
  const intents = [
    site.rutasListing('con-ninos') && { href: site.url.rutasListing('con-ninos'), label: dict.titles.rutasFiltered, icon: Baby },
    site.rutasListing() && { href: site.url.rutasListing(null), label: dict.titles.rutas, icon: Footprints },
    site.recursosListing() && { href: site.url.recursosListing(), label: dict.titles.recursos, icon: Church },
    ...site.categorias.map((c) => {
      const listing = site.negociosListing(null, c.id)
      return listing && { href: site.url.negociosListing(listing), label: c.nombre_plural, icon: categoryIcon(c.icono) ?? MapPin }
    }),
  ].filter((i): i is { href: string; label: string; icon: LucideIcon } => Boolean(i))

  const rutas = site.rutas.slice(0, HOME_CARDS)
  const recursos = site.recursos.slice(0, HOME_CARDS)

  const masthead = (
    <section aria-labelledby="home-title" className="relative isolate overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="contours absolute inset-0 -z-10 text-white opacity-[0.07] [mask-size:1200px_auto]" />
      {/* Sol poniéndose tras las crestas: halo difuso y disco */}
      <div aria-hidden="true" className="absolute right-[-10%] bottom-0 -z-10 size-[28rem] rounded-full bg-accent opacity-25 blur-3xl md:right-[2%] md:size-[36rem]" />
      <div aria-hidden="true" className="absolute right-[-2rem] bottom-24 -z-10 size-32 rounded-full bg-linear-to-b from-accent-soft to-accent md:right-[4%] md:bottom-36 md:size-44" />
      <div className="container-page pt-12 md:pt-20">
        <div className="max-w-3xl space-y-6">
          <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white ring-1 ring-white/15 backdrop-blur-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            {dict.home.eyebrow}
          </p>
          <h1 id="home-title" className="text-5xl">
            {dict.site.tagline}
          </h1>
          <p className="max-w-xl text-lg text-ink-muted md:text-xl">{dict.home.lead}</p>
        </div>
        {intents.length > 0 && (
          <nav aria-label={dict.home.explore} className="relative z-10 mt-8 md:mt-10">
            <ul className="flex flex-wrap gap-2.5">
              {intents.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-4 font-semibold text-ink shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0"
                  >
                    <Icon aria-hidden="true" size={18} className="text-primary" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <Ridges className="-mt-6 block h-32 w-full md:-mt-10 md:h-52" tones={['fill-primary-hover', 'fill-primary', 'fill-bg']} />
    </section>
  )

  return (
    <PageLayout
      locale={locale}
      alternatePaths={paths}
      masthead={masthead}
      jsonLd={[websiteJsonLd(locale), organizationJsonLd(locale)]}
    >
      <div className="space-y-16 md:space-y-20">
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

        {rutas.length > 0 && (
          <Section
            id="rutas"
            title={dict.titles.rutas}
            more={site.rutasListing() ? { href: site.url.rutasListing(null), label: dict.sections.seeAll } : null}
          >
            <CardGrid>
              {rutas.map((r) => (
                <li key={r.id}>
                  <RouteCard ruta={r} site={site} dict={dict} />
                </li>
              ))}
            </CardGrid>
          </Section>
        )}

        {recursos.length > 0 && (
          <Section
            id="que-ver"
            title={dict.titles.recursos}
            more={site.recursosListing() ? { href: site.url.recursosListing(), label: dict.sections.seeAll } : null}
          >
            <CardGrid>
              {recursos.map((r) => (
                <li key={r.id}>
                  <SightCard recurso={r} site={site} dict={dict} />
                </li>
              ))}
            </CardGrid>
          </Section>
        )}
      </div>
    </PageLayout>
  )
}
