import type { CollectionConfig } from 'payload'

import { adminGroups } from '../groups'

// Resultado de la comprobación semanal de enlaces de las fichas publicadas
// (lib/maintenance/links.ts). Va aparte de las fichas para no tocar su
// `updatedAt` ni revalidar sus páginas. Solo la escribe el cron.
export const ComprobacionesEnlaces: CollectionConfig = {
  slug: 'comprobaciones_enlaces',
  labels: { singular: 'Comprobación de enlace', plural: 'Comprobaciones de enlaces' },
  admin: {
    useAsTitle: 'url',
    defaultColumns: ['nombre', 'campo', 'estado', 'fallos_seguidos', 'ultima_comprobacion'],
    group: adminGroups.sistema,
    description: 'Se actualiza sola cada semana. Un enlace se da por caído tras 2 fallos seguidos.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  defaultSort: '-fallos_seguidos',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'coleccion',
          label: 'Colección',
          type: 'select',
          required: true,
          index: true,
          options: ['negocios', 'rutas', 'recursos'],
        },
        { name: 'documento', label: 'Id del documento', type: 'number', required: true, index: true },
        { name: 'campo', label: 'Campo', type: 'select', required: true, options: ['fuente_url', 'web'] },
      ],
    },
    { name: 'nombre', label: 'Nombre', type: 'text' },
    { name: 'url', label: 'URL', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'estado',
          label: 'Estado',
          type: 'select',
          required: true,
          index: true,
          options: [
            { value: 'ok', label: 'Responde' },
            { value: 'bloqueado', label: 'No deja comprobar (401/403/429)' },
            { value: 'error', label: 'Error' },
          ],
        },
        { name: 'codigo', label: 'Código HTTP', type: 'number' },
        { name: 'fallos_seguidos', label: 'Fallos seguidos', type: 'number', defaultValue: 0 },
      ],
    },
    { name: 'detalle', label: 'Detalle del error', type: 'text' },
    {
      type: 'row',
      fields: [
        { name: 'primer_fallo', label: 'Primer fallo', type: 'date' },
        { name: 'ultima_comprobacion', label: 'Última comprobación', type: 'date', required: true },
      ],
    },
  ],
}
