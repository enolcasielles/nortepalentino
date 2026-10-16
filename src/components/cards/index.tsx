import { DifficultyMark } from '@/components/content/DifficultyMark'
import { FamilyAttributes } from '@/components/content/FamilyAttributes'
import { imageOf } from '@/lib/data/media'
import type { Site } from '@/lib/data/site'
import { formatDuration, formatNumber, type Dictionary } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { asColorToken } from '@/lib/ui/categoryColors'
import type { Municipio, Negocio, Recurso, Ruta } from '@/payload-types'

import { Card } from './Card'

type Common = { site: Site; dict: Dictionary; headingLevel?: 'h2' | 'h3' }

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ')

export function BusinessCard({ negocio, site, dict, headingLevel }: Common & { negocio: Negocio }) {
  const href = site.url.negocio(negocio)
  if (!href) return null
  const categoria = site.categoriaById.get(relId(negocio.categoria) ?? -1)
  const nucleo = site.nucleoById.get(relId(negocio.nucleo) ?? -1)
  return (
    <Card
      href={href}
      title={negocio.nombre}
      eyebrow={join(categoria?.nombre, nucleo?.nombre)}
      color={asColorToken(categoria?.color_token)}
      icon={categoria?.icono}
      image={imageOf(site, negocio.fotos?.[0])}
      facts={negocio.precio_rango}
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
  const stats = join(
    ruta.distancia_km != null ? `${formatNumber(ruta.distancia_km, locale)} km` : null,
    ruta.desnivel_m != null ? `+${formatNumber(ruta.desnivel_m, locale, 0)} m` : null,
    ruta.duracion_h != null ? formatDuration(ruta.duracion_h) : null,
  )
  const chips = [ruta.apta_ninos && dict.facts.aptaNinos, ruta.apta_carrito && dict.facts.aptaCarrito].filter(
    (c): c is string => Boolean(c),
  )
  return (
    <Card
      href={href}
      title={ruta.nombre}
      eyebrow={nucleo?.nombre}
      color="rutas"
      icon="senda"
      image={imageOf(site, ruta.fotos?.[0])}
      facts={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{stats}</span>
          {ruta.dificultad && <DifficultyMark difficulty={ruta.dificultad} label={dict.difficulty[ruta.dificultad]} />}
        </span>
      }
      chips={
        chips.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <li key={c} className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
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
      eyebrow={join(tipo?.nombre, nucleo?.nombre)}
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
      eyebrow={municipio.comarca_zona}
      color="rutas"
      icon="lugar"
      image={imageOf(site, municipio.foto_portada)}
      headingLevel={headingLevel}
    />
  )
}
