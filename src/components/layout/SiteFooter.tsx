import { getSite } from '@/lib/data/site'
import type { Dictionary, Locale } from '@/lib/i18n'

// El aviso de portal independiente aparece en todas las páginas (CLAUDE.md §1.2)
export async function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const site = await getSite(locale)
  return (
    <footer className="mt-16 bg-surface-alt">
      <div className="container-page space-y-6 py-8 text-sm">
        {site.municipios.length > 0 && (
          <nav aria-labelledby="footer-municipios">
            <h2 id="footer-municipios" className="mb-2 text-base">
              {dict.sections.municipios}
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {site.municipios.map((m) => (
                <li key={m.id}>
                  <a href={site.url.municipio(m)!} className="inline-flex min-h-11 items-center hover:underline">
                    {m.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <p className="text-text-muted">{dict.site.disclaimer}</p>
      </div>
    </footer>
  )
}
