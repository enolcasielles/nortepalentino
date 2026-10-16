import {
  ValidationError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type CollectionConfig,
  type Where,
} from 'payload'

import { faqsField } from '@/fields/faqs'
import { revalidateCollection } from '@/hooks/revalidate'
import { filterSlugs } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { withLocale } from '@/lib/payload/withLocale'

import { adminGroups } from '../groups'

const revalidate = revalidateCollection('landings')

const filterOptions = Object.values(filterSlugs).map((f) => ({ value: f.es, label: `${f.es} / ${f.en}` }))

// Combinaciones con URL propia (CLAUDE.md §5):
//   negocios: categoría [+ municipio [+ filtro]]
//   rutas:    [filtro]          → /rutas, /rutas/con-ninos
//   recursos: (nada)            → /que-ver
const normalizeAndValidate: CollectionBeforeValidateHook = async ({ data, originalDoc, req, collection }) => {
  if (!data) return data
  const merged = { ...originalDoc, ...data }
  const fail = (path: string, message: string): never => {
    throw new ValidationError({ collection: collection.slug, errors: [{ path, message }] })
  }

  if (merged.ambito !== 'negocios') {
    data.municipio = null
    data.categoria = null
  }
  if (merged.ambito === 'recursos') data.filtro = null

  const municipio = relId(data.municipio ?? merged.municipio)
  const categoria = relId(data.categoria ?? merged.categoria)
  const filtro = (data.filtro ?? merged.filtro) || null

  if (merged.ambito === 'negocios') {
    if (!categoria) fail('categoria', 'Un listado de negocios necesita categoría.')
    if (filtro && !municipio) fail('filtro', 'Los filtros de negocios solo existen dentro de un municipio.')
  }

  const where: Where = {
    and: [
      { ambito: { equals: merged.ambito } },
      municipio ? { municipio: { equals: municipio } } : { municipio: { exists: false } },
      categoria ? { categoria: { equals: categoria } } : { categoria: { exists: false } },
      filtro ? { filtro: { equals: filtro } } : { filtro: { exists: false } },
      ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
    ],
  }
  const { totalDocs } = await req.payload.count({ collection: 'landings', where, req })
  if (totalDocs > 0) fail('ambito', 'Ya existe una landing para esta combinación.')

  return data
}

// Nombre legible en el panel: "negocios · cervera-de-pisuerga · restaurantes · con-ninos"
const setInternalName: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const merged = { ...originalDoc, ...data }
  const parts: string[] = [merged.ambito]
  const municipioId = relId(merged.municipio)
  const categoriaId = relId(merged.categoria)
  if (municipioId) {
    const m = await req.payload.findByID({ collection: 'municipios', id: municipioId, depth: 0, req })
    parts.push(m.slug)
  }
  if (categoriaId) {
    const c = await withLocale(req, () =>
      req.payload.findByID({ collection: 'categorias_negocio', id: categoriaId, depth: 0, locale: 'es', req }),
    )
    parts.push(c.slug)
  }
  if (merged.filtro) parts.push(merged.filtro)
  data.nombre_interno = parts.join(' · ')
  return data
}

// Intro y FAQs de un listado. Sin landing con intro en un idioma, el listado
// no existe en ese idioma (CLAUDE.md §7.4).
export const Landings: CollectionConfig = {
  slug: 'landings',
  labels: { singular: 'Landing', plural: 'Landings' },
  admin: {
    useAsTitle: 'nombre_interno',
    defaultColumns: ['nombre_interno', 'autor', 'updatedAt'],
    group: adminGroups.editorial,
  },
  access: { read: () => true },
  fields: [
    {
      name: 'ambito',
      label: 'Listado de',
      type: 'select',
      required: true,
      index: true,
      options: [
        { value: 'negocios', label: 'Negocios' },
        { value: 'rutas', label: 'Rutas' },
        { value: 'recursos', label: 'Qué ver' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'categoria',
          label: 'Categoría',
          type: 'relationship',
          relationTo: 'categorias_negocio',
          index: true,
          admin: { condition: (data) => data?.ambito === 'negocios' },
        },
        {
          name: 'municipio',
          label: 'Municipio',
          type: 'relationship',
          relationTo: 'municipios',
          index: true,
          admin: {
            condition: (data) => data?.ambito === 'negocios',
            description: 'Vacío: listado de toda la comarca.',
          },
        },
        {
          name: 'filtro',
          label: 'Filtro',
          type: 'select',
          options: filterOptions,
          admin: { condition: (data) => data?.ambito !== 'recursos' },
        },
      ],
    },
    {
      name: 'titulo',
      label: 'Título (opcional)',
      type: 'text',
      localized: true,
      admin: { description: 'Vacío: se genera de la plantilla ("Restaurantes en Cervera de Pisuerga").' },
    },
    {
      name: 'intro',
      label: 'Introducción',
      type: 'textarea',
      localized: true,
      admin: { description: 'Respuesta answer-first. Sin ella, el listado no existe en ese idioma.' },
    },
    faqsField(),
    {
      name: 'autor',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'autores',
      admin: { position: 'sidebar' },
    },
    {
      name: 'nombre_interno',
      label: 'Nombre interno',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [normalizeAndValidate],
    beforeChange: [setInternalName],
    ...revalidate,
  },
}
