import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'

import { defaultLocale, isLocale, locales, type Locale } from '@/lib/i18n'
import { paths } from '@/lib/routes'
import { resolveDocPath, type RoutableCollection } from '@/lib/routes/resolve'

type RedirectInput = {
  desde: string
  hacia: string
  locale: Locale
  tipo: 'exacto' | 'prefijo'
}

// Crea o actualiza el redirect que sale de `desde`. La colección `redirects`
// se encarga de colapsar cadenas y evitar bucles.
export async function upsertRedirect(req: PayloadRequest, input: RedirectInput): Promise<void> {
  const data = { ...input, codigo: 301, origen: 'automatico' as const }
  const existing = await req.payload.find({
    collection: 'redirects',
    where: { desde: { equals: input.desde } },
    limit: 1,
    depth: 0,
    req,
  })
  if (existing.docs[0]) {
    await req.payload.update({ collection: 'redirects', id: existing.docs[0].id, data, req })
  } else {
    await req.payload.create({ collection: 'redirects', data, req })
  }
}

type Options = {
  // El slug se traduce (rutas, recursos, planes) o es igual en ES y EN
  localizedSlug: boolean
  // Solo las fichas con `estado` publicado tenían URL pública
  hasEstado: boolean
}

// Si cambia la URL de un documento publicado, crea un 301 desde la antigua
// (CLAUDE.md §5). Un cambio de slug de municipio redirige todo lo que cuelga
// de él (prefijo).
export function redirectOnUrlChange(collection: RoutableCollection, { localizedSlug, hasEstado }: Options) {
  const hook: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req, context }) => {
    if (operation !== 'update' || context.skipRedirects) return doc
    if (hasEstado && previousDoc?.estado !== 'publicado') return doc

    // Un update solo modifica los campos localizados del idioma editado
    const editedLocale = req.locale && isLocale(req.locale) ? req.locale : defaultLocale

    for (const locale of locales) {
      const current =
        locale === editedLocale
          ? doc
          : await req.payload.findByID({ collection, id: doc.id, depth: 0, locale, req })
      const previous =
        locale === editedLocale || !localizedSlug ? previousDoc : { ...previousDoc, slug: current.slug }

      // Secuencial: las consultas comparten la transacción de `req`
      const from = await resolveDocPath(collection, previous, locale, req)
      const to = await resolveDocPath(collection, current, locale, req)
      if (from && to && from !== to) {
        await upsertRedirect(req, {
          desde: from,
          hacia: to,
          locale,
          tipo: collection === 'municipios' ? 'prefijo' : 'exacto',
        })
      }
    }
    return doc
  }
  return hook
}

// Un cambio de slug de categoría mueve el listado comarcal y todos los
// listados y fichas de municipio + categoría en ese idioma.
export const redirectOnCategoriaChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  context,
}) => {
  if (operation !== 'update' || context.skipRedirects) return doc
  const locale = req.locale && isLocale(req.locale) ? req.locale : defaultLocale
  const from = previousDoc?.slug
  const to = doc.slug
  if (!from || !to || from === to) return doc

  await upsertRedirect(req, {
    desde: paths.categoria(locale, from),
    hacia: paths.categoria(locale, to),
    locale,
    tipo: 'prefijo',
  })
  const municipios = await req.payload.find({
    collection: 'municipios',
    pagination: false,
    depth: 0,
    select: { slug: true },
    req,
  })
  for (const m of municipios.docs) {
    await upsertRedirect(req, {
      desde: paths.municipioCategoria(locale, m.slug, from),
      hacia: paths.municipioCategoria(locale, m.slug, to),
      locale,
      tipo: 'prefijo',
    })
  }
  return doc
}
