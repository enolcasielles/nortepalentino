import type { CollectionConfig } from 'payload'

import { redirectOnCategoriaChange } from '@/hooks/redirects'
import { revalidateCollection } from '@/hooks/revalidate'
import { categoriaSlugCollision } from '@/hooks/slugCollisions'
import { businessSchemaTypes } from '@/lib/taxonomies'

import { adminGroups } from '../groups'
import { taxonomyFields } from '../taxonomyFields'

const revalidate = revalidateCollection('categorias_negocio')

export const CategoriasNegocio: CollectionConfig = {
  slug: 'categorias_negocio',
  labels: { singular: 'Categoría de negocio', plural: 'Categorías de negocio' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'slug', 'tipo_schema', 'color_token'],
    group: adminGroups.directorio,
  },
  access: { read: () => true },
  fields: taxonomyFields(businessSchemaTypes),
  hooks: {
    beforeValidate: [categoriaSlugCollision],
    afterChange: [...revalidate.afterChange, redirectOnCategoriaChange],
    afterDelete: revalidate.afterDelete,
  },
}
