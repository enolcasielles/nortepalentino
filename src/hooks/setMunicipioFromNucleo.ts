import type { CollectionBeforeChangeHook } from 'payload'

import { relId } from '@/lib/payload/relations'

// `municipio` se deriva del núcleo para poder consultar y construir URLs por
// municipio sin joins. Nunca se edita a mano.
export function setMunicipioFromNucleo(nucleoField: string): CollectionBeforeChangeHook {
  return async ({ data, req }) => {
    if (!(nucleoField in data)) return data
    const nucleoId = relId(data[nucleoField])
    if (!nucleoId) {
      data.municipio = null
      return data
    }
    const nucleo = await req.payload.findByID({ collection: 'nucleos', id: nucleoId, depth: 0, req })
    data.municipio = relId(nucleo.municipio)
    return data
  }
}
