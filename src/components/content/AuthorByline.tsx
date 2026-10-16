import Image from 'next/image'

import { imageOf } from '@/lib/data/media'
import type { Site } from '@/lib/data/site'
import { fill, formatDate, type Dictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import type { Autore } from '@/payload-types'

// Firma del contenido editorial. La página de autor llegará con su plantilla;
// hasta entonces el nombre no enlaza a ningún sitio.
export function AuthorByline({
  autor: ref,
  updatedAt,
  site,
  dict,
}: {
  autor: number | Autore | null | undefined
  updatedAt: string
  site: Site
  dict: Dictionary
}) {
  const autor = site.autorById.get(relId(ref) ?? -1)
  if (!autor) return null
  const photo = imageOf(site, autor.foto)
  return (
    <div className="flex items-center gap-3 text-sm">
      {photo ? (
        <Image
          src={photo.src}
          alt=""
          width={40}
          height={40}
          className="aspect-square size-10 rounded-full object-cover ring-2 ring-surface"
        />
      ) : (
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-primary-soft font-display font-bold text-primary">
          {autor.nombre.match(/\p{L}/u)?.[0]}
        </span>
      )}
      <p className="text-text-muted">
        {dict.content.by} <span className="font-medium text-text">{autor.nombre}</span>
        {' · '}
        <time dateTime={updatedAt.slice(0, 10)}>
          {fill(dict.content.updated, { date: formatDate(updatedAt, site.locale)! })}
        </time>
      </p>
    </div>
  )
}
