import type { Difficulty } from '@/lib/taxonomies'

const stripe: Record<Difficulty, string> = {
  facil: 'bg-difficulty-facil',
  moderada: 'bg-difficulty-moderada border-t border-difficulty-moderada-border',
  dificil: 'bg-difficulty-dificil',
}

// Baliza de dificultad: blanco arriba y color abajo, siempre con su etiqueta (DESIGN.md §3.5)
export function DifficultyMark({ difficulty, label }: { difficulty: Difficulty; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-3 w-6 flex-col overflow-hidden rounded-sm border border-border-strong"
      >
        <span className="h-1/2 bg-white" />
        <span className={`h-1/2 ${stripe[difficulty]}`} />
      </span>
      <span>{label}</span>
    </span>
  )
}
