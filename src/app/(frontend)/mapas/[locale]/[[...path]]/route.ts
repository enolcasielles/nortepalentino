import { getSite } from '@/lib/data/site'
import { isLocale } from '@/lib/i18n'
import { mapDataFor, staticMapUrl } from '@/lib/maps/data'
import { matchRoute } from '@/lib/routes/match'

// Imagen estática del mapa de una página: /mapas/es/cervera-de-pisuerga/restaurantes.
// La clave de Static Maps nunca sale al cliente y solo se dibujan mapas de
// páginas que existen, así que la ruta no admite parámetros arbitrarios.
export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; path?: string[] }> }) {
  const key = process.env.GOOGLE_MAPS_STATIC_API_KEY
  const { locale, path = [] } = await params
  if (!key || !isLocale(locale)) return new Response(null, { status: 404 })

  const site = await getSite(locale)
  const match = matchRoute(site, path)
  const data = match && (await mapDataFor(match, site))
  if (!data) return new Response(null, { status: 404 })

  const upstream = await fetch(staticMapUrl(data, key))
  if (!upstream.ok) return new Response(null, { status: 502 })

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
    },
  })
}
