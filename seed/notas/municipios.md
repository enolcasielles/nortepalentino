# municipios.json: notas de investigación (2026-10-17)

Validado con `municipioSchema.array()` de `seed/schema.ts` (tsx, sin tocar el repo): OK. No hay slugs de núcleo duplicados. Ningún registro lleva `autor`.

## ⚠ Decisiones que afectan a otros lotes

1. **La Pernía no tiene un núcleo "la-pernia".** No existe un pueblo con ese nombre: el municipio se formó en 1976 por fusión, y su capital es **San Salvador de Cantamuda** (Wikipedia ES "La Pernía"; BOE-A-1976-9656). He puesto la cabecera como `san-salvador-de-cantamuda` y **no hay** núcleo `la-pernia`. Si otro agente ha usado `"nucleo": "la-pernia"` para negocios de San Salvador, hay que cambiarlo a `san-salvador-de-cantamuda`, o añadir aquí un núcleo `la-pernia`, aunque eso no lo recomiendo.
2. **Pozo de los Humos NO está en la Montaña Palentina.** Es una cascada del río Uces, en Masueco / Pereña de la Ribera (Salamanca, Arribes del Duero). Fuentes: Nominatim, que la sitúa en 41.2175, -6.5705, y turismocastillayleon.com/es/naturaleza/rutas-naturaleza/pozo-humos. Queda fuera de nuestras coordenadas (lng ≥ -5.3). Si alguien lo ha metido como recurso, hay que quitarlo.
3. **Lores** pertenece a **La Pernía** (Wikipedia ES, La Pernía; antiguo municipio fusionado en 1976). Está incluido.
4. **Tosande** no es un núcleo habitado: es la Tejeda de Tosande, un bosque de tejos, y el valle del mismo nombre. En OSM, el lugar "Tejeda de Tosande" (42.8386, -4.5561) queda en **Dehesa de Montejo** y el "Valle de Tosande" (42.8442, -4.5521) en **Cervera de Pisuerga**: el límite municipal cruza el valle. El aparcamiento de inicio de la senda, en la CL-626 (antes C-626) a unos 6 km de Cervera dirección Guardo, está en término de Dehesa de Montejo (park4night 70783: 42.8258, -4.5165; Terranostrum da como punto de salida Dehesa de Montejo). Para una ruta, `inicio_nucleo` = `dehesa-de-montejo` es lo más defendible. No lo añado como núcleo.
5. **Vado**, donde está la estación "Vado-Cervera" de la línea de vía estrecha León–Bilbao, es de **Dehesa de Montejo**, no de Cervera.
6. **La estación de tren "Aguilar de Campoo"** está en Camesa de Valdivia, municipio de **Pomar de Valdivia** (aguilardecampooturismo.com/como-llegar/).
7. Las pedanías pedidas están verificadas y pertenecen al municipio indicado: Estalaya, Ruesga, San Martín de los Herreros y Vañes → Cervera; Barrio de Santa María, Mave, Olleros de Pisuerga y Villanueva de Henares → Aguilar; San Salvador de Cantamuda, Santa María de Redondo, Piedrasluengas, Lebanza, Areños y Camasobres → La Pernía; Revilla de Pomar y Villaescusa de las Torres → Pomar de Valdivia; Valberzoso y Salcedillo → Brañosera. Barruelo de Santullán es municipio propio y no está incluido.

## Núcleos usados

Coordenadas de las cabeceras: AEMET, página de predicción por municipio, que toma latitud, longitud y altitud del Nomenclátor del IGN (`aemet.es/es/eltiempo/prediccion/municipios/<slug>-id34XXX`). Resto de núcleos: nodo `place` de OSM vía Nominatim (`nominatim.openstreetmap.org/search?q=<nombre>, Palencia, España`), redondeado a 5 decimales. La pertenencia a cada municipio está comprobada en Wikipedia ES (listas de pedanías o entidades locales del artículo del municipio) y coincide con la dirección de Nominatim.

| slug | nombre | municipio | lat | lng | fuente coords |
|---|---|---|---|---|---|
| cervera-de-pisuerga | Cervera de Pisuerga | cervera-de-pisuerga | 42.8658 | -4.49921 | AEMET/IGN id34056 |
| estalaya | Estalaya | cervera-de-pisuerga | 42.92798 | -4.47491 | Nominatim |
| ruesga | Ruesga | cervera-de-pisuerga | 42.86475 | -4.52346 | Nominatim |
| san-martin-de-los-herreros | San Martín de los Herreros | cervera-de-pisuerga | 42.89117 | -4.59335 | Nominatim |
| vanes | Vañes | cervera-de-pisuerga | 42.91598 | -4.48978 | Nominatim |
| aguilar-de-campoo | Aguilar de Campoo | aguilar-de-campoo | 42.79265 | -4.25994 | AEMET/IGN id34004 |
| barrio-de-santa-maria | Barrio de Santa María | aguilar-de-campoo | 42.81291 | -4.3797 | Nominatim (ojo: hay otro "Barrio de Santa María" en Alar del Rey) |
| mave | Mave | aguilar-de-campoo | 42.73673 | -4.27395 | Nominatim (Santa María de Mave es otra entidad, no incluida) |
| olleros-de-pisuerga | Olleros de Pisuerga | aguilar-de-campoo | 42.74428 | -4.28791 | Nominatim |
| villanueva-de-henares | Villanueva de Henares | aguilar-de-campoo | 42.84836 | -4.16087 | Nominatim |
| guardo | Guardo | guardo | 42.78894 | -4.84151 | AEMET/IGN id34080 |
| muneca | Muñeca | guardo | 42.7923 | -4.80147 | Nominatim (ojo: hay otros "Muñeca" en Santibáñez de Ecla y Aguilar) |
| intorcisa | Intorcisa | guardo | 42.78271 | -4.79922 | Nominatim |
| san-pedro-de-cansoles | San Pedro de Cansoles | guardo | 42.75425 | -4.91617 | Nominatim |
| san-salvador-de-cantamuda | San Salvador de Cantamuda | la-pernia | 42.96667 | -4.49559 | AEMET/IGN id34904 (capital) |
| santa-maria-de-redondo | Santa María de Redondo | la-pernia | 42.99048 | -4.43435 | Nominatim |
| piedrasluengas | Piedrasluengas | la-pernia | 43.03711 | -4.4578 | Nominatim |
| lebanza | Lebanza | la-pernia | 42.96875 | -4.5274 | Nominatim |
| arenos | Areños | la-pernia | 42.99239 | -4.48892 | Nominatim |
| camasobres | Camasobres | la-pernia | 43.01524 | -4.48802 | Nominatim |
| lores | Lores | la-pernia | 42.99657 | -4.53158 | Nominatim |
| dehesa-de-montejo | Dehesa de Montejo | dehesa-de-montejo | 42.81904 | -4.50935 | AEMET/IGN id34067 |
| colmenares-de-ojeda | Colmenares de Ojeda | dehesa-de-montejo | 42.79535 | -4.52238 | Nominatim |
| vado | Vado | dehesa-de-montejo | 42.85408 | -4.48216 | Nominatim |
| branosera | Brañosera | branosera | 42.93519 | -4.30785 | AEMET/IGN id34036 |
| valberzoso | Valberzoso | branosera | 42.91285 | -4.24255 | Nominatim |
| salcedillo | Salcedillo | branosera | 42.94101 | -4.27362 | Nominatim |
| orbo | Orbó | branosera | 42.87972 | -4.25483 | Nominatim |
| vallejo-de-orbo | Vallejo de Orbó | branosera | 42.88494 | -4.26241 | Nominatim |
| pomar-de-valdivia | Pomar de Valdivia | pomar-de-valdivia | 42.77458 | -4.16749 | AEMET/IGN id34135 |
| revilla-de-pomar | Revilla de Pomar | pomar-de-valdivia | 42.77111 | -4.15188 | Nominatim |
| villaescusa-de-las-torres | Villaescusa de las Torres | pomar-de-valdivia | 42.75905 | -4.2529 | Nominatim |

## Datos por municipio y fuentes

**Altitud (todas):** AEMET/IGN, igual que las coordenadas. Discrepancias con la ficha de Wikipedia: Cervera 1011 (Wikipedia 1005), Aguilar 897 (892), La Pernía 1108 (1180). Uso el IGN.

**Distancias:** solo `palencia`, del campo "distancia" de la ficha de Wikipedia ES (y del texto en Cervera, Aguilar, Guardo y La Pernía), y `santander` para Aguilar (Wikipedia y aguilardecampooturismo.com, 102 km). **He omitido Madrid y Bilbao en todos**, y Santander en el resto, porque solo los dan calculadoras de rutas. Por ejemplo, mejorruta.com da para Cervera 356 km a Madrid, 172 km a Bilbao y 111 km a Santander, y rome2rio 122 km a Santander. Además, aguilardecampooturismo.com/como-llegar/ trae cifras incoherentes ("Valladolid 47 km", "Madrid 235 km"), así que no la uso para distancias. Brañosera: Wikipedia da "115,67 km al nordeste de Palencia" y "97,8 km de Santander" sin aclarar si es por carretera; omitido.

**comarca_zona:**
- Parque Natural Montaña Palentina (10 municipios: Aguilar, Brañosera, Castrejón de la Peña, Cervera, Dehesa de Montejo, La Pernía, Polentinos, San Cebrián de Mudá, Triollo y Velilla). Fuentes: Wikipedia ES "Parque natural Montaña Palentina", y el anexo I de la Ley 4/2000 consolidada (BOE-A-2000-13439), que nombra Cervera, La Pernía y Brañosera y dice que el límite "penetra en Aguilar de Campoo". Ojo: Terranostrum da una lista de 9 municipios sin La Pernía; el BOE y Wikipedia la incluyen.
- Guardo **no** está en el parque (el límite sigue la raya Velilla–Guardo, según el BOE). Comarca: "Alto Carrión" (Wikipedia ES).
- Aguilar y Pomar: Geoparque Mundial UNESCO Las Loras (2017), según Wikipedia ES. Pomar pertenece a la comarca de La Valdivia (Wikipedia ES).
- "Románico Norte" no lo he usado, porque no he encontrado una fuente que lo defina como zona de un municipio concreto.

**Fuentes de los textos:**
- Cervera: Wikipedia ES "Cervera de Pisuerga" (superficie, 23 pedanías, conjunto histórico BIC 2010, Santa María del Castillo y tabla de Juan de Flandes de 1495, ermita rupestre de San Vicente, museos, fauna, clima 1961-2003); cerveradepisuerga.eu/como-llegar.php (distancias a Aguilar y Guardo, buses, trenes Renfe Aguilar y FEVE Vado); turismocastillayleon.com/es/naturaleza/casa-parque-natural-montana-palentina (Casa del Parque en C/ Plantío s/n, "Zona Oso", Pintojo). Aviso: cerveradepisuerga.eu tiene contenido inyectado (spam de casinos, "HACKERCLAUS TEAM"); los datos de transporte son verosímiles, pero la web está comprometida.
- Aguilar: Wikipedia ES "Aguilar de Campoo" (conjunto histórico 1966, monasterio y Centro de Estudios del Románico, castillo, colegiata, 6 de 7 puertas, puerta de Reinosa con lápida hebrea, Santa Cecilia, puentes, embalse de 1.650 ha, galletas, Geoparque); aguilardecampooturismo.com y /como-llegar/ (comarca de 31 poblaciones, A-67, estación en Camesa de Valdivia con Alvia, estación de autobuses en la Av. de Ronda).
- Guardo: Wikipedia ES "Guardo" (capital del Alto Carrión, distancias a Palencia, León y Cervera, iglesia de San Juan Bautista, pila románica, palacio del Arzobispo Bullón restaurado en 2022, mural de David Esteban, mejor mural del mundo de 2022 según Street Art Cities y Diario Palentino, mercado de los viernes y fiestas); Wikipedia ES "Estación de Guardo" (Renfe Cercanías AM, regional Bilbao–León y Cercanías León).
- La Pernía: Wikipedia ES "La Pernía" (municipio más al norte, 12 núcleos, fusión de 1976, CL-627, patrimonio, rollo de justicia, abadía de Lebanza de 1780); "Colegiata de San Salvador (San Salvador de Cantamuda)" (BIC desde 1993, finales del siglo XII); "Puerto de Piedrasluengas" (1.355 m según el IGN); "Cueva del Cobre" (22 km desde Cervera; el Pisuerga nace en Covarrés). Las vistas a los Picos de Europa salen de birdingplaces.eu y alpinegardensociety.net. Las líneas a la demanda, de cerveradepisuerga.eu.
- Dehesa de Montejo: Wikipedia ES (localidades); FAQ de la Tejeda: escapadarural.com/blog/senda-de-la-tejeda-de-tosande/ y park4night.com/es/place/70783. No he escrito intro porque los hechos verificados no daban para 120 palabras con calidad.
- Brañosera: Wikipedia ES "Brañosera" (carta puebla de 824, Brannia Ossaria, Día del Fuero el 13 de octubre, sierra de Híjar, Valdecebollas, Rubagón, oso y urogallo, Santa Eulalia, San Miguel de 1118, Valberzoso, El Golobar).
- Pomar de Valdivia: Wikipedia ES "Pomar de Valdivia" (14 localidades, enclaves de Cezura y Lastrilla, Geoparque) y "Cueva de los Franceses" (Revilla de Pomar, unos 500 m visitables, centro de recepción de 2009, Canto Hito, mirador de Valcabado a 1,5 km). Sin FAQs.

## Dudas y datos no verificados

- Población actual: no la incluyo (no es un campo del esquema).
- "Tercera población de la provincia" (Guardo, según Wikipedia): no lo uso, porque puede estar desactualizado.
- En las FAQs de osos no doy cifras de población. Las cifras oficiales hablan de unos 120 ejemplares en la subpoblación oriental (2020), pero Ecologistas en Acción las discute.
- Clima de Guardo en Wikipedia: datos dudosos (media de julio de 24 °C); no los uso.
- Distancias de Cervera a Aguilar y Guardo: "unos 25 km" y "unos 35 km" según el CIT; Wikipedia da 32 km de Guardo a Cervera. Las dejo como aproximadas en el texto.
