import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'credito',
      type: 'text',
    },
    {
      name: 'licencia',
      type: 'text',
    },
    {
      name: 'es_propia',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
