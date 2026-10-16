import type { ColorToken } from '@/lib/taxonomies'

// Clases literales para que Tailwind las genere (DESIGN.md §3.1)

// Placa sólida: icono o etiqueta sobre el color pleno de la categoría
export const categoryPlate: Record<ColorToken, string> = {
  dormir: 'bg-cat-dormir text-cat-dormir-contrast',
  comer: 'bg-cat-comer text-cat-comer-contrast',
  activo: 'bg-cat-activo text-cat-activo-contrast',
  rutas: 'bg-cat-rutas text-cat-rutas-contrast',
  romanico: 'bg-cat-romanico text-cat-romanico-contrast',
  naturaleza: 'bg-cat-naturaleza text-cat-naturaleza-contrast',
  museo: 'bg-cat-museo text-cat-museo-contrast',
}

// Fondo tintado con las curvas de nivel en el color de la categoría
// (media de tarjeta sin foto y cabecera de página)
export const categoryMedia: Record<ColorToken, string> = {
  dormir: 'bg-cat-dormir-soft text-cat-dormir',
  comer: 'bg-cat-comer-soft text-cat-comer',
  activo: 'bg-cat-activo-soft text-cat-activo',
  rutas: 'bg-cat-rutas-soft text-cat-rutas',
  romanico: 'bg-cat-romanico-soft text-cat-romanico',
  naturaleza: 'bg-cat-naturaleza-soft text-cat-naturaleza',
  museo: 'bg-cat-museo-soft text-cat-museo',
}

// Solo para iconos y detalles gráficos (algunos tonos no llegan a 4,5:1 como texto)
export const categoryIconColor: Record<ColorToken, string> = {
  dormir: 'text-cat-dormir',
  comer: 'text-cat-comer',
  activo: 'text-cat-activo',
  rutas: 'text-cat-rutas',
  romanico: 'text-cat-romanico',
  naturaleza: 'text-cat-naturaleza',
  museo: 'text-cat-museo',
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

// Desplazamiento estable de la textura a partir de un texto, para que dos
// tarjetas seguidas no muestren las mismas curvas.
export function contourOffset(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  const x = Math.abs(h) % 800
  const y = Math.abs(h >> 8) % 500
  return `-${x}px -${y}px`
}
