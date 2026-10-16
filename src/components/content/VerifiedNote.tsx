import { CalendarCheck } from 'lucide-react'

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
    <p className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-full bg-surface-alt px-3 py-1.5 text-sm text-text-muted">
      <CalendarCheck aria-hidden="true" size={16} className="text-success" />
      <time dateTime={date!.slice(0, 10)}>{fill(dict.content.verified, { date: formatted })}</time>
      {sourceUrl && (
        <>
          <span aria-hidden="true">·</span>
          <a href={sourceUrl} rel="noopener nofollow" className="underline underline-offset-2 hover:text-text">
            {dict.content.source}
          </a>
        </>
      )}
    </p>
  )
}
