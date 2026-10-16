import type { ArrayField } from 'payload'

// FAQs reutilizables (CLAUDE.md §6). Pregunta y respuesta se traducen por
// separado; en cada idioma solo se publican los pares completos. Cada
// respuesta debe entenderse sola, sin depender del resto de la página.
export function faqsField(): ArrayField {
  return {
    name: 'faqs',
    label: 'Preguntas frecuentes',
    labels: { singular: 'Pregunta', plural: 'Preguntas' },
    type: 'array',
    fields: [
      { name: 'pregunta', label: 'Pregunta', type: 'text', localized: true },
      { name: 'respuesta', label: 'Respuesta', type: 'textarea', localized: true },
    ],
  }
}
