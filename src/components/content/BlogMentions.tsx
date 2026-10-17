import { ArticleCard } from '@/components/cards'
import { CardGrid } from '@/components/cards/Card'
import type { Site } from '@/lib/data/site'
import type { Dictionary } from '@/lib/i18n'
import type { LinkableCollection } from '@/lib/richtext/lexical'

import { Section } from './Section'

const MAX = 3

// Enlaces de vuelta del directorio al blog: artículos que enlazan esta página
// (DESIGN.md §5). El enlazado interno funciona en las dos direcciones.
export function BlogMentions({
  relationTo,
  id,
  site,
  dict,
}: {
  relationTo: LinkableCollection
  id: number
  site: Site
  dict: Dictionary
}) {
  const articulos = site.articulosAbout(relationTo, id).slice(0, MAX)
  if (!articulos.length) return null
  return (
    <Section
      id="en-el-blog"
      title={dict.content.inTheBlog}
      more={site.articulosListing() ? { href: site.url.articulosListing(), label: dict.sections.seeAll } : null}
    >
      <CardGrid>
        {articulos.map((a) => (
          <li key={a.id}>
            <ArticleCard articulo={a} site={site} dict={dict} />
          </li>
        ))}
      </CardGrid>
    </Section>
  )
}
