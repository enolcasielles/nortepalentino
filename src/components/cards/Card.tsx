import { MapPin, type LucideProps } from 'lucide-react'
import Image from 'next/image'
import { createElement, type ReactNode } from 'react'

import type { ImageData } from '@/lib/data/media'
import { categoryIcons, type CategoryIconKey } from '@/lib/icons'
import type { ColorToken } from '@/lib/taxonomies'
import { categoryIconColor, categoryMedia, categoryPlate, contourOffset } from '@/lib/ui/categoryColors'

export type CardProps = {
  href: string
  title: string
  // Etiqueta de categoría en la píldora sobre la media
  category?: string | null
  // Sustituye el contenido de la píldora (p. ej. la baliza de dificultad)
  badge?: ReactNode
  // Núcleo o zona, con icono de ubicación bajo el título
  place?: string | null
  color: ColorToken
  icon?: string | null
  image?: ImageData | null
  facts?: ReactNode
  chips?: ReactNode
  headingLevel?: 'h2' | 'h3'
}

export function categoryIcon(icon: string | null | undefined) {
  return icon && icon in categoryIcons ? categoryIcons[icon as CategoryIconKey] : null
}

// Icono de categoría o tipo por su clave; nada si la clave no existe
export function CategoryIcon({ icon, ...props }: { icon: string | null | undefined } & LucideProps) {
  const component = categoryIcon(icon)
  return component ? createElement(component, { 'aria-hidden': true, ...props }) : null
}

// Anatomía común (DESIGN.md §5): media con píldora de categoría → título →
// lugar → datos → chips. Toda la tarjeta es clicable con el pseudo-elemento
// del enlace del título.
export function Card({ href, title, category, badge, place, color, icon, image, facts, chips, headingLevel = 'h3' }: CardProps) {
  const Heading = headingLevel
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-surface shadow-card ring-1 ring-border transition duration-200 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/10] overflow-hidden">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <MediaPlaceholder color={color} seed={title}>
            {categoryIcon(icon) && <CategoryIcon icon={icon} size={30} strokeWidth={1.75} />}
          </MediaPlaceholder>
        )}
        {(badge || category) && (
          <span className="absolute top-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-text shadow-card backdrop-blur-sm">
            {badge ?? (
              <>
                <CategoryIcon icon={icon} size={14} className={`shrink-0 ${categoryIconColor[color]}`} />
                <span className="truncate">{category}</span>
              </>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 pb-5">
        <Heading className="text-xl leading-tight">
          <a
            href={href}
            className="after:absolute after:inset-0 after:content-[''] group-hover:text-primary focus-visible:outline-none group-focus-within:underline"
          >
            {title}
          </a>
        </Heading>
        {place && (
          <p className="flex items-center gap-1 text-sm text-text-muted">
            <MapPin aria-hidden="true" size={14} className="shrink-0" />
            {place}
          </p>
        )}
        {facts && <div className="text-sm font-medium text-text tabular-nums">{facts}</div>}
        {chips && <div className="mt-auto pt-2">{chips}</div>}
      </div>
    </article>
  )
}

// Sin foto (DESIGN.md §4): tinte de la categoría, curvas de nivel y el icono
// en una placa. Decorativo.
export function MediaPlaceholder({ color, seed, children }: { color: ColorToken; seed: string; children?: ReactNode }) {
  return (
    <div aria-hidden="true" className={`relative grid size-full place-items-center ${categoryMedia[color]}`}>
      <div className="contours absolute inset-0 opacity-25" style={{ maskPosition: contourOffset(seed) }} />
      {children && (
        <span
          className={`relative grid size-16 place-items-center rounded-lg shadow-card transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100 ${categoryPlate[color]}`}
        >
          {children}
        </span>
      )}
    </div>
  )
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
}
