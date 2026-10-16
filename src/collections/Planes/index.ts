import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { faqsField } from '@/fields/faqs'
import { slugField } from '@/fields/slug'
import { requiredWhenPublished } from '@/fields/validation'
import { estadoField } from '@/fields/verification'
import { redirectOnUrlChange } from '@/hooks/redirects'
import { rejectDemoInProduction } from '@/hooks/rejectDemoInProduction'
import { revalidateCollection } from '@/hooks/revalidate'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('planes')

// Guías editoriales firmadas ("Fin de semana con niños"…)
export const Planes: CollectionConfig = {
  slug: 'planes',
  labels: { singular: 'Plan', plural: 'Planes' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'autor', 'estado', 'updatedAt'],
    group: adminGroups.editorial,
  },
  access: { read: publishedOrAuthenticated },
  fields: [
    { name: 'titulo', label: 'Título', type: 'text', localized: true, required: true },
    slugField({ from: 'titulo', localized: true }),
    {
      name: 'resumen',
      label: 'Resumen',
      type: 'textarea',
      localized: true,
      admin: { description: 'Respuesta de 2–3 frases bajo el título (answer-first).' },
    },
    { name: 'foto_portada', label: 'Foto de portada', type: 'upload', relationTo: 'media' },
    {
      name: 'cuerpo',
      label: 'Cuerpo',
      type: 'richText',
      localized: true,
      admin: { description: 'Sin él, el plan no existe en ese idioma.' },
    },
    {
      type: 'collapsible',
      label: 'Contenido enlazado',
      fields: [
        { name: 'rutas', label: 'Rutas', type: 'relationship', relationTo: 'rutas', hasMany: true },
        { name: 'negocios', label: 'Negocios', type: 'relationship', relationTo: 'negocios', hasMany: true },
        { name: 'recursos', label: 'Recursos', type: 'relationship', relationTo: 'recursos', hasMany: true },
      ],
    },
    faqsField(),
    {
      name: 'autor',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'autores',
      admin: { position: 'sidebar' },
      validate: requiredWhenPublished(),
    },
    estadoField,
  ],
  hooks: {
    beforeValidate: [rejectDemoInProduction('titulo')],
    afterChange: [...revalidate.afterChange, redirectOnUrlChange('planes', { localizedSlug: true, hasEstado: true })],
    afterDelete: revalidate.afterDelete,
  },
}
