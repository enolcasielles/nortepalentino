// Tags de caché compartidos entre consultas de datos y hooks de revalidación
// (CLAUDE.md §6). Las consultas de un listado usan el tag de colección; las de
// una ficha, el de documento.
export const cacheTags = {
  collection: (slug: string) => `col:${slug}`,
  doc: (slug: string, id: string | number) => `doc:${slug}:${id}`,
  sitemap: 'sitemap',
  llms: 'llms',
  redirects: 'redirects',
}
