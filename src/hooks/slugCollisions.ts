import { ValidationError, type CollectionBeforeValidateHook } from 'payload'

import { locales } from '@/lib/i18n'

// /es/{municipio} y /es/{categoria} comparten nivel de URL, así que un
// municipio no puede usar el slug de una categoría (en ningún idioma) ni al
// revés (CLAUDE.md §5). Los slugs fijos se validan en fields/slug.ts.

export const municipioSlugCollision: CollectionBeforeValidateHook = async ({ data, req, collection }) => {
  const slug = data?.slug
  if (typeof slug !== 'string' || !slug) return data
  for (const locale of locales) {
    const { totalDocs } = await req.payload.count({
      collection: 'categorias_negocio',
      where: { slug: { equals: slug } },
      locale,
      req,
    })
    if (totalDocs > 0) {
      throw new ValidationError({
        collection: collection.slug,
        errors: [{ path: 'slug', message: `"${slug}" ya es el slug de una categoría (${locale}).` }],
      })
    }
  }
  return data
}

export const categoriaSlugCollision: CollectionBeforeValidateHook = async ({ data, req, collection }) => {
  const slug = data?.slug
  if (typeof slug !== 'string' || !slug) return data
  const { totalDocs } = await req.payload.count({
    collection: 'municipios',
    where: { slug: { equals: slug } },
    req,
  })
  if (totalDocs > 0) {
    throw new ValidationError({
      collection: collection.slug,
      errors: [{ path: 'slug', message: `"${slug}" ya es el slug de un municipio.` }],
    })
  }
  return data
}
