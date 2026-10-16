import { fill, formatDate, type Dictionary, type Locale } from '@/lib/i18n'

export function VerifiedNote({
  date,
  sourceUrl,
  locale,
  dict,
}: {
  date: string | null | undefined
  sourceUrl?: string | null
  locale: Locale
  dict: Dictionary
}) {
  const formatted = formatDate(date, locale)
  if (!formatted) return null
  return (
    <p className="text-sm text-text-muted">
      <time dateTime={date!.slice(0, 10)}>{fill(dict.content.verified, { date: formatted })}</time>
      {sourceUrl && (
        <>
          {' · '}
          <a href={sourceUrl} rel="noopener nofollow" className="underline underline-offset-2 hover:text-text">
            {dict.content.source}
          </a>
        </>
      )}
    </p>
  )
}
