import type { PayloadRequest } from 'payload'

import type { Locale } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { withLocale } from '@/lib/payload/withLocale'

import { paths } from './index'

export type RoutableCollection = 'municipios' | 'negocios' | 'rutas' | 'recursos' | 'articulos' | 'autores'

type DocLike = Record<string, unknown>

const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null)

// Ruta pública de un documento en un idioma, o null si no tiene URL en él.
// No comprueba indexabilidad (§7.4): solo construye la URL a partir de slugs.
export async function resolveDocPath(
  collection: RoutableCollection,
  doc: DocLike,
  locale: Locale,
  req: PayloadRequest,
): Promise<string | null> {
  const slug = str(doc.slug)
  if (!slug) return null

  switch (collection) {
    case 'municipios':
      return paths.municipio(locale, slug)
    case 'rutas':
      return paths.ruta(locale, slug)
    case 'recursos':
      return paths.recurso(locale, slug)
    case 'articulos':
      return paths.articulo(locale, slug)
    case 'autores':
      return paths.autor(locale, slug)
    case 'negocios': {
      const municipioId = relId(doc.municipio)
      const categoriaId = relId(doc.categoria)
      if (!municipioId || !categoriaId) return null
      // Secuencial: las consultas comparten la transacción de `req`
      const municipio = await req.payload.findByID({ collection: 'municipios', id: municipioId, depth: 0, req })
      const categoria = await withLocale(req, () =>
        req.payload.findByID({ collection: 'categorias_negocio', id: categoriaId, depth: 0, locale, req }),
      )
      const categoriaSlug = str(categoria?.slug)
      if (!municipio?.slug || !categoriaSlug) return null
      return paths.negocio(locale, municipio.slug, categoriaSlug, slug)
    }
  }
}
