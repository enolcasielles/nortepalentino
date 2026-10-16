import type { ColorToken } from '@/lib/taxonomies'

// Clases literales para que Tailwind las genere (DESIGN.md §3.1)
export const categoryPlate: Record<ColorToken, string> = {
  dormir: 'bg-cat-dormir text-cat-dormir-contrast',
  comer: 'bg-cat-comer text-cat-comer-contrast',
  activo: 'bg-cat-activo text-cat-activo-contrast',
  rutas: 'bg-cat-rutas text-cat-rutas-contrast',
  romanico: 'bg-cat-romanico text-cat-romanico-contrast',
  naturaleza: 'bg-cat-naturaleza text-cat-naturaleza-contrast',
  museo: 'bg-cat-museo text-cat-museo-contrast',
}

export const categoryBorder: Record<ColorToken, string> = {
  dormir: 'border-t-cat-dormir',
  comer: 'border-t-cat-comer',
  activo: 'border-t-cat-activo',
  rutas: 'border-t-cat-rutas',
  romanico: 'border-t-cat-romanico',
  naturaleza: 'border-t-cat-naturaleza',
  museo: 'border-t-cat-museo',
}

export function asColorToken(value: string | null | undefined): ColorToken {
  return (value as ColorToken) || 'rutas'
}
