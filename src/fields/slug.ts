import type { FieldHook, TextField } from 'payload'

import { isReservedSlug } from '@/lib/routes/reserved'
import { slugify, SLUG_PATTERN } from '@/lib/routes/slugify'

type SlugFieldOptions = {
  // Campo del que se autogenera el slug si se deja vacío
  from: string
  // Slugs traducidos (rutas, recursos, planes, categorías) frente a topónimos
  localized?: boolean
  // Comprobar contra la lista de slugs reservados (lib/routes/reserved.ts)
  checkReserved?: boolean
}

export function slugField({ from, localized = false, checkReserved = true }: SlugFieldOptions): TextField {
  const autogenerate: FieldHook = ({ value, data }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const source = data?.[from]
    return typeof source === 'string' && source.trim() ? slugify(source) : value
  }

  return {
    name: 'slug',
    type: 'text',
    label: 'Slug',
    required: true,
    unique: true,
    index: true,
    localized,
    admin: {
      position: 'sidebar',
      description: localized
        ? 'Se genera del nombre si lo dejas vacío. Uno por idioma. Cambiarlo crea un redirect 301.'
        : 'Se genera del nombre si lo dejas vacío. Igual en ES y EN. Cambiarlo crea un redirect 301.',
    },
    hooks: {
      beforeValidate: [autogenerate],
    },
    validate: (value: string | null | undefined) => {
      if (!value) return 'El slug es obligatorio.'
      if (!SLUG_PATTERN.test(value)) return 'Solo minúsculas, números y guiones, sin tildes.'
      if (checkReserved && isReservedSlug(value)) return `"${value}" es un slug reservado del sitio.`
      return true
    },
  }
}
