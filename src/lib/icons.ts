import {
  Accessibility,
  Armchair,
  Baby,
  BedDouble,
  BedSingle,
  Beer,
  Bike,
  Binoculars,
  Bird,
  BookOpenText,
  Castle,
  Church,
  CircleParking,
  Coffee,
  CookingPot,
  Dog,
  Droplets,
  Fence,
  Flame,
  Footprints,
  Hotel,
  House,
  Landmark,
  MapPin,
  Mountain,
  MountainSnow,
  Route,
  ShoppingBasket,
  Shovel,
  Store,
  Tent,
  Tickets,
  Trees,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

import type { FamilyAttribute } from './taxonomies'

// Iconos disponibles para categorías y tipos de recurso. La clave es lo que
// se guarda en `icono`; añadir un icono nuevo es añadirlo aquí.
export const categoryIcons = {
  hotel: Hotel,
  'casa-rural': House,
  cama: BedDouble,
  camping: Tent,
  restaurante: UtensilsCrossed,
  cafeteria: Coffee,
  bar: Beer,
  tienda: Store,
  'producto-local': ShoppingBasket,
  'turismo-activo': Mountain,
  bici: Bike,
  ruta: Route,
  senda: Footprints,
  iglesia: Church,
  monumento: Landmark,
  castillo: Castle,
  mirador: Binoculars,
  cascada: Droplets,
  bosque: Trees,
  cumbre: MountainSnow,
  fauna: Bird,
  museo: Tickets,
  yacimiento: Shovel,
  lugar: MapPin,
} satisfies Record<string, LucideIcon>

export type CategoryIconKey = keyof typeof categoryIcons

export const categoryIconKeys = Object.keys(categoryIcons) as CategoryIconKey[]

// Iconos de tipos de página que no son categorías (no se ofrecen en el panel)
export const pageIcons = {
  articulo: BookOpenText,
} satisfies Record<string, LucideIcon>

export const familyAttributeIcons: Record<FamilyAttribute, LucideIcon> = {
  'admite-ninos': Baby,
  cuna: BedSingle,
  trona: Armchair,
  'menu-infantil': CookingPot,
  'accesible-carrito': Accessibility,
  'jardin-cerrado': Fence,
  'admite-mascotas': Dog,
  parking: CircleParking,
  chimenea: Flame,
}
