// Enumeraciones cerradas del modelo de datos. Las etiquetas ES/EN viven en
// los diccionarios de UI (lib/i18n) y los iconos en lib/icons.ts.

export const estados = ['borrador', 'publicado'] as const
export type Estado = (typeof estados)[number]

export const familyAttributes = [
  'admite-ninos',
  'cuna',
  'trona',
  'menu-infantil',
  'accesible-carrito',
  'jardin-cerrado',
  'admite-mascotas',
  'parking',
  'chimenea',
] as const
export type FamilyAttribute = (typeof familyAttributes)[number]

export const difficulties = ['facil', 'moderada', 'dificil'] as const
export type Difficulty = (typeof difficulties)[number]

export const seasons = ['primavera', 'verano', 'otono', 'invierno'] as const
export type Season = (typeof seasons)[number]

export const priceRanges = ['€', '€€', '€€€', '€€€€'] as const
export type PriceRange = (typeof priceRanges)[number]

// Los siete grupos de color de categoría (DESIGN.md §3.1). No se crean más.
export const colorTokens = [
  'dormir',
  'comer',
  'activo',
  'rutas',
  'romanico',
  'naturaleza',
  'museo',
] as const
export type ColorToken = (typeof colorTokens)[number]

// Tipos schema.org admitidos para negocios (CLAUDE.md §7.2)
export const businessSchemaTypes = [
  'Restaurant',
  'BarOrPub',
  'CafeOrCoffeeShop',
  'Store',
  'Hotel',
  'BedAndBreakfast',
  'Campground',
  'Hostel',
  'LodgingBusiness',
  'SportsActivityLocation',
  'LocalBusiness',
] as const
export type BusinessSchemaType = (typeof businessSchemaTypes)[number]

// Tipos schema.org admitidos para recursos (qué ver)
export const sightSchemaTypes = [
  'TouristAttraction',
  'Church',
  'Museum',
  'LandmarksOrHistoricalBuildings',
  'Mountain',
  'Waterfall',
  'Park',
] as const
export type SightSchemaType = (typeof sightSchemaTypes)[number]
