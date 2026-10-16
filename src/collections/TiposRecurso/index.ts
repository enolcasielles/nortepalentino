import type { CollectionConfig } from 'payload'

import { revalidateCollection } from '@/hooks/revalidate'
import { sightSchemaTypes } from '@/lib/taxonomies'

import { adminGroups } from '../groups'
import { taxonomyFields } from '../taxonomyFields'

export const TiposRecurso: CollectionConfig = {
  slug: 'tipos_recurso',
  labels: { singular: 'Tipo de recurso', plural: 'Tipos de recurso' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug', 'tipo_schema', 'color_token'],
    group: adminGroups.queVer,
  },
  access: { read: () => true },
  fields: taxonomyFields(sightSchemaTypes),
  hooks: revalidateCollection('tipos_recurso'),
}
