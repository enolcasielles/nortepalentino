// Texto de un textarea de Payload: párrafos separados por líneas en blanco
export function Prose({ text, lang }: { text: string | null | undefined; lang?: string }) {
  if (!text?.trim()) return null
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <div lang={lang} className="max-w-prose space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  )
}
