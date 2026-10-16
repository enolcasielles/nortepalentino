import type { Locale } from './config'
import { en } from './en'
import { es, type Dictionary } from './es'

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export type { Dictionary }
export * from './config'
export * from './segments'
