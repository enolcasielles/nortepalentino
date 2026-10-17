# Notas: negocios-comer-dormir.json

Verificado el 2026-10-17. 10 registros: 6 restaurantes (3 en Cervera, 3 en Aguilar) y 4 hoteles (3 en Aguilar, 1 en Cervera).
Pasa la validación con `negocioSchema` de `seed/schema.ts` (z.array(negocioSchema), lo ejecuté con tsx contra el repo sin modificarlo).

## Núcleos usados

Solo los núcleos cabecera, con el mismo slug que el municipio:

| slug | nombre | municipio |
| :-- | :-- | :-- |
| cervera-de-pisuerga | Cervera de Pisuerga | cervera-de-pisuerga |
| aguilar-de-campoo | Aguilar de Campoo | aguilar-de-campoo |

No he usado núcleos nuevos, así que no he buscado coordenadas de núcleos. **Ojo con el Parador:** su dirección oficial es "Ctra. de Resoba km 2,5, 34840 Cervera de Pisuerga", pero OSM lo sitúa en el término de **Ventanilla** (núcleo del municipio de Cervera). Lo dejo en `cervera-de-pisuerga`. Si creáis el núcleo `ventanilla`, se puede mover ahí.

## Coordenadas

Todas son de OSM/Nominatim (consultado el 2026-10-17):
- Coordenadas del propio POI (tourism=hotel/guest_house): Parador y Restaurante del Parador (42.8717212, -4.5214643), Posada Santa María la Real, Hotel Valentín, Hotel Marqués de Aguilar, Hostal Los Olmos, Hotel Rural Peñalabra (Calle Labradores 72) y Camping Fuentes Carrionas (para Taxus).
- **Aproximadas, a nivel de calle** (no hay POI en OSM): Mesón Añejo (centro de la Calle Comercio) y Nune (centro de la Plaza de España).
- Para comparar, las fichas de Turismo CyL dan coordenadas casi iguales: Valentín 42.794426,-4.264877; Parador 42.872209,-4.521446; Taxus 42.8724469,-4.5054219; Peñalabra 42.8677485,-4.4983253; Los Olmos 42.784225,-4.251983; Posada 42.7948258,-4.272883 (la de OSM, 42.7963, cae sobre el monasterio y la considero mejor).

## Fuentes por registro

| slug | fuente principal | apoyo |
| :-- | :-- | :-- |
| restaurante-penalabra-cervera | https://hotelruralpeñalabra.es/restaurante/ (en el JSON va en punycode: xn--hotelruralpealabra-y0b.es) | Ficha de Turismo CyL /es/servicios/comer/restaurantes/penalabra; reseñas de marzo y abril de 2026 en Gastroranking (sigue abierto) |
| restaurante-taxus-cervera | https://restaurantetaxus.wixsite.com/taxus ("Nuestras Cartas 2026" y PDF de la carta con precios) | Ficha de Turismo CyL /es/servicios/comer/restaurantes/taxus |
| restaurante-del-parador-de-cervera | https://paradores.es/es/restaurante-del-parador-de-cervera-de-pisuerga | — |
| nune-restaurante-aguilar | https://nunerestaurante.com/ (carta de octubre de 2026 en PDF) | — |
| meson-anejo-aguilar | https://mesonanejo.wixsite.com/anejo (páginas /contacto, /menu, /sobrenosotros y /restaurante) | Reseñas de abril de 2026 en Gastroranking (sigue abierto) |
| hostal-restaurante-los-olmos-aguilar | https://hotellosolmos.es/ (más /contacto, /restaurante y el PDF de la carta) | Ficha de Turismo CyL /es/servicios/dormir/hoteles/olmos; reseñas hasta diciembre de 2025 |
| posada-santa-maria-la-real | https://www.posadasantamarialareal.com/ | Ficha de Turismo CyL /es/turismorural/alojamientos/posada-santa-maria-real (22 habitaciones, admite perros, parking) |
| hotel-valentin-aguilar | https://hotelvalentin.com/ (más /hotel, /restaurante y /cafetería) | Ficha de Turismo CyL /es/servicios/dormir/hoteles/valentin (50 habitaciones, garaje-parking); reseñas de marzo y abril de 2026 |
| hotel-marques-de-aguilar | https://www.hotelmarquesdeaguilar.com/servicios | Portada de la web (hay imágenes subidas en diciembre de 2025) |
| parador-de-cervera-de-pisuerga | https://paradores.es/es/parador-de-cervera-de-pisuerga | Ficha de Turismo CyL /es/servicios/dormir/hoteles/parador-cervera-pisuerga (80 habitaciones) |

## Decisiones y dudas

- **Restaurante del Parador y Parador:** son dos fichas del mismo establecimiento (restaurante y hotel), con la misma dirección, teléfono y coordenadas. Lo elegí porque era el tercer restaurante de Cervera con más datos verificables. Si no queréis duplicar, la alternativa es el **Hostal Restaurante Pacho** (C/ Licenciado Fraile de la Hoz 2, 979 874 434, con ficha de Turismo CyL), aunque su web (hrpacho.es / pachohr.es) no responde y apenas hay datos oficiales para escribir la descripción. Otra opción es **El Refugio**, en Ruesga (Plaza Mayor s/n, 34844, 979 870 058), que solo tiene ficha de Turismo CyL y no tiene web.
- **precio_rango:** solo lo he puesto en Taxus (€€). Su carta de 2026 publica los precios: principales entre 15 y 28 €, ración de lechazo a 31 € y chuletón a 50 €/kg. En el resto no hay precios publicados de los platos (la carta de Nune en PDF solo tiene texto en la parte de vinos; la de Los Olmos no lleva precios), así que lo he omitido.
- **horario_texto:** lo he omitido en los hoteles y en Los Olmos, que solo publica que el menú del día es de lunes a viernes. **Mesón Añejo** se contradice: la portada dice "cenas viernes y sábado" y la página de contacto dice "viernes, sábado y domingo noche". En el texto lo he puesto así.
- **Teléfonos con varias opciones:** en la Posada uso el de la posada (689 73 79 92); el restaurante tiene el 661 54 04 53 y Turismo CyL añade el 979 122 522. En Los Olmos uso el de la página de contacto (979 125 505); el del restaurante para el menú es el 979 123 743. En el Parador, Turismo CyL añade la central de reservas 915 166 666.
- **Direcciones que no coinciden:** el Valentín da en su web "Avda. Ronda, 21" y Turismo CyL "Avda. de Ronda, 23"; uso la de la web. El Peñalabra aparece en Turismo CyL como "General Mola, 72", el nombre antiguo de la calle; uso la de su web, "Calle Labradores 72". En la Posada, la web pone "Monasterio Santa María la Real" y Turismo CyL "Avenida Cervera s/n"; las he combinado.
- **Emails:** he omitido el del Peñalabra (`info@hotelruralpeñalabra.es` lleva ñ en el dominio y Turismo CyL da otro antiguo, `informacion@hostalpenalabra.com`). En la Posada uso `info@posadasantamarialareal.com`, el del enlace mailto de su web. Turismo CyL lo escribe con una errata ("larela"). El de Nune lo decodifiqué de la protección de Cloudflare de su web: nunerestaurante@gmail.com.
- **atributos_familia:**
  - Posada: `admite-ninos` (su web dice que es "una magnífica elección para familias"), `admite-mascotas` (sale solo en Turismo CyL, "Admite Perros"; la web no lo menciona) y `parking` (aparcamiento gratuito según la web).
  - Valentín: solo `parking`. Turismo CyL indica "Parque Infantil", pero ni la ficha ni la web dicen expresamente que sea apto para familias, así que no he puesto `admite-ninos`.
  - Marqués de Aguilar: `admite-ninos` ("adaptadas a las familias"), `cuna` ("Cuna: GRATIS") y `parking` (aparcamiento privado). **No** admite mascotas.
  - Parador: `admite-ninos` ("Si viajas con niños…", con parque infantil y sala de juegos), `admite-mascotas` ("Acepta mascotas") y `parking`.
  - Los Olmos: `admite-ninos` (terraza "con zona de columpios para los más peques" y parque infantil cerrado) y `parking`. Su web dice "No se admiten mascotas", pero Turismo CyL dice "Admite Perros"; por la contradicción no lo he puesto.
  - Restaurante del Parador: `parking` (es el aparcamiento del Parador).
- **Marqués de Aguilar:** cerró por temporada del 16 de diciembre de 2024 a febrero de 2025. Es posible que vuelva a cerrar en invierno; no lo pongo como horario porque no hay aviso publicado para 2026-27.
- Descartado el **Hotel Villa de Aguilar** porque su web (hotelvilladeaguilar.es) no responde. También descartado "Restaurante El Cortés": su web, restaurantecortes.es, es de un restaurante de A Coruña. El "Cortés" de Aguilar no tiene web ni ficha oficial localizada.
- Otros candidatos para Aguilar con web propia, por si hacen falta más fichas: **El Convento de Mave** (hotel y restaurante en Santa María de Mave, CP 34492, 979 123 611, elconventodemave.com). Haría falta crear el núcleo y confirmar a qué municipio pertenece.
