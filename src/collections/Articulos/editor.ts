import { BlocksFeature, lexicalEditor, LinkFeature } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

import { embeddableCollections, linkableCollections } from '@/lib/richtext/lexical'

// Tarjeta de una ficha del directorio incrustada en el texto ("Dónde comer
// después de la ruta"). Se pinta con la tarjeta de su tipo; si la ficha no
// existe en ese idioma, no se pinta nada.
export const FichaBlock: Block = {
  slug: 'ficha',
  interfaceName: 'FichaBlock',
  labels: { singular: 'Ficha del directorio', plural: 'Fichas del directorio' },
  fields: [
    {
      name: 'ficha',
      label: 'Ficha',
      type: 'relationship',
      relationTo: [...embeddableCollections],
      required: true,
    },
  ],
}

// Sin los nodos de relación genéricos: para enlazar el directorio están los
// enlaces internos y el bloque de ficha
const REMOVED = new Set(['link', 'relationship', 'checklist', 'inlineCode', 'superscript', 'subscript'])

// Editor del cuerpo de los artículos: enlaces internos a documentos (no a
// URLs), que se resuelven con lib/routes al renderizar y sobreviven a un
// cambio de slug (CLAUDE.md §6).
export const articleEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => !REMOVED.has(feature.key)),
    LinkFeature({
      enabledCollections: [...linkableCollections],
      maxDepth: 0,
    }),
    BlocksFeature({ blocks: [FichaBlock] }),
  ],
})
