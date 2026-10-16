import type { GroupField } from 'payload'

// Caja amplia alrededor de la Montaña Palentina para cazar coordenadas
// invertidas o de otra zona. No pretende ser un límite administrativo.
export const COORDINATE_BOUNDS = { minLat: 42.3, maxLat: 43.3, minLng: -5.3, maxLng: -3.7 }

type CoordinatesOptions = {
  name?: string
  label?: string
  required?: boolean
}

export function coordinatesField({
  name = 'coordenadas',
  label = 'Coordenadas',
  required = true,
}: CoordinatesOptions = {}): GroupField {
  const check =
    (axis: 'lat' | 'lng') =>
    (value: number | null | undefined): true | string => {
      if (value === null || value === undefined) return required ? 'Obligatorio.' : true
      const [min, max] = axis === 'lat' ? [COORDINATE_BOUNDS.minLat, COORDINATE_BOUNDS.maxLat] : [COORDINATE_BOUNDS.minLng, COORDINATE_BOUNDS.maxLng]
      if (value < min || value > max) {
        return `Fuera de la zona (${min} a ${max}). ¿Latitud y longitud intercambiadas?`
      }
      return true
    }

  return {
    name,
    label,
    type: 'group',
    admin: { description: 'Grados decimales (WGS84). Ej.: 42.866, -4.497' },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'lat', label: 'Latitud', type: 'number', required, validate: check('lat') },
          { name: 'lng', label: 'Longitud', type: 'number', required, validate: check('lng') },
        ],
      },
    ],
  }
}
