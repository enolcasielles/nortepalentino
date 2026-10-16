import type { Field } from 'payload'

import { estados } from '@/lib/taxonomies'

import { requiredWhenPublished } from './validation'

export const estadoField: Field = {
  name: 'estado',
  label: 'Estado',
  type: 'select',
  required: true,
  defaultValue: 'borrador',
  index: true,
  options: [
    { value: estados[0], label: 'Borrador' },
    { value: estados[1], label: 'Publicado' },
  ],
  admin: { position: 'sidebar' },
}

// Fuente y fecha de verificación: obligatorias para publicar una ficha (CLAUDE.md §10)
export const verificationFields: Field[] = [
  {
    name: 'fuente_url',
    label: 'URL de la fuente',
    type: 'text',
    admin: { position: 'sidebar', description: 'Web del negocio o fuente oficial de los datos.' },
    validate: (value: string | null | undefined, options: { siblingData: unknown }) => {
      if (value && !/^https?:\/\/\S+$/.test(value)) return 'Debe ser una URL completa (https://…).'
      return requiredWhenPublished()(value, options)
    },
  },
  {
    name: 'fecha_verificacion',
    label: 'Fecha de verificación',
    type: 'date',
    admin: {
      position: 'sidebar',
      date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
    },
    validate: requiredWhenPublished(),
  },
  estadoField,
]
