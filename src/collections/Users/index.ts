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
  auth: true,
  fields: [],
}
