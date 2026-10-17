# Notas: categorías + negocios de turismo activo y casas rurales

Fecha de verificación: 2026-10-17. Ficheros: `categorias.json` (4), `negocios-activo-rural.json` (9: 4 de turismo activo y 5 casas rurales).

## categorias.json

- `casas-rurales` va en EN como **`holiday-cottages`** ("Holiday cottage(s)"), que en inglés británico es lo más natural. Si se prefiere `country-houses`, basta con cambiar slug, nombre y nombre_plural EN.
- `turismo-activo`: nombre EN "Outdoor activity" / "Outdoor activities"; nombre_plural ES "Turismo activo" (es incontable).
- tipo_schema, color_token e icono son exactamente los pedidos (están en `businessSchemaTypes`, `colorTokens` y `categoryIconKeys`).

## Núcleos usados

Coordenadas de Nominatim (OSM). El municipio se ha comprobado con la `address.municipality` de Nominatim y con el Registro de Turismo de Castilla y León (datos abiertos JCyL).

| slug | nombre | municipio | lat | lng | fuente |
| :-- | :-- | :-- | :-- | :-- | :-- |
| cervera-de-pisuerga | Cervera de Pisuerga | cervera-de-pisuerga | 42.8635509 | -4.4972234 | Nominatim (cabecera) |
| ventanilla | Ventanilla | cervera-de-pisuerga | 42.8792219 | -4.5596513 | Nominatim |
| rabanal-de-los-caballeros | Rabanal de los Caballeros | cervera-de-pisuerga | 42.8964545 | -4.4755133 | Nominatim |
| san-felices-de-castilleria | San Felices de Castillería | cervera-de-pisuerga | 42.9249453 | -4.4458777 | Nominatim |
| herreruela-de-castilleria | Herreruela de Castillería | cervera-de-pisuerga | 42.9273652 | -4.4121994 | Nominatim |
| aguilar-de-campoo | Aguilar de Campoo | aguilar-de-campoo | 42.7928369 | -4.2605438 | Nominatim (nodo town) |
| villavega-de-aguilar | Villavega de Aguilar | aguilar-de-campoo | 42.8532676 | -4.2578258 | Nominatim |
| lores | Lores | la-pernia | 42.9965723 | -4.5315800 | Nominatim |
| san-juan-de-redondo | San Juan de Redondo | la-pernia | 42.9886021 | -4.4512072 | Nominatim |

## Fuente común

- **Registro de Turismo de Castilla y León** (datos abiertos JCyL, dataset `registro-de-turismo-de-castilla-y-leon`, filtrado a Palencia): de aquí salen el registro, la dirección, el teléfono y, cuando las hay, las coordenadas de varias fichas. Lo uso para confirmar que el negocio está dado de alta. URL: https://analisis.datosabiertos.jcyl.es/explore/dataset/registro-de-turismo-de-castilla-y-leon/

## Fuentes y decisiones por registro

### Turismo activo

1. **PNTA – Promoción Natural y Turismo Activo** (Ventanilla, Cervera)
   - Fuentes: portal de turismo de la Junta (https://www.turismocastillayleon.com/en/nature/active-tourism/companies/promocion-natural-turismo-activo): dirección, teléfono, email, web y actividades (4x4, raquetas, bici, senderismo). Web propia https://pnta.es (contacto, nosotros: registro TA 34-11, CETS; pie ©2025, logo subido en septiembre de 2025). Ficha en Soy Ecoturista (https://soyecoturista.com/en/actividad/rutas-en-4x4-en-el-parque-natural-de-montana-palentina/experiencias-en-montana-palentina): itinerario, 2,5–3 h, salidas hacia las 8:00 y las 18:00, berrea de mediados de septiembre a mediados de octubre, "apta para familias con niños" y "se admiten mascotas". De ahí salen los atributos `admite-ninos` y `admite-mascotas`.
   - Coordenadas: las del registro JCyL (42.87965, -4.56129), que coinciden con C/ Iglesia de Ventanilla en Nominatim (42.8797, -4.5612).
   - Precios publicados en Soy Ecoturista: 45 €/persona (excursión general, mínimo 5 plazas) y 40 €/persona en berrea. Terranostrum da cifras algo distintas. No he puesto `precio_rango` (ver más abajo).
   - Ojo: la home de pnta.es tiene texto "Lorem ipsum" en el pie y la página /actividades/ está vacía. La empresa está activa (registro en vigor, web de 2025), pero la web propia es pobre. Por eso `fuente_url` apunta a la ficha de la Junta.

2. **El Velero de Aguilar** (Aguilar de Campoo)
   - Fuentes: web propia https://elvelerodeaguilar.com (/actividades/, /actividades-con-ninos/, aviso legal; imágenes subidas en 2025) y Soy Ecoturista / Tourism Cares (miembro de la CETS y colaborador del Geoparque Las Loras). Registro JCyL 34/000040, "Excursiones en velero por embalse Aguilar Campoo", Muelle Fondeadero del Llano.
   - **Teléfono**: la web da +34 602 41 53 83 (tel: y WhatsApp). El registro JCyL dice 602241583, probablemente una errata. Uso el de la web.
   - Email: no he puesto ninguno. En la web solo figura el email personal del titular en el aviso legal, y Tourism Cares da redes.elvelerodeaguilar@gmail.com. Si se quiere, este último es público.
   - Coordenadas: las del registro JCyL (42.78918, -4.30252), que corresponden al fondeadero en la orilla del embalse, al oeste del casco. No las he podido contrastar con un nodo de OSM del fondeadero.
   - Precios (web): 45 €/persona las 2 primeras horas y 15 €/hora adicional; grupo de hasta 4 personas, 85 € las 2 primeras horas y 35 €/hora adicional. Soy Ecoturista muestra precios antiguos (35/75 €). La web dice "actividad no accesible" y "recomendada para familias con niños", de ahí `admite-ninos`.
   - Barco: la web dice 18 pies y Soy Ecoturista 19. He usado 18 (web propia).

3. **DOSAVES** (Villavega de Aguilar, Aguilar de Campoo)
   - Fuentes: Soy Ecoturista (https://soyecoturista.com/en/actividad/observacion-del-lobo/experiencias-en-las-loras): observación del lobo, 9 h / 5 h, 70 € / 45 € por persona, todo el año salvo mayo, junio y julio, grupos de 4 a 12, "apta para familias con niños a partir de 11 años", guías en inglés y alemán. Tourism Cares (https://maps.tourismcares.org/spain/resource/dosaves-nature-observation-tourism): email, actividades (botánica, aves, grandes carnívoros, paisaje, baños de bosque) e idiomas DE/EN/ES. Registro JCyL 34/000004 (actividad turística complementaria): C/ Real s/n, 34810 Villavega de Aguilar, tel. 675244577, coordenadas 42.852362, -4.258168 (coinciden con el núcleo en Nominatim).
   - **Sin web propia** (dosaves.com/.es no resuelven), así que no hay campo `web`. Que siga activa lo indican la ficha vigente en Soy Ecoturista y en el registro. Hay indicios, no confirmados, de que su guía es Tino García, guía local de Naturetrek en Aguilar (el email es tino.dosaves@...). No lo menciono en el texto.
   - CP: el registro dice 34810 y Nominatim 34800. Uso el del registro.

4. **Alfonso Palazuelos, guía de naturaleza** (Rabanal de los Caballeros, Cervera)
   - Fuentes: portal de la Junta (https://www.turismocastillayleon.com/en/services/get-know/tourist-activities/alfonso-palazuelos-cobo), registro 34/000039, actividad turística complementaria de puesta en valor del patrimonio natural: dirección y teléfono. Guía Repsol, "Dónde ver osos pardos en Cantabria" (actualizado el 24/01/2024): ambientólogo; expediciones por Liébana, Picos de Europa y Montaña Palentina "para niños y adultos"; método en 4x4 al amanecer y al atardecer; no revela los puntos de observación. Naturetrek: figura como guía de sus viajes por la Montaña Palentina, con fechas en 2026.
   - **Es la ficha más débil del lote**: no tiene web ni email, es un profesional autónomo (el nombre comercial es su nombre) y buena parte de su actividad visible es como guía para un turoperador británico. Las coordenadas son las del núcleo (Nominatim), no las de un domicilio. Si preferís no publicar una ficha a nombre de una persona física, cambiadla a `borrador`. No he encontrado otra empresa de turismo activo registrada y activa en los 7 municipios fijados.
   - El nombre de la ficha es "Alfonso Palazuelos, guía de naturaleza"; en el registro figura como "ALFONSO PALAZUELOS COBO".

**Descartadas en turismo activo:**

- Centro Ecuestre Vega Yares (Salinas de Pisuerga) y Turismo Territorio Natural (Barruelo de Santullán): activas, pero de municipios fuera de la lista.
- Fuente de Aventuras (Camporredondo, Velilla del Río Carrión): mismo motivo.
- Corona Boreal / ACTIVAT (Velilla): municipio fuera de la lista, y su web daba 503 con el certificado caducado.
- GEA Forestal Ecoturismo: sin dirección publicada, sin actividad fechada posterior a 2023 y no aparece en el registro actual.
- Zona Norte Bicicletas (Guardo): sin registro ni web, y no he podido confirmar actividad reciente.
- Madrenys Natures (Cervera): figura en el registro, pero no hay rastro online.
- El Robledal del Oso (Cervera): lo gestiona Territorio Natural; su dominio redirige a la web de Barruelo, que no lo menciona.

### Casas rurales

Tres casas en **Cervera de Pisuerga** (para llegar al umbral de 3 del listado municipio + categoría) y dos en **La Pernía**. Pedíais 4; la quinta (Casa del Diezmo) está verificada igual que las demás y se puede quitar si sobra.

5. **Casa Las Vacas** (Cervera de Pisuerga)
   - Fuente: https://www.casalasvacas.com (home, ficha de la casa, localización, aviso legal: Nanai Montaña Palentina S.L.). Registro JCyL 34/000295 (CRA 34-295), 4 estrellas, 13 plazas, coordenadas 42.860324, -4.502741, que coinciden con C/ Primer Camino en Nominatim. Hay reseñas de Google de 2025 (según la búsqueda) que confirman que sigue abierta.
   - Atributos: cuna gratuita, chimenea, columpios para niños (`admite-ninos`) y aparcamiento privado (`parking`). Precio en la web: "575" para la casa, sin indicar la unidad (se supone por noche).

6. **Casa Rural San Felices** (San Felices de Castillería, Cervera)
   - Fuente: https://www.casalasvacas.com/es/room/11595/casa-rural-san-felices. Registro JCyL 34/000352, "CASA SAN FELICES", 10 plazas, mismo teléfono.
   - Atributos: "cunas disponibles bajo petición", chimenea, "zona infantil" y "garaje" en la lista de servicios. Tarifas: fin de semana a 550 € en temporada baja y 600 € en alta, y 250 € la noche extra.
   - Coordenadas: las del núcleo (Nominatim); la dirección exacta no está publicada. CP 34846 según el registro (Nominatim da 34847).

7. **Casa Rural Herreruela de Castillería** (Herreruela de Castillería, Cervera)
   - Fuente: https://www.casalasvacas.com/es/room/11594/casa-rural-herreruela-de-castilleria. Datos: 8 personas, 4 habitaciones, 3 baños, construida en 1760, a 15 km de Cervera; en servicios figuran "zona infantil" y "garaje". Tarifa de 250 € y 550 € el fin de semana.
   - Duda: en el registro JCyL no hay una entrada con ese nombre. Probablemente es "CASA CASTILLERÍA" (34/000084, Herreruela, 8 plazas, tel. 979870556 y web casacastilleria.com, que ya no resuelve), ahora comercializada por Casa Las Vacas. No lo he podido confirmar, así que uso las coordenadas del núcleo y no el número de registro.
   - Las tres casas de Cervera son del mismo propietario. Si eso resta variedad al listado, la alternativa es meter otra casa de Cervera, pero las que he probado en el registro no tienen web operativa ni actividad comprobable.

8. **Cumbres de Lores** (Lores, La Pernía)
   - Fuente: https://cumbresdelores.com (home, /lacasa.html, /normas-de-uso.html; ©2026). Registro TR.34-000437, 4 estrellas, 10 plazas, coordenadas del registro 42.995114, -4.529182. "Acondicionada como alojamiento rural en 2026."
   - Atributos: "Cuna disponible", chimeneas, admite hasta 2 perros avisando, `jardin-cerrado` (la web lo describe como "patio cerrado por un muro de piedra y una puerta de madera"; es un patio, no un jardín) y `admite-ninos` (la web dice "para disfrutar en familia"). **No** he puesto `parking`: se aparca gratis en la calle, junto a la casa. Tarifas de 300 a 540 €/noche según la temporada; estancia mínima de 2 noches.
   - La web tiene versión EN (/en/).

9. **Casa del Diezmo** (San Juan de Redondo, La Pernía)
   - Fuente: https://www.casadeldiezmo.es (home, /la-casa/, jardín, habitaciones). Las páginas se actualizaron el 7 de septiembre de 2026 (fechas `modified` de la API de WordPress). Registro JCyL 34/000375, 10 plazas.
   - Atributos: chimenea (2), "zona de aparcamiento exterior" (`parking`) y `admite-ninos` (la web propone planes "en familia o con niños" y tiene un artículo sobre planes con niños). No he puesto mascotas: solo lo dice un portal de terceros, no la web. El precio de la home es "180 €/día*".
   - Coordenadas: las del núcleo (Nominatim). Las del registro (42.9395, -4.4484) están unos 5 km al sur del pueblo y parecen erróneas.
   - "1.200 m de altitud" es un dato de la propia web, sin contrastar con el IGN.

**Descartadas en casas rurales:** Casa Llosa A/B (San Salvador de Cantamuda) y Casa Rural Toribio (San Juan de Redondo), porque su web ya no resuelve. Tampoco he usado El Casuco ni Casa Lope (La Pernía) ni otras de Cervera (Los Peralejos, La Reserva, Casa María…) del registro, porque no tienen web propia con la que verificar servicios ni actividad reciente.

## precio_rango

No lo he puesto en ninguna ficha. Hay precios publicados, pero no hay una regla definida para convertir en €/€€/€€€ una tarifa de alquiler íntegro (casa para 8–13 personas) o de actividad por persona. Los precios exactos están arriba por si se quiere fijar el criterio y rellenarlo.

## Validación

- `JSON.parse` correcto en los dos ficheros.
- Validación con zod (`categoriaSchema` y `negocioSchema` de `seed/schema.ts`, ejecutado con tsx): 4/4 categorías y 9/9 negocios sin errores.
- Las descripciones tienen entre 93 y 115 palabras (ES) y entre 100 y 115 (EN).
- Los núcleos (salvo las cabeceras) **no existen todavía en `municipios.json`**: hay que añadirlos con los datos de la tabla de arriba o el import fallará por referencia rota.
