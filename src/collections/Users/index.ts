import type { CollectionConfig } from 'payload'

// Personas con acceso al panel. No confundir con `autores` (firmas públicas).
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [],
}
