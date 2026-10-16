import type { CollectionConfig } from 'payload'

import { coordinatesField } from '@/fields/coordinates'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('nucleos')

// Núcleos de población (pedanías). El núcleo principal de un municipio
// también es un núcleo, normalmente con el mismo slug.
export const Nucleos: CollectionConfig = {
  slug: 'nucleos',
  labels: { singular: 'Núcleo', plural: 'Núcleos' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'municipio', 'slug'],
    group: adminGroups.territorio,
  },
  access: { read: () => true },
  defaultSort: 'nombre',
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    slugField({ from: 'nombre' }),
    {
      name: 'municipio',
      label: 'Municipio',
      type: 'relationship',
      relationTo: 'municipios',
      required: true,
      index: true,
    },
    coordinatesField(),
  ],
  hooks: revalidate,
}
