import type { CollectionConfig } from 'payload'

import { adminGroups } from '../groups'

// Personas con acceso al panel. No confundir con `autores` (firmas públicas).
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'email',
    group: adminGroups.sistema,
  },
  // API key por usuario: la usa la extensión de Claude Desktop (cms-mcp/)
  auth: { useAPIKey: true },
  fields: [],
}
