import type { CollectionConfig } from 'payload'

import { adminGroups } from '../groups'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Imagen', plural: 'Imágenes' },
  admin: { group: adminGroups.sistema },
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      label: 'Texto alternativo',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Describe lo que se ve y dónde. Nunca "imagen" ni el nombre del archivo.' },
    },
    {
      name: 'credito',
      label: 'Crédito',
      type: 'text',
    },
    {
      name: 'licencia',
      label: 'Licencia',
      type: 'text',
    },
    {
      name: 'es_propia',
      label: 'Foto propia',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
