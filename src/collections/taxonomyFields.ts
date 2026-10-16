import type { Field } from 'payload'

import { plainOptions } from '@/fields/options'
import { slugField } from '@/fields/slug'
import { categoryIconKeys } from '@/lib/icons'
import { colorTokens } from '@/lib/taxonomies'

// Forma común de categorias_negocio y tipos_recurso (CLAUDE.md §6)
export function taxonomyFields(schemaTypes: readonly string[]): Field[] {
  return [
    {
      type: 'row',
      fields: [
        { name: 'nombre', label: 'Nombre (singular)', type: 'text', localized: true, required: true },
        { name: 'nombre_plural', label: 'Nombre (plural)', type: 'text', localized: true, required: true },
      ],
    },
    slugField({ from: 'nombre_plural', localized: true }),
    {
      name: 'tipo_schema',
      label: 'Tipo schema.org',
      type: 'select',
      required: true,
      options: plainOptions(schemaTypes),
      admin: { position: 'sidebar' },
    },
    {
      name: 'color_token',
      label: 'Grupo de color',
      type: 'select',
      required: true,
      options: plainOptions(colorTokens),
      admin: { position: 'sidebar', description: 'Uno de los siete grupos de DESIGN.md §3.1.' },
    },
    {
      name: 'icono',
      label: 'Icono',
      type: 'select',
      required: true,
      options: plainOptions(categoryIconKeys),
      admin: { position: 'sidebar' },
    },
  ]
}
