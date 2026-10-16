import type { Difficulty, FamilyAttribute, Season } from '@/lib/taxonomies'

// Microcopy de UI en español. Misma forma de claves que en.ts (DESIGN.md §2).
export const es = {
  site: {
    name: 'Norte Palentino',
    tagline: 'Guía de la Montaña Palentina',
    disclaimer:
      'Norte Palentino es una guía independiente; no es la web oficial de ningún organismo.',
  },
  a11y: {
    skipToContent: 'Saltar al contenido',
    home: 'Inicio',
  },
  language: {
    label: 'Idioma',
    switchTo: 'Read in English',
  },
  actions: {
    call: 'Llamar',
    directions: 'Cómo llegar',
    website: 'Web oficial del negocio',
    openMap: 'Ver mapa interactivo',
  },
  common: {
    nearby: 'Cerca de aquí',
    empty: 'Todavía no hemos verificado ningún sitio aquí.',
  },
  familyAttributes: {
    'admite-ninos': 'Admite niños',
    cuna: 'Cuna',
    trona: 'Trona',
    'menu-infantil': 'Menú infantil',
    'accesible-carrito': 'Accesible con carrito',
    'jardin-cerrado': 'Jardín cerrado',
    'admite-mascotas': 'Admite mascotas',
    parking: 'Aparcamiento',
    chimenea: 'Chimenea',
  } satisfies Record<FamilyAttribute, string>,
  difficulty: {
    facil: 'Fácil',
    moderada: 'Moderada',
    dificil: 'Difícil',
  } satisfies Record<Difficulty, string>,
  season: {
    primavera: 'Primavera',
    verano: 'Verano',
    otono: 'Otoño',
    invierno: 'Invierno',
  } satisfies Record<Season, string>,
}

export type Dictionary = typeof es

