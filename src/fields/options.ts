import type { Option } from 'payload'

import { en } from '@/lib/i18n/en'
import { es } from '@/lib/i18n/es'

type LabelGroup = 'familyAttributes' | 'difficulty' | 'season'

// Opciones de select con etiqueta ES/EN tomada de los diccionarios de UI
export function localizedOptions<T extends string>(values: readonly T[], group: LabelGroup): Option[] {
  const esLabels = es[group] as Record<string, string>
  const enLabels = en[group] as Record<string, string>
  return values.map((value) => ({
    value,
    label: { es: esLabels[value] ?? value, en: enLabels[value] ?? value },
  }))
}

export function plainOptions(values: readonly string[]): Option[] {
  return values.map((value) => ({ value, label: value }))
}
