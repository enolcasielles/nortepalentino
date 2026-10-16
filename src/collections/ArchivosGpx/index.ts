import { ValidationError, type CollectionConfig } from 'payload'

import { processGpx } from '@/lib/geo/gpx'

import { adminGroups } from '../groups'

// Tracks GPX de las rutas. Al subir uno se calculan en servidor la polyline
// (para Static Maps) y el bbox; el GPX original se ofrece como descarga.
export const ArchivosGpx: CollectionConfig = {
  slug: 'archivos_gpx',
  labels: { singular: 'Archivo GPX', plural: 'Archivos GPX' },
  admin: { group: adminGroups.rutas, defaultColumns: ['filename', 'puntos', 'updatedAt'] },
  access: { read: () => true },
  upload: {
    mimeTypes: ['application/gpx+xml', 'application/xml', 'text/xml', 'application/octet-stream'],
  },
  fields: [
    {
      name: 'polyline',
      label: 'Polyline (derivada)',
      type: 'textarea',
      admin: { readOnly: true },
    },
    { name: 'bbox', label: 'Bbox (derivado)', type: 'json', admin: { readOnly: true } },
    { name: 'puntos', label: 'Puntos tras simplificar', type: 'number', admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, collection }) => {
        const file = req.file
        if (!file?.data) return data
        if (!/\.gpx$/i.test(file.name)) {
          throw new ValidationError({
            collection: collection.slug,
            errors: [{ path: 'file', message: 'El archivo debe tener extensión .gpx' }],
          })
        }
        try {
          return { ...data, ...processGpx(file.data.toString('utf8')) }
        } catch (error) {
          throw new ValidationError({
            collection: collection.slug,
            errors: [{ path: 'file', message: (error as Error).message }],
          })
        }
      },
    ],
  },
}
