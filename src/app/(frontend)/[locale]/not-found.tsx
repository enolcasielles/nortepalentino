import { getDictionary, locales } from '@/lib/i18n'
import { homePath } from '@/lib/routes'

// Next no pasa params a not-found: se muestra en los dos idiomas
export default function NotFound() {
  return (
    <main id="contenido" className="container-page flex-1 space-y-10 py-16">
      {locales.map((locale, i) => {
        const dict = getDictionary(locale)
        // Un solo <h1> por página
        const Heading = i === 0 ? 'h1' : 'h2'
        return (
          <section key={locale} lang={locale} className="space-y-3">
            <Heading className="text-3xl">{dict.notFound.title}</Heading>
            <p className="text-text-muted">{dict.notFound.body}</p>
            <a href={homePath(locale)} className="inline-flex min-h-11 items-center font-medium text-primary underline underline-offset-2">
              {dict.notFound.back}
            </a>
          </section>
        )
      })}
    </main>
  )
}
