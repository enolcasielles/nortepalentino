import Image from 'next/image'
import type { ReactNode } from 'react'

import type { ImageData } from '@/lib/data/media'
import { categoryIcons, type CategoryIconKey } from '@/lib/icons'
import type { ColorToken } from '@/lib/taxonomies'
import { categoryPlate } from '@/lib/ui/categoryColors'

export type CardProps = {
  href: string
  title: string
  eyebrow?: string | null
  color: ColorToken
  icon?: string | null
  image?: ImageData | null
  facts?: ReactNode
  chips?: ReactNode
  headingLevel?: 'h2' | 'h3'
}

// Anatomía común (DESIGN.md §5): media → eyebrow → título → datos → chips.
// Toda la tarjeta es clicable con el pseudo-elemento del enlace del título.
export function Card({ href, title, eyebrow, color, icon, image, facts, chips, headingLevel = 'h3' }: CardProps) {
  const Heading = headingLevel
  const Icon = icon && icon in categoryIcons ? categoryIcons[icon as CategoryIconKey] : null
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-md border border-border bg-surface transition-shadow duration-150 hover:shadow-card">
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className={`flex h-14 items-center px-4 ${categoryPlate[color]}`} aria-hidden="true">
          {Icon && <Icon size={24} />}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.06em] text-text-muted uppercase">{eyebrow}</p>
        )}
        <Heading className="text-lg leading-snug">
          <a
            href={href}
            className="after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:outline-none group-focus-within:underline"
          >
            {title}
          </a>
        </Heading>
        {facts && <div className="text-sm text-text-muted tabular-nums">{facts}</div>}
        {chips && <div className="mt-auto pt-1">{chips}</div>}
      </div>
    </article>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
}
