import type { CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { coordinatesField } from '@/fields/coordinates'
import { localizedOptions, plainOptions } from '@/fields/options'
import { slugField } from '@/fields/slug'
import { verificationFields } from '@/fields/verification'
import { redirectOnUrlChange } from '@/hooks/redirects'
import { rejectDemoInProduction } from '@/hooks/rejectDemoInProduction'
import { revalidateCollection } from '@/hooks/revalidate'
import { setMunicipioFromNucleo } from '@/hooks/setMunicipioFromNucleo'
import { familyAttributes, priceRanges } from '@/lib/taxonomies'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('negocios')

// Un negocio vende un servicio: comer, dormir, actividad guiada, tienda (CLAUDE.md §6)
export const Negocios: CollectionConfig = {
  slug: 'negocios',
  labels: { singular: 'Negocio', plural: 'Negocios' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'categoria', 'municipio', 'estado', 'fecha_verificacion'],
    group: adminGroups.directorio,
  },
  access: { read: publishedOrAuthenticated },
  defaultSort: 'nombre',
  fields: [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    slugField({ from: 'nombre' }),
    {
      type: 'row',
      fields: [
        {
          name: 'categoria',
          label: 'Categoría',
          type: 'relationship',
          relationTo: 'categorias_negocio',
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
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      localized: true,
      admin: { description: 'Redacción propia. Sin ella, la ficha no existe en ese idioma.' },
    },
    { name: 'direccion', label: 'Dirección', type: 'text' },
    coordinatesField(),
    {
      type: 'row',
      fields: [
        {
          name: 'telefono',
          label: 'Teléfono',
          type: 'text',
          validate: (value: string | null | undefined) =>
            !value || /^\+?[0-9 ]{9,}$/.test(value) ? true : 'Formato: +34 979 000 000',
        },
        { name: 'email', label: 'Email', type: 'email' },
      ],
    },
    {
      name: 'web',
      label: 'Web',
      type: 'text',
      validate: (value: string | null | undefined) =>
        !value || /^https?:\/\/\S+$/.test(value) ? true : 'Debe ser una URL completa (https://…).',
    },
    {
      type: 'row',
      fields: [
        { name: 'horario_texto', label: 'Horario', type: 'textarea', localized: true },
        { name: 'precio_rango', label: 'Rango de precio', type: 'select', options: plainOptions(priceRanges) },
      ],
    },
    {
      name: 'atributos_familia',
      label: 'Atributos de familia',
      type: 'select',
      hasMany: true,
      options: localizedOptions(familyAttributes, 'familyAttributes'),
    },
    { name: 'fotos', label: 'Fotos', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'orden',
      label: 'Orden manual',
      type: 'number',
      admin: { position: 'sidebar', description: 'Menor primero. Vacío: orden alfabético.' },
    },
    {
      name: 'destacado',
      label: 'Destacado (fase 2)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', readOnly: true, description: 'Sin efecto en la fase 1.' },
    },
    ...verificationFields,
  ],
  hooks: {
    beforeValidate: [rejectDemoInProduction('nombre')],
    beforeChange: [setMunicipioFromNucleo('nucleo')],
    afterChange: [...revalidate.afterChange, redirectOnUrlChange('negocios', { localizedSlug: false, hasEstado: true })],
    afterDelete: revalidate.afterDelete,
  },
}
