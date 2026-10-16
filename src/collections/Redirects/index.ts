import type { CollectionAfterChangeHook, CollectionConfig, FieldHook, PayloadRequest } from 'payload'

import type { Redirect } from '@/payload-types'

import { cacheTags } from '@/lib/cache/tags'
import { locales } from '@/lib/i18n'
import { safeRevalidate } from '@/hooks/revalidate'

import { adminGroups } from '../groups'

const normalizePath: FieldHook = ({ value }) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (/^https?:\/\//.test(trimmed)) return trimmed
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
}

const replacePrefix = (path: string, from: string, to: string) =>
  path === from ? to : path.startsWith(`${from}/`) ? `${to}${path.slice(from.length)}` : null

// Mantiene la tabla sin cadenas ni bucles: A→B + B→C se reescribe como A→C,
// y si una URL antigua vuelve a usarse se elimina el redirect que salía de ella.
const maintainRedirects: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (req.context.skipRedirectMaintenance) return doc
  // Las operaciones anidadas comparten `req` (y su `context`): la marca se
  // retira al terminar para no desactivar el mantenimiento del resto de la petición
  req.context.skipRedirectMaintenance = true
  try {
    await collapseChains(doc, req)
  } finally {
    delete req.context.skipRedirectMaintenance
  }
  safeRevalidate([cacheTags.redirects])
  return doc
}

async function collapseChains(doc: Redirect, req: PayloadRequest): Promise<void> {
  const { payload } = req

  // 1. ¿El destino es a su vez origen de otro redirect?
  const onward = await payload.find({
    collection: 'redirects',
    where: { desde: { equals: doc.hacia } },
    limit: 1,
    depth: 0,
    req,
  })
  const next = onward.docs[0]
  if (next) {
    if (next.hacia === doc.desde) {
      await payload.delete({ collection: 'redirects', id: next.id, req })
    } else {
      await payload.update({ collection: 'redirects', id: doc.id, data: { hacia: next.hacia }, req })
      doc.hacia = next.hacia
    }
  }

  // 2. Los redirects que apuntaban a la URL antigua pasan a apuntar a la nueva
  const pointing = await payload.find({
    collection: 'redirects',
    where: { hacia: { like: doc.desde } },
    pagination: false,
    depth: 0,
    req,
  })
  for (const r of pointing.docs) {
    if (r.id === doc.id) continue
    const updated = doc.tipo === 'prefijo' ? replacePrefix(r.hacia, doc.desde, doc.hacia) : r.hacia === doc.desde ? doc.hacia : null
    if (!updated) continue
    if (updated === r.desde) {
      await payload.delete({ collection: 'redirects', id: r.id, req })
    } else {
      await payload.update({ collection: 'redirects', id: r.id, data: { hacia: updated }, req })
    }
  }
}

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  labels: { singular: 'Redirect', plural: 'Redirects' },
  admin: {
    useAsTitle: 'desde',
    defaultColumns: ['desde', 'hacia', 'tipo', 'origen', 'updatedAt'],
    group: adminGroups.sistema,
    description: 'Se crean solos al cambiar la URL de algo publicado. También se pueden añadir a mano.',
  },
  access: { read: () => true },
  fields: [
    {
      name: 'desde',
      label: 'Desde',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [normalizePath] },
      validate: (value: string | null | undefined) =>
        value?.startsWith('/') ? true : 'Debe ser una ruta del sitio que empiece por /',
    },
    {
      name: 'hacia',
      label: 'Hacia',
      type: 'text',
      required: true,
      hooks: { beforeValidate: [normalizePath] },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: unknown }) => {
        if (!value) return 'Obligatorio.'
        if (value === (siblingData as { desde?: string }).desde) return 'El destino no puede ser el origen.'
        return true
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'tipo',
          label: 'Tipo',
          type: 'select',
          required: true,
          defaultValue: 'exacto',
          options: [
            { value: 'exacto', label: 'Exacto' },
            { value: 'prefijo', label: 'Prefijo (incluye subrutas)' },
          ],
        },
        {
          name: 'locale',
          label: 'Idioma',
          type: 'select',
          options: locales.map((l) => ({ value: l, label: l.toUpperCase() })),
        },
        {
          name: 'codigo',
          label: 'Código',
          type: 'number',
          required: true,
          defaultValue: 301,
          admin: { readOnly: true },
        },
        {
          name: 'origen',
          label: 'Origen',
          type: 'select',
          required: true,
          defaultValue: 'manual',
          options: [
            { value: 'manual', label: 'Manual' },
            { value: 'automatico', label: 'Automático' },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [maintainRedirects],
    afterDelete: [() => safeRevalidate([cacheTags.redirects])],
  },
}
