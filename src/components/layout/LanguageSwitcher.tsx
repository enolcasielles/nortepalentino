import { locales, type Dictionary, type Locale } from '@/lib/i18n'

type Props = {
  locale: Locale
  // URL equivalente de la página actual en cada idioma en que existe
  paths: Partial<Record<Locale, string>>
  dict: Dictionary
}

// Enlaza a la URL equivalente localizada; se oculta si no existe (DESIGN.md §5)
export function LanguageSwitcher({ locale, paths, dict }: Props) {
  const target = locales.find((l) => l !== locale && paths[l])
  if (!target) return null

  return (
    <a
      href={paths[target]}
      hrefLang={target}
      lang={target}
      className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-primary hover:bg-primary-soft"
    >
      {dict.language.switchTo}
    </a>
  )
}
