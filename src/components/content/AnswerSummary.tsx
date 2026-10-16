// Primera respuesta de la página, bajo el H1 (DESIGN.md §5)
export function AnswerSummary({ text }: { text: string | null | undefined }) {
  if (!text?.trim()) return null
  return <p className="max-w-prose text-lg text-text">{text}</p>
}
