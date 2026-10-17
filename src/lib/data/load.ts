import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload, type CollectionSlug } from 'payload'

import { cacheTags } from '@/lib/cache/tags'
import type { Locale } from '@/lib/i18n'
import type {
  ArchivosGpx,
  Articulo,
  Autore,
  CategoriasNegocio,
  Landing,
  Media,
  Municipio,
  Negocio,
  Nucleo,
  Recurso,
  Redirect,
  Ruta,
  TiposRecurso,
} from '@/payload-types'

export const getPayloadClient = () => getPayload({ config })

type CollectionData = {
  municipios: Municipio
  nucleos: Nucleo
  categorias_negocio: CategoriasNegocio
  tipos_recurso: TiposRecurso
  negocios: Negocio
  recursos: Recurso
  rutas: Ruta
  landings: Landing
  autores: Autore
  media: Media
  articulos: Articulo
}

export type LoadableCollection = keyof CollectionData

// Colecciones con `estado`: al frontend solo llega lo publicado (CLAUDE.md §1.3)
const withEstado: LoadableCollection[] = ['negocios', 'recursos', 'rutas', 'articulos']

// Toda la colección en un idioma, cacheada con el tag de la colección. El
// volumen del sitio (cientos de fichas) hace esto más simple y rápido que una
// consulta por página; los hooks de Payload invalidan el tag al editar.
export function loadCollection<C extends LoadableCollection>(
  collection: C,
  locale: Locale,
): Promise<CollectionData[C][]> {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: collection as CollectionSlug,
        locale,
        depth: 0,
        pagination: false,
        overrideAccess: true,
        where: withEstado.includes(collection) ? { estado: { equals: 'publicado' } } : undefined,
      })
      return result.docs as unknown as CollectionData[C][]
    },
    ['collection', collection, locale],
    { tags: [cacheTags.collection(collection)] },
  )()
}

// Polyline y bbox de un GPX (solo se piden para mapas y descargas)
export function loadGpx(id: number): Promise<ArchivosGpx | null> {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findByID({ collection: 'archivos_gpx', id, depth: 0, overrideAccess: true }).catch(() => null)
    },
    ['gpx', String(id)],
    { tags: [cacheTags.collection('archivos_gpx'), cacheTags.doc('archivos_gpx', id)] },
  )()
}

export function loadRedirects(): Promise<Pick<Redirect, 'desde' | 'hacia' | 'tipo'>[]> {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'redirects',
        depth: 0,
        pagination: false,
        overrideAccess: true,
        select: { desde: true, hacia: true, tipo: true },
      })
      return result.docs.map(({ desde, hacia, tipo }) => ({ desde, hacia, tipo }))
    },
    ['redirects'],
    { tags: [cacheTags.redirects] },
  )()
}
