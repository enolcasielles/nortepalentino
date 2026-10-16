import type { CollectionConfig } from 'payload'

import { slugField } from '@/fields/slug'
import { redirectOnUrlChange } from '@/hooks/redirects'
import { revalidateCollection } from '@/hooks/revalidate'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('autores')

// Personas reales que firman el contenido editorial
export const Autores: CollectionConfig = {
  slug: 'autores',
  labels: { singular: 'Autor', plural: 'Autores' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug'],
    group: adminGroups.editorial,
  },
  access: { read: () => true },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    slugField({ from: 'nombre' }),
    { name: 'foto', label: 'Foto', type: 'upload', relationTo: 'media' },
    { name: 'bio', label: 'Biografía', type: 'textarea', localized: true },
    { name: 'relacion_con_la_zona', label: 'Relación con la zona', type: 'textarea', localized: true },
    {
      name: 'enlaces',
      label: 'Enlaces',
      labels: { singular: 'Enlace', plural: 'Enlaces' },
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'etiqueta', label: 'Etiqueta', type: 'text', required: true },
            {
              name: 'url',
              label: 'URL',
              type: 'text',
              required: true,
              validate: (value: string | null | undefined) =>
                value && /^https?:\/\/\S+$/.test(value) ? true : 'Debe ser una URL completa (https://…).',
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [...revalidate.afterChange, redirectOnUrlChange('autores', { localizedSlug: false, hasEstado: false })],
    afterDelete: revalidate.afterDelete,
  },
}
