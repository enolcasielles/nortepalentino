import type { Dictionary } from '@/lib/i18n'

import { Prose } from './Prose'

// Experiencia propia, visualmente diferenciada y firmada (DESIGN.md §5)
export function ExperienceBlock({
  text,
  author,
  dict,
}: {
  text: string | null | undefined
  author?: string | null
  dict: Dictionary
}) {
  if (!text?.trim()) return null
  return (
    <section aria-labelledby="experiencia" className="rounded-md border-l-4 border-accent bg-surface p-5">
      <h2 id="experiencia" className="mb-3 text-xl">
        {dict.content.experiencia}
      </h2>
      <Prose text={text} />
      {author && <p className="mt-3 text-sm font-medium text-text-muted">— {author}</p>}
    </section>
  )
}
