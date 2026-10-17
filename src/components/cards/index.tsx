import { Clock, MoveHorizontal, TrendingUp } from 'lucide-react'

import { DifficultyMark } from '@/components/content/DifficultyMark'
import { FamilyAttributes } from '@/components/content/FamilyAttributes'
import { imageOf } from '@/lib/data/media'
import type { Site } from '@/lib/data/site'
import { fill, formatDate, formatDuration, formatNumber, type Dictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { asColorToken } from '@/lib/ui/categoryColors'
import { readingMinutes } from '@/lib/richtext/lexical'
import type { Articulo, Municipio, Negocio, Recurso, Ruta } from '@/payload-types'

import { Card } from './Card'

type Common = { site: Site; dict: Dictionary; headingLevel?: 'h2' | 'h3' }

export function BusinessCard({ negocio, site, dict, headingLevel }: Common & { negocio: Negocio }) {
  const href = site.url.negocio(negocio)
  if (!href) return null
  const categoria = site.categoriaById.get(relId(negocio.categoria) ?? -1)
  const nucleo = site.nucleoById.get(relId(negocio.nucleo) ?? -1)
  return (
    <Card
      href={href}
      title={negocio.nombre}
      category={categoria?.nombre}
      place={nucleo?.nombre}
      color={asColorToken(categoria?.color_token)}
      icon={categoria?.icono}
      image={imageOf(site, negocio.fotos?.[0])}
      facts={negocio.precio_rango && <span aria-label={`${dict.facts.precio}: ${negocio.precio_rango}`}>{negocio.precio_rango}</span>}
      chips={<FamilyAttributes values={negocio.atributos_familia} dict={dict} compact />}
      headingLevel={headingLevel}
    />
  )
}

export function RouteCard({ ruta, site, dict, headingLevel }: Common & { ruta: Ruta }) {
  const href = site.url.ruta(ruta)
  if (!href) return null
  const nucleo = site.nucleoById.get(relId(ruta.inicio_nucleo) ?? -1)
  const { locale } = site
  const stats = [
    ruta.distancia_km != null && { icon: MoveHorizontal, label: dict.facts.distancia, text: `${formatNumber(ruta.distancia_km, locale)} km` },
    ruta.desnivel_m != null && { icon: TrendingUp, label: dict.facts.desnivel, text: `+${formatNumber(ruta.desnivel_m, locale, 0)} m` },
    ruta.duracion_h != null && { icon: Clock, label: dict.facts.duracion, text: formatDuration(ruta.duracion_h) },
  ].filter((s): s is { icon: typeof Clock; label: string; text: string } => Boolean(s))
  const chips = [ruta.apta_ninos && dict.facts.aptaNinos, ruta.apta_carrito && dict.facts.aptaCarrito].filter(
    (c): c is string => Boolean(c),
  )
  return (
    <Card
      href={href}
      title={ruta.nombre}
      place={nucleo?.nombre}
      color="rutas"
      icon="senda"
      image={imageOf(site, ruta.fotos?.[0])}
      badge={ruta.dificultad && <DifficultyMark difficulty={ruta.dificultad} label={dict.difficulty[ruta.dificultad]} />}
      facts={
        stats.length > 0 && (
          <dl className="flex flex-wrap gap-x-4 gap-y-1">
            {stats.map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex items-center gap-1.5">
                <dt className="text-text-muted">
                  <Icon aria-hidden="true" size={16} />
                  <span className="sr-only">{label}</span>
                </dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        )
      }
      chips={
        chips.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <li key={c} className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary">
                {c}
              </li>
            ))}
          </ul>
        )
      }
      headingLevel={headingLevel}
    />
  )
}

export function SightCard({ recurso, site, headingLevel }: Common & { recurso: Recurso }) {
  const href = site.url.recurso(recurso)
  if (!href) return null
  const tipo = site.tipoById.get(relId(recurso.tipo) ?? -1)
  const nucleo = site.nucleoById.get(relId(recurso.nucleo) ?? -1)
  return (
    <Card
      href={href}
      title={recurso.nombre}
      category={tipo?.nombre}
      place={nucleo?.nombre}
      color={asColorToken(tipo?.color_token)}
      icon={tipo?.icono}
      image={imageOf(site, recurso.fotos?.[0])}
      headingLevel={headingLevel}
    />
  )
}

export function MunicipioCard({ municipio, site, headingLevel }: Common & { municipio: Municipio }) {
  const href = site.url.municipio(municipio)
  if (!href) return null
  return (
    <Card
      href={href}
      title={municipio.nombre}
      place={municipio.comarca_zona}
      color="rutas"
      icon="cumbre"
      image={imageOf(site, municipio.foto_portada)}
      headingLevel={headingLevel}
    />
  )
}

export function ArticleCard({ articulo, site, dict, headingLevel }: Common & { articulo: Articulo }) {
  const href = site.url.articulo(articulo)
  if (!href) return null
  const date = articulo.fecha_publicacion ?? articulo.createdAt
  return (
    <Card
      href={href}
      title={articulo.titulo}
      category={dict.nav.blog}
      color="rutas"
      icon="articulo"
      image={imageOf(site, articulo.foto_portada)}
      facts={
        <p className="font-normal text-text-muted">
          <time dateTime={date.slice(0, 10)}>{formatDate(date, site.locale)}</time>
          {' · '}
          {fill(dict.content.readingTime, { n: readingMinutes(articulo.cuerpo) })}
        </p>
      }
      headingLevel={headingLevel}
    />
  )
}
