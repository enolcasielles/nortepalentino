import { LogoSymbol } from '@/components/brand/Wordmark'
import { getDictionary, locales } from '@/lib/i18n'
import { homePath } from '@/lib/routes'

// Next no pasa params a not-found: se muestra en los dos idiomas
export default function NotFound() {
  return (
    <main id="contenido" className="container-page flex-1 space-y-10 py-16 md:py-24">
      <span aria-hidden="true" className="grid size-14 place-items-center rounded-lg bg-primary text-primary-contrast shadow-card">
        <LogoSymbol className="size-9" />
      </span>
      {locales.map((locale, i) => {
        const dict = getDictionary(locale)
        // Un solo <h1> por página
        const Heading = i === 0 ? 'h1' : 'h2'
        return (
          <section key={locale} lang={locale} className="space-y-3">
            <Heading className="text-4xl text-ink">{dict.notFound.title}</Heading>
            <p className="text-text-muted">{dict.notFound.body}</p>
            <a href={homePath(locale)} className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-primary-contrast shadow-card hover:bg-primary-hover">
              {dict.notFound.back}
            </a>
          </section>
        )
      })}
    </main>
  )
}
