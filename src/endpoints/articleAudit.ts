import type { Endpoint } from 'payload'

import { getSite } from '@/lib/data/site'
import { isLocale, locales } from '@/lib/i18n'
import { auditArticle } from '@/lib/seo/articleAudit'
import type { Articulo } from '@/payload-types'

// Revisión SEO de un artículo (también borradores) en uno o en los dos
// idiomas. La usan el panel y la extensión de Claude Desktop (`revisar`).
export const articleAuditEndpoint: Endpoint = {
  path: '/cms/auditoria/:id',
  method: 'get',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'No autorizado' }, { status: 401 })
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id)) return Response.json({ error: 'id no válido' }, { status: 400 })
    const requested = req.searchParams.get('locale')
    const targets = requested && isLocale(requested) ? [requested] : [...locales]

    const result: Record<string, unknown> = {}
    for (const locale of targets) {
      const doc = await req.payload
        .findByID({ collection: 'articulos', id, locale, depth: 0, overrideAccess: true })
        .catch(() => null)
      if (!doc) return Response.json({ error: 'No existe el artículo' }, { status: 404 })
      const site = await getSite(locale)
      result[locale] = {
        existe: site.articuloById.has(id),
        comprobaciones: auditArticle(doc as Articulo, site),
      }
    }
    return Response.json(result)
  },
}
