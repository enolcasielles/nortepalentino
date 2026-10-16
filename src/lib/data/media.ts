import type { Media } from '@/payload-types'

import type { Site } from './site'

export type ImageData = {
  src: string
  alt: string
  width: number
  height: number
  credit: string | null
}

// Imagen lista para next/image. Sin alt en el idioma no se usa: el alt es
// obligatorio (DESIGN.md §4) y nunca se rellena con el nombre del archivo.
export function imageOf(site: Site, ref: number | Media | null | undefined): ImageData | null {
  const id = typeof ref === 'object' && ref ? ref.id : ref
  if (!id) return null
  const media = site.mediaById.get(id)
  if (!media?.url || !media.width || !media.height || !media.alt) return null
  return {
    src: media.url,
    alt: media.alt,
    width: media.width,
    height: media.height,
    credit: !media.es_propia && media.credito ? media.credito : null,
  }
}
