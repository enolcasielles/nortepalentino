import type { Dictionary } from '@/lib/i18n'

export type Faq = { pregunta?: string | null; respuesta?: string | null }

// Solo los pares completos en el idioma de la página
export function completeFaqs(faqs: Faq[] | null | undefined): { pregunta: string; respuesta: string }[] {
  return (faqs ?? []).filter((f): f is { pregunta: string; respuesta: string } =>
    Boolean(f.pregunta?.trim() && f.respuesta?.trim()),
  )
}

// <details> nativo: la respuesta completa está en el HTML (DESIGN.md §5)
export function FaqList({ faqs, dict }: { faqs: Faq[] | null | undefined; dict: Dictionary }) {
  const items = completeFaqs(faqs)
  if (!items.length) return null
  return (
    <section aria-labelledby="faqs" className="space-y-4">
      <h2 id="faqs" className="text-2xl">
        {dict.content.faqs}
      </h2>
      <div className="divide-y divide-border rounded-md bg-surface-alt">
        {items.map((f, i) => (
          <details key={i} className="group px-4 py-3" open={i === 0}>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {f.pregunta}
              <span aria-hidden="true" className="text-accent transition-transform group-open:rotate-90">
                ›
              </span>
            </summary>
            <p className="mt-2 max-w-prose whitespace-pre-line text-text">{f.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
