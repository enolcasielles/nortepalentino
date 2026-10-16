import { Quote } from 'lucide-react'

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
    <section aria-labelledby="experiencia" className="relative rounded-lg bg-accent-soft p-6 md:p-8">
      <Quote aria-hidden="true" size={36} className="absolute top-5 right-5 text-accent opacity-60" />
      <h2 id="experiencia" className="mb-3 pr-12 text-2xl text-ink">
        {dict.content.experiencia}
      </h2>
      <div className="text-lg">
        <Prose text={text} />
      </div>
      {author && <p className="mt-4 text-sm font-semibold text-accent-text">— {author}</p>}
    </section>
  )
}
