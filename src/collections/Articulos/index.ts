import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { publishedOrAuthenticated } from '@/access/publishedOrAuthenticated'
import { faqsField } from '@/fields/faqs'
import { slugField } from '@/fields/slug'
import { requiredWhenPublished } from '@/fields/validation'
import { estadoField } from '@/fields/verification'
import { redirectOnUrlChange } from '@/hooks/redirects'
import { rejectDemoInProduction } from '@/hooks/rejectDemoInProduction'
import { revalidateCollection } from '@/hooks/revalidate'
import { bodyRefs, linkableCollections, uniqueDocs, type LexicalValue } from '@/lib/richtext/lexical'

import { adminGroups } from '../groups'
import { articleEditor } from './editor'

const revalidate = revalidateCollection('articulos')

// Lo enlazado se deriva del cuerpo del idioma que se guarda: nunca se
// desincroniza del texto. Alimenta "Sitios de este artículo" y los enlaces de
// vuelta desde las fichas ("Lo contamos en el blog").
const deriveLinks: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const cuerpo = (data.cuerpo !== undefined ? data.cuerpo : originalDoc?.cuerpo) as LexicalValue
  data.enlaces = uniqueDocs(bodyRefs(cuerpo))
    .filter((r) => !(r.relationTo === 'articulos' && r.id === originalDoc?.id))
    .map((r) => ({ relationTo: r.relationTo, value: r.id }))
  return data
}

// La fecha de publicación se fija sola la primera vez que se publica
const setPublishDate: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const estado = data.estado ?? originalDoc?.estado
  if (estado === 'publicado' && !data.fecha_publicacion && !originalDoc?.fecha_publicacion) {
    data.fecha_publicacion = new Date().toISOString()
  }
  return data
}

// Blog: artículos para atraer tráfico de búsqueda que enlazan el directorio
// (CLAUDE.md §6). Cada uno apunta a una búsqueda concreta.
export const Articulos: CollectionConfig = {
  slug: 'articulos',
  labels: { singular: 'Artículo', plural: 'Artículos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'busqueda_objetivo', 'autor', 'estado', 'updatedAt'],
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
      admin: { description: 'Respuesta de 2–3 frases bajo el título (answer-first). También es la descripción por defecto.' },
    },
    { name: 'foto_portada', label: 'Foto de portada', type: 'upload', relationTo: 'media' },
    {
      name: 'cuerpo',
      label: 'Cuerpo',
      type: 'richText',
      localized: true,
      editor: articleEditor,
      admin: {
        description:
          'Sin él, el artículo no existe en ese idioma. Enlaza el directorio con enlaces internos (no pegues URLs de la web) y usa el bloque "Ficha del directorio" para incrustar una tarjeta.',
      },
    },
    faqsField(),
    {
      type: 'collapsible',
      label: 'SEO',
      fields: [
        {
          name: 'revision_seo',
          type: 'ui',
          admin: { components: { Field: '/components/admin/ArticleAudit#ArticleAudit' } },
        },
        {
          name: 'busqueda_objetivo',
          label: 'Búsqueda objetivo',
          type: 'text',
          localized: true,
          admin: { description: 'La búsqueda de Google a la que responde el artículo ("rutas con niños en la montaña palentina").' },
        },
        {
          name: 'busquedas_secundarias',
          label: 'Búsquedas secundarias',
          type: 'text',
          hasMany: true,
          localized: true,
          admin: { description: 'Variantes y preguntas relacionadas que el texto también cubre.' },
        },
        {
          name: 'seo_titulo',
          label: 'Título SEO',
          type: 'text',
          localized: true,
          admin: { description: 'Opcional. Máximo unos 60 caracteres; vacío: el título.' },
        },
        {
          name: 'seo_descripcion',
          label: 'Descripción SEO',
          type: 'textarea',
          localized: true,
          admin: { description: 'Opcional. 120–160 caracteres; vacío: el resumen.' },
        },
      ],
    },
    {
      name: 'autor',
      label: 'Autor',
      type: 'relationship',
      relationTo: 'autores',
      admin: { position: 'sidebar' },
      validate: requiredWhenPublished(),
    },
    {
      name: 'fecha_publicacion',
      label: 'Fecha de publicación',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
        description: 'Se fija sola al publicar por primera vez.',
      },
    },
    estadoField,
    {
      name: 'enlaces',
      label: 'Enlazado desde el cuerpo',
      type: 'relationship',
      relationTo: [...linkableCollections],
      hasMany: true,
      localized: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Se calcula del cuerpo al guardar.',
      },
    },
  ],
  hooks: {
    beforeValidate: [rejectDemoInProduction('titulo')],
    beforeChange: [deriveLinks, setPublishDate],
    afterChange: [...revalidate.afterChange, redirectOnUrlChange('articulos', { localizedSlug: true, hasEstado: true })],
    afterDelete: revalidate.afterDelete,
  },
}
