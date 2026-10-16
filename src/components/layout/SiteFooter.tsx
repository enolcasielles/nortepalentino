import { Ridges } from '@/components/brand/Ridges'
import { Wordmark } from '@/components/brand/Wordmark'
import { getSite } from '@/lib/data/site'
import type { Dictionary, Locale } from '@/lib/i18n'
import { homePath } from '@/lib/routes'

// El aviso de portal independiente aparece en todas las páginas (CLAUDE.md §1.2)
export async function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const site = await getSite(locale)
  const explore = [
    site.rutasListing() && { href: site.url.rutasListing(null), label: dict.nav.rutas },
    site.recursosListing() && { href: site.url.recursosListing(), label: dict.nav.queVer },
    ...site.categorias.map((c) => {
      const listing = site.negociosListing(null, c.id)
      return listing && { href: site.url.negociosListing(listing), label: c.nombre_plural }
    }),
  ].filter((l): l is { href: string; label: string } => Boolean(l))

  const linkClass = 'inline-flex min-h-11 items-center text-white/90 underline-offset-4 hover:text-white hover:underline'

  return (
    <footer className="mt-8">
      <Ridges className="block h-20 w-full md:h-28" tones={['fill-primary-soft', 'fill-primary', 'fill-ink']} />
      <div className="bg-ink text-white">
        <div className="container-page grid gap-10 pt-6 pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-3">
            <a href={homePath(locale)} className="inline-flex min-h-11 items-center rounded-md">
              <Wordmark inverted />
            </a>
            <p className="max-w-sm text-ink-muted">{dict.site.tagline}</p>
          </div>
          {explore.length > 0 && (
            <nav aria-labelledby="footer-explorar">
              <h2 id="footer-explorar" className="eyebrow mb-2 font-body text-ink-muted">
                {dict.footer.explore}
              </h2>
              <ul>
                {explore.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className={linkClass}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {site.municipios.length > 0 && (
            <nav aria-labelledby="footer-municipios">
              <h2 id="footer-municipios" className="eyebrow mb-2 font-body text-ink-muted">
                {dict.sections.municipios}
              </h2>
              <ul>
                {site.municipios.map((m) => (
                  <li key={m.id}>
                    <a href={site.url.municipio(m)!} className={linkClass}>
                      {m.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <div className="border-t border-white/10">
          <p className="container-page py-5 text-sm text-ink-muted">{dict.site.disclaimer}</p>
        </div>
      </div>
    </footer>
  )
}
