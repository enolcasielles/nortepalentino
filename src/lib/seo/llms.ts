import { completeFaqs } from '@/components/content/FaqList'
import { negociosListingTitle } from '@/components/templates/NegociosListingTemplate'
import { getSites, type Site } from '@/lib/data/site'
import { formatDuration, getDictionary, isoDate, locales } from '@/lib/i18n'
import { relId } from '@/lib/payload/relations'
import { absoluteUrl, homePath } from '@/lib/routes'
import { siteInventory } from '@/lib/routes/inventory'

// /llms.txt y /llms-full.txt (CLAUDE.md §8). Solo con lo que existe (§7.4).
// Las versiones .md de cada página llegarán después; mientras, se enlaza el HTML.

function entryTitle(site: Site, e: ReturnType<typeof siteInventory>[number]): string {
  const dict = getDictionary(site.locale)
  const m = e.match
  switch (m.type) {
    case 'municipio':
      return m.municipio.nombre
    case 'negociosListing':
      return negociosListingTitle(m.listing, site)
    case 'negocio':
      return m.negocio.nombre
    case 'rutasListing':
      return m.listing.landing.titulo || (m.listing.filtro ? dict.titles.rutasFiltered : dict.titles.rutas)
    case 'ruta':
      return m.ruta.nombre
    case 'recursosListing':
      return m.listing.landing.titulo || dict.titles.recursos
    case 'recurso':
      return m.recurso.nombre
  }
}

const SECTION_ORDER = ['municipio', 'negociosListing', 'rutasListing', 'recursosListing'] as const

export async function llmsTxt(): Promise<string> {
  const sites = await getSites()
  const es = getDictionary('es')
  const lines = [
    '# Norte Palentino',
    '',
    `> ${es.site.tagline}. ${getDictionary('en').site.tagline}.`,
    '',
    es.site.disclaimer,
    getDictionary('en').site.disclaimer,
    '',
  ]
  for (const locale of locales) {
    const site = sites[locale]
    const dict = getDictionary(locale)
    lines.push(`## ${locale === 'es' ? 'Español' : 'English'}`, '', `- [${dict.site.name}](${absoluteUrl(homePath(locale))})`)
    const inventory = siteInventory(site)
    for (const type of SECTION_ORDER) {
      for (const e of inventory.filter((x) => x.match.type === type)) {
        lines.push(`- [${entryTitle(site, e)}](${absoluteUrl(e.path)})`)
      }
    }
    lines.push('')
  }
  lines.push('## Optional', '', `- [Datos completos / Full facts](${absoluteUrl('/llms-full.txt')})`, '')
  return lines.join('\n')
}

// Volcado condensado de hechos: municipios, rutas con datos técnicos y fichas
// con dirección, contacto, atributos, URL canónica y fecha de verificación.
export async function llmsFullTxt(): Promise<string> {
  const sites = await getSites()
  const out: string[] = ['# Norte Palentino', '', getDictionary('es').site.disclaimer, getDictionary('en').site.disclaimer, '']

  for (const locale of locales) {
    const site = sites[locale]
    const dict = getDictionary(locale)
    const url = (p: string | null) => (p ? absoluteUrl(p) : '')
    out.push(`## ${locale === 'es' ? 'Español' : 'English'}`, '')

    for (const m of site.municipios) {
      out.push(`### ${m.nombre}`, `URL: ${url(site.url.municipio(m))}`)
      if (m.intro) out.push(m.intro)
      for (const f of completeFaqs(m.faqs)) out.push(`- ${f.pregunta} ${f.respuesta}`)
      out.push('')
    }

    for (const r of site.rutas) {
      const nucleo = site.nucleoById.get(relId(r.inicio_nucleo) ?? -1)
      const facts = [
        r.distancia_km != null && `${dict.facts.distancia}: ${r.distancia_km} km`,
        r.desnivel_m != null && `${dict.facts.desnivel}: +${r.desnivel_m} m`,
        r.duracion_h != null && `${dict.facts.duracion}: ${formatDuration(r.duracion_h)}`,
        r.dificultad && `${dict.listing.dificultad}: ${dict.difficulty[r.dificultad]}`,
        `${dict.facts.circular}: ${r.circular ? '✓' : '✗'}`,
        r.apta_ninos && dict.facts.aptaNinos,
        r.apta_carrito && dict.facts.aptaCarrito,
        nucleo && `${dict.facts.inicio}: ${nucleo.nombre}`,
      ].filter(Boolean)
      out.push(`### ${r.nombre}`, `URL: ${url(site.url.ruta(r))}`, facts.join(' · '))
      if (r.resumen) out.push(r.resumen)
      out.push(`${dict.content.verified.replace('{date}', isoDate(r.fecha_verificacion) ?? '')}`, '')
    }

    for (const n of site.negocios) {
      const categoria = site.categoriaById.get(relId(n.categoria) ?? -1)
      const nucleo = site.nucleoById.get(relId(n.nucleo) ?? -1)
      const facts = [
        categoria?.nombre,
        nucleo?.nombre,
        n.direccion && `${dict.facts.direccion}: ${n.direccion}`,
        n.telefono && `${dict.facts.telefono}: ${n.telefono}`,
        n.web && `${dict.facts.web}: ${n.web}`,
        n.horario_texto && `${dict.facts.horario}: ${n.horario_texto.replace(/\s*\n\s*/g, '; ')}`,
        n.precio_rango && `${dict.facts.precio}: ${n.precio_rango}`,
        n.atributos_familia?.length && n.atributos_familia.map((a) => dict.familyAttributes[a]).join(', '),
      ].filter(Boolean)
      out.push(`### ${n.nombre}`, `URL: ${url(site.url.negocio(n))}`, facts.join(' · '))
      out.push(`${dict.content.verified.replace('{date}', isoDate(n.fecha_verificacion) ?? '')}`, '')
    }

    for (const r of site.recursos) {
      const tipo = site.tipoById.get(relId(r.tipo) ?? -1)
      const nucleo = site.nucleoById.get(relId(r.nucleo) ?? -1)
      const facts = [
        tipo?.nombre,
        nucleo?.nombre,
        r.horario_acceso && `${dict.facts.horarioAcceso}: ${r.horario_acceso.replace(/\s*\n\s*/g, '; ')}`,
        r.precio_entrada && `${dict.facts.entrada}: ${r.precio_entrada}`,
      ].filter(Boolean)
      out.push(`### ${r.nombre}`, `URL: ${url(site.url.recurso(r))}`, facts.join(' · '))
      if (r.resumen) out.push(r.resumen)
      out.push(`${dict.content.verified.replace('{date}', isoDate(r.fecha_verificacion) ?? '')}`, '')
    }
  }
  return out.join('\n')
}
