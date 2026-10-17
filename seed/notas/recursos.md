# Notas: tipos_recurso.json y recursos.json

Verificado el 2026-10-17. Los dos ficheros pasan `tipoRecursoSchema` / `recursoSchema` de `seed/schema.ts` (validado con tsx, sin tocar el repo).

## tipos_recurso.json
Los 5 tipos pedidos. Todos los `tipo_schema` están en `sightSchemaTypes`, los `color_token` en `colorTokens` y los `icono` en `categoryIconKeys` (iglesia, museo, mirador, cascada, castillo).
`castillos` no tiene todavía ningún recurso (ver más abajo).

## Núcleos usados (hay que darlos de alta en municipios.json)

| slug | nombre | municipio | lat | lng | fuente |
|---|---|---|---|---|---|
| san-salvador-de-cantamuda | San Salvador de Cantamuda | la-pernia | 42.964771 | -4.498339 | OSM/Nominatim (village, "La Pernía") |
| piedrasluengas | Piedrasluengas | la-pernia | 43.037112 | -4.457803 | OSM/Nominatim (hamlet, "La Pernía") |
| olleros-de-pisuerga | Olleros de Pisuerga | aguilar-de-campoo | 42.744279 | -4.287907 | OSM/Nominatim (hamlet, "Aguilar de Campoo") |
| barrio-de-santa-maria | Barrio de Santa María | aguilar-de-campoo | 42.812906 | -4.379702 | OSM/Nominatim (hamlet, "Aguilar de Campoo") |
| aguilar-de-campoo | Aguilar de Campoo (cabecera) | aguilar-de-campoo | 42.792837 | -4.260544 | OSM/Nominatim (town) |
| revilla-de-pomar | Revilla de Pomar | pomar-de-valdivia | 42.771105 | -4.151883 | OSM/Nominatim (hamlet, "Pomar de Valdivia") |

La pertenencia municipal sale de OSM y se confirma en las fichas de turismocastillayleon.com (Olleros, Barrio de Santa María "(Aguilar de Campoo)") y spain.info / terranostrum (Piedrasluengas y San Salvador "La Pernía").

## Fuentes y coordenadas por registro

1. **Colegiata de San Salvador de Cantamuda** (iglesias-romanicas, La Pernía)
   - Texto: spain.info (Turespaña) https://www.spain.info/es/lugares-interes/iglesia-san-salvador-pernia/ : planta, ábsides, campanario, portadas, pórtico moderno. Que hoy es parroquia: terranostrum (secundaria).
   - Coordenadas: centro del edificio "Iglesia de San Salvador" en OSM (way 289868142).
   - Horario y precio: **omitidos**. No hay horario oficial. Gronze publica "11:00–14:00 y 17:00–19:00", pero sin fecha ni fuente oficial.
   - No he incluido la fecha de BIC (4/2/1993), la fundación por la condesa María Elvira ni la datación (finales del XII y comienzos del XIII; 1185 según otra fuente), porque solo salen de portales secundarios y las fechas no coinciden. Si se confirman en romanicodigital o en el BOCyL, se pueden añadir.

2. **Ermita rupestre de los Santos Justo y Pastor** (iglesias-romanicas, Olleros de Pisuerga, Aguilar)
   - Texto, coordenadas (42.745, -4.285242, del enlace "Cómo llegar") y gestión por la Fundación Nartex: turismocastillayleon.com (Junta).
   - Horario y precio: **omitidos**, porque la ficha oficial no tiene fecha. Datos candidatos: del 16/9 al 8/12, mié, jue y dom 11–14; vie y sáb 11–14 y 16–18:30; cerrado del 9/12 al 28/2; entrada 2 €. Contacto: 616 520 509, fundacionnartex@artepalencia.es. Antes de añadirlos, confírmalos en artepalencia.es.

3. **Ermita de Santa Eulalia (Barrio de Santa María)** (iglesias-romanicas, Aguilar)
   - Texto y coordenadas (42.810346, -4.375483, "Cómo llegar"): turismocastillayleon.com (Junta). Dirección: C/ Iglesia 32.
   - Horario y precio: **omitidos**. La Junta solo dice "1 €" y "cerrado en invierno", sin horario ni año. Teléfonos: ermita 979 181 858; oficina de turismo de Aguilar 979 123 641.
   - Terranostrum la da como BIC (20/01/1966) y del siglo XII. No lo he incluido porque solo sale de esa fuente secundaria.

4. **ROM, Románico y Territorio (Monasterio de Santa María la Real)** (museos, Aguilar cabecera)
   - Texto del ROM: ficha "Museo del Románico" de la Junta. Historia del monasterio: ficha "Monasterio de Santa María la Real" de la Junta (https://www.turismocastillayleon.com/es/patrimonio-cultura/monasterio-santa-maria-real).
   - Coordenadas: 42.795967, -4.272051 (Junta, "Cómo llegar"; OSM da casi lo mismo).
   - Horario y precio: **omitidos**. Lo único fechado en 2026 es el folleto de Semana Santa 2026 (ROM abierto de lunes a domingo, 10–14 y 16–20, solo del 2 al 5 de abril). La ficha general de la Junta no tiene fecha y sus datos son incoherentes: del 12/9 al 8/12, mar–vie 16–20, sáb, dom y festivos 10–14 y 16–20; tarifa general 7 € / reducida 4 €, pero también "visita guiada 7 € / libre 4 €"; menores de 10 años gratis. Contacto: 979 123 053 / 616 994 651, rom@santamarialareal.org. La web santamarialareal.org no publica ahora una página de visitas (la URL del ROM que enlaza la Junta da 404).
   - Nombre EN: "ROM Romanesque Centre (Santa María la Real Monastery)" es redacción propia, no un nombre oficial en inglés.

5. **Mirador de Piedrasluengas** (miradores, Piedrasluengas, La Pernía)
   - Texto: Wikipedia ES "Puerto de Piedrasluengas": mirador de madera, vistas a Peña Labra, Cuchillón, Tres Mares y Liébana, CL-627 / CA-184, carretera a Polaciones, Parque Natural Montaña Palentina. 1.355 m: ficha de Wikipedia, birdingplaces.eu y alpinegardensociety.net (el texto de Wikipedia dice 1.390 m como cota máxima; he usado 1.355). Hayedo bajo el puerto: birdingplaces. Peña Labra 2.018 m y punto de partida desde el puerto: Wikipedia EN "Peña Labra".
   - Coordenadas: nodo OSM "Mirador de Piedrasluengas" (43.041638, -4.458513).
   - No hay ficha de la Junta ni de la Diputación para este mirador. La `fuente_url` es Wikipedia: cámbiala si aparece una oficial.
   - Horario y precio omitidos. Es un mirador junto a la carretera, pero ninguna fuente dice "acceso libre" de forma expresa.

6. **Cascada de Covalagua** (cascadas, Revilla de Pomar, Pomar de Valdivia)
   - Texto: Junta, ficha "Paisaje Protegido y Monumento Natural Covalagua" (caída de 20 m, mejor con lluvia o deshielo, Cueva de los Franceses, Mirador de Valcabado, fauna y vegetación). Que en la cueva nace el río Ivia, los peldaños de toba y la protección desde 1991 (Ley 8/1991): Wikipedia ES "Covalagua". Que el páramo de la Lora está entre Palencia y Burgos: terranostrum.
   - Coordenadas: nodo OSM 2548146413 "Covalagua" (waterway=waterfall).
   - Horario y precio omitidos (ninguna fuente los da).

## Decisiones y dudas
- **Cascada del Mazobre:** está junto a Cardaño de Arriba, en **Velilla del Río Carrión**, que **no** está en la lista de municipios fijada. Descartada.
- **Pozo de los Humos:** está en **Salamanca** (Arribes del Duero), no en Palencia. Descartado. En su lugar he puesto **Covalagua**, que está en Pomar de Valdivia y sí está en la lista.
- **Castillo de Aguilar:** no lo he incluido (era opcional), así que el tipo `castillos` queda vacío. OSM lo sitúa en 42.796231, -4.263334 por si se añade después.
- **`horario_acceso` y `precio_entrada` están vacíos en los 6 registros:** ninguna fuente oficial publica estos datos con fecha de 2025/2026 (ver los datos candidatos arriba). Conviene que una persona los confirme por teléfono antes de rellenarlos.
- Todos van con `estado: "publicado"`: tienen `fuente_url` y `fecha_verificacion`, que es lo que exige el contrato.
