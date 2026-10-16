import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { coordinatesField } from '@/fields/coordinates'
import { slugField } from '@/fields/slug'
import { verificationFields } from '@/fields/verification'
import { redirectOnUrlChange } from '@/hooks/redirects'
import { rejectDemoInProduction } from '@/hooks/rejectDemoInProduction'
import { revalidateCollection } from '@/hooks/revalidate'
import { setMunicipioFromNucleo } from '@/hooks/setMunicipioFromNucleo'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('recursos')

// Un recurso es un lugar que se visita aunque cobre entrada (CLAUDE.md §6)
export const Recursos: CollectionConfig = {
  slug: 'recursos',
  labels: { singular: 'Recurso', plural: 'Recursos' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'tipo', 'municipio', 'estado'],
    group: adminGroups.queVer,
  },
  access: { read: publishedOrAuthenticated },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', localized: true, required: true },
    slugField({ from: 'nombre', localized: true }),
    {
      type: 'row',
      fields: [
        {
          name: 'tipo',
          label: 'Tipo',
          type: 'relationship',
          relationTo: 'tipos_recurso',
          required: true,
          index: true,
        },
        {
          name: 'nucleo',
          label: 'Núcleo',
          type: 'relationship',
          relationTo: 'nucleos',
          required: true,
          index: true,
        },
      ],
    },
    {
      name: 'municipio',
      label: 'Municipio',
      type: 'relationship',
      relationTo: 'municipios',
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'Se deriva del núcleo.' },
    },
    coordinatesField(),
    {
      name: 'resumen',
      label: 'Resumen',
      type: 'textarea',
      localized: true,
      admin: { description: 'Respuesta de 2–3 frases bajo el título (answer-first).' },
    },
    {
      type: 'row',
      fields: [
        { name: 'horario_acceso', label: 'Horario y acceso', type: 'textarea', localized: true },
        { name: 'precio_entrada', label: 'Precio de entrada', type: 'text', localized: true },
      ],
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      localized: true,
      admin: { description: 'Sin ella, el recurso no existe en ese idioma.' },
    },
    { name: 'fotos', label: 'Fotos', type: 'upload', relationTo: 'media', hasMany: true },
    ...verificationFields,
  ],
  hooks: {
    beforeValidate: [rejectDemoInProduction('nombre')],
    beforeChange: [setMunicipioFromNucleo('nucleo')],
    afterChange: [...revalidate.afterChange, redirectOnUrlChange('recursos', { localizedSlug: true, hasEstado: true })],
    afterDelete: revalidate.afterDelete,
  },
}
