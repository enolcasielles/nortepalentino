import type { CollectionConfig } from 'payload'

import { coordinatesField } from '@/fields/coordinates'
import { faqsField } from '@/fields/faqs'
import { slugField } from '@/fields/slug'
import { redirectOnUrlChange } from '@/hooks/redirects'
import { revalidateCollection } from '@/hooks/revalidate'
import { municipioSlugCollision } from '@/hooks/slugCollisions'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('municipios')

export const Municipios: CollectionConfig = {
  slug: 'municipios',
  labels: { singular: 'Municipio', plural: 'Municipios' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug', 'comarca_zona', 'updatedAt'],
    group: adminGroups.territorio,
  },
  access: { read: () => true },
  defaultSort: 'nombre',
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    slugField({ from: 'nombre' }),
    { name: 'comarca_zona', label: 'Comarca o zona', type: 'text', localized: true },
    coordinatesField(),
    { name: 'altitud_m', label: 'Altitud (m)', type: 'number', min: 0 },
    {
      name: 'distancias_km',
      label: 'Distancias por carretera (km)',
      type: 'group',
      admin: { description: 'Solo datos verificados. Vacío si no se conoce.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'palencia', label: 'Palencia', type: 'number', min: 0 },
            { name: 'santander', label: 'Santander', type: 'number', min: 0 },
            { name: 'madrid', label: 'Madrid', type: 'number', min: 0 },
            { name: 'bilbao', label: 'Bilbao', type: 'number', min: 0 },
          ],
        },
      ],
    },
    {
      name: 'intro',
      label: 'Introducción',
      type: 'textarea',
      localized: true,
      admin: { description: 'Resumen answer-first de 2–3 frases. Sin él, la página no existe en ese idioma.' },
    },
    { name: 'foto_portada', label: 'Foto de portada', type: 'upload', relationTo: 'media' },
    faqsField(),
    {
      name: 'autor',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'autores',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [municipioSlugCollision],
    afterChange: [...revalidate.afterChange, redirectOnUrlChange('municipios', { localizedSlug: false, hasEstado: false })],
    afterDelete: revalidate.afterDelete,
  },
}
