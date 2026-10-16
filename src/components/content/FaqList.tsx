import { Plus } from 'lucide-react'

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
    <section aria-labelledby="faqs" className="space-y-6">
      <h2 id="faqs" className="text-3xl text-ink">
        {dict.content.faqs}
      </h2>
      <div className="space-y-3">
        {items.map((f, i) => (
          <details
            key={i}
            className="group rounded-lg bg-surface-alt px-5 py-2 ring-1 ring-transparent transition-colors open:bg-surface open:shadow-card open:ring-border"
            open={i === 0}
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {f.pregunta}
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-surface text-primary ring-1 ring-border transition-transform duration-200 group-open:rotate-45 group-open:bg-primary group-open:text-primary-contrast group-open:ring-primary"
              >
                <Plus size={18} />
              </span>
            </summary>
            <p className="max-w-prose pt-1 pb-3 whitespace-pre-line text-text">{f.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
