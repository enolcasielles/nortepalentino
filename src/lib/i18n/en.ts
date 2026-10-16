import type { Dictionary } from './es'

// UI microcopy in English. Same key shape as es.ts (DESIGN.md §2).
export const en: Dictionary = {
  site: {
    name: 'Norte Palentino',
    tagline: 'Mountains, villages & Romanesque of northern Spain',
    disclaimer: 'Norte Palentino is an independent guide, not an official tourism website.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    home: 'Home',
  },
  language: {
    label: 'Language',
    switchTo: 'Leer en español',
  },
  actions: {
    call: 'Call',
    directions: 'Directions',
    website: 'Business website',
    openMap: 'Open interactive map',
  },
  common: {
    nearby: 'Nearby',
    empty: "We haven't checked any places here yet.",
  },
  familyAttributes: {
    'admite-ninos': 'Children welcome',
    cuna: 'Cot available',
    trona: 'High chair',
    'menu-infantil': "Children's menu",
    'accesible-carrito': 'Pushchair-friendly',
    'jardin-cerrado': 'Enclosed garden',
    'admite-mascotas': 'Pets welcome',
    parking: 'Parking',
    chimenea: 'Fireplace',
  },
  difficulty: {
    facil: 'Easy',
    moderada: 'Moderate',
    dificil: 'Hard',
  },
  season: {
    primavera: 'Spring',
    verano: 'Summer',
    otono: 'Autumn',
    invierno: 'Winter',
  },
}
