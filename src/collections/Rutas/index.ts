import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { coordinatesField } from '@/fields/coordinates'
import { faqsField } from '@/fields/faqs'
import { localizedOptions } from '@/fields/options'
import { slugField } from '@/fields/slug'
import { positiveNumberWhenPublished, requiredWhenPublished } from '@/fields/validation'
import { verificationFields } from '@/fields/verification'
import { redirectOnUrlChange } from '@/hooks/redirects'
import { rejectDemoInProduction } from '@/hooks/rejectDemoInProduction'
import { revalidateCollection } from '@/hooks/revalidate'
import { setMunicipioFromNucleo } from '@/hooks/setMunicipioFromNucleo'
import { difficulties, seasons } from '@/lib/taxonomies'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('rutas')

export const Rutas: CollectionConfig = {
  slug: 'rutas',
  labels: { singular: 'Ruta', plural: 'Rutas' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'inicio_nucleo', 'dificultad', 'distancia_km', 'estado'],
    group: adminGroups.rutas,
  },
  access: { read: publishedOrAuthenticated },
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', localized: true, required: true },
    slugField({ from: 'nombre', localized: true }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Datos clave',
          description: 'Valores verificados, nunca estimados. Si falta alguno, la ruta no se puede publicar.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'distancia_km',
                  label: 'Distancia (km)',
                  type: 'number',
                  validate: positiveNumberWhenPublished(),
                },
                {
                  name: 'desnivel_m',
                  label: 'Desnivel positivo (m)',
                  type: 'number',
                  validate: requiredWhenPublished(),
                },
                {
                  name: 'duracion_h',
                  label: 'Duración (h)',
                  type: 'number',
                  validate: positiveNumberWhenPublished(),
                },
              ],
            },
            {
              name: 'dificultad',
              label: 'Dificultad',
              type: 'select',
              options: localizedOptions(difficulties, 'difficulty'),
              validate: requiredWhenPublished(),
            },
            {
              type: 'row',
              fields: [
                { name: 'circular', label: 'Circular', type: 'checkbox', defaultValue: false },
                { name: 'apta_ninos', label: 'Apta para niños', type: 'checkbox', defaultValue: false },
                { name: 'apta_carrito', label: 'Apta para carrito', type: 'checkbox', defaultValue: false },
              ],
            },
            {
              name: 'temporada',
              label: 'Temporada recomendada',
              type: 'select',
              hasMany: true,
              options: localizedOptions(seasons, 'season'),
            },
            {
              name: 'inicio_nucleo',
              label: 'Núcleo de inicio',
              type: 'relationship',
              relationTo: 'nucleos',
              required: true,
              index: true,
            },
            coordinatesField({
              name: 'inicio_coordenadas',
              label: 'Coordenadas del punto de inicio',
              required: false,
            }),
            {
              name: 'gpx',
              label: 'Track GPX',
              type: 'upload',
              relationTo: 'archivos_gpx',
            },
          ],
        },
        {
          label: 'Textos',
          fields: [
            {
              name: 'resumen',
              label: 'Resumen',
              type: 'textarea',
              localized: true,
              admin: { description: 'Respuesta de 2–3 frases bajo el título (answer-first).' },
            },
            {
              name: 'premio_final',
              label: 'Premio final',
              type: 'textarea',
              localized: true,
              admin: { description: 'Qué hay al llegar: el gancho familiar.' },
            },
            {
              name: 'descripcion',
              label: 'Descripción',
              type: 'textarea',
              localized: true,
              admin: { description: 'Sin ella, la ruta no existe en ese idioma.' },
            },
            {
              name: 'experiencia_propia',
              label: 'Experiencia propia',
              type: 'textarea',
              localized: true,
            },
            faqsField(),
          ],
        },
        {
          label: 'Fotos',
          fields: [{ name: 'fotos', label: 'Fotos', type: 'upload', relationTo: 'media', hasMany: true }],
        },
      ],
    },
    {
      name: 'municipio',
      label: 'Municipio',
      type: 'relationship',
      relationTo: 'municipios',
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'Se deriva del núcleo de inicio.' },
    },
    {
      name: 'autor',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'autores',
      admin: { position: 'sidebar' },
    },
    ...verificationFields,
  ],
  hooks: {
    beforeValidate: [rejectDemoInProduction('nombre')],
    beforeChange: [setMunicipioFromNucleo('inicio_nucleo')],
    afterChange: [...revalidate.afterChange, redirectOnUrlChange('rutas', { localizedSlug: true, hasEstado: true })],
    afterDelete: revalidate.afterDelete,
  },
}
