import type { Dictionary } from '@/lib/i18n'
import { familyAttributeIcons } from '@/lib/icons'
import { familyAttributes, type FamilyAttribute } from '@/lib/taxonomies'

// Solo los atributos presentes; nunca se pinta una ausencia (DESIGN.md §5)
export function FamilyAttributes({
  values,
  dict,
  compact = false,
}: {
  values: FamilyAttribute[] | null | undefined
  dict: Dictionary
  compact?: boolean
}) {
  const present = familyAttributes.filter((a) => values?.includes(a))
  if (!present.length) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {present.map((attr) => {
        const Icon = familyAttributeIcons[attr]
        return (
          <li
            key={attr}
            className={`inline-flex items-center gap-1.5 rounded-full bg-primary-soft text-primary ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
          >
            <Icon aria-hidden="true" size={compact ? 14 : 18} />
            {dict.familyAttributes[attr]}
          </li>
        )
      })}
    </ul>
  )
}
