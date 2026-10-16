import type { Locale } from './config'

const intlLocale: Record<Locale, string> = { es: 'es-ES', en: 'en-GB' }

// Rellena plantillas de microcopy: fill('Desde {city}', { city: 'Palencia' })
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`))
}

// Plural según el idioma: plural({ one: '{n} ruta', other: '{n} rutas' }, 3, 'es')
export function plural(forms: { one: string; other: string }, n: number, locale: Locale): string {
  const form = new Intl.PluralRules(intlLocale[locale]).select(n) === 'one' ? forms.one : forms.other
  return fill(form, { n })
}

// "16 oct 2026" / "16 Oct 2026"
export function formatDate(iso: string | null | undefined, locale: Locale): string | null {
  if (!iso) return null
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Madrid',
  })
    .format(new Date(iso))
    .replace('.', '')
}

export function formatNumber(value: number, locale: Locale, maxDecimals = 1): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: maxDecimals }).format(value)
}

// 2.5 → "2 h 30"
export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

export function isoDate(iso: string | null | undefined): string | undefined {
  return iso ? iso.slice(0, 10) : undefined
}
