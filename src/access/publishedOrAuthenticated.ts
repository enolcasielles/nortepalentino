import type { Access } from 'payload'

// La API pública solo expone lo publicado; los borradores, solo con sesión
// (CLAUDE.md §1.3). Las plantillas filtran también por `estado` explícitamente.
export const publishedOrAuthenticated: Access = ({ req: { user } }) =>
  user ? true : { estado: { equals: 'publicado' } }
