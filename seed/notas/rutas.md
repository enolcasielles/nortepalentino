# rutas.json: notas de investigación

Cinco rutas, todas de la red oficial de uso público del Parque Natural Montaña Palentina (códigos P2, P4, P5, P8 y P10 de la Junta de Castilla y León). Tres son `apta_ninos: true`: Roblón, Bosque Fósil y Gigante. Las cinco están en `publicado` y pasan `rutaSchema` (validado con `seed/schema.ts` vía tsx). El JSON parsea.

Las cifras salen de los folletos oficiales PDF (Junta de CyL / Patrimonio Natural, alojados en patrimonionatural.org) y de las fichas de turismocastillayleon.com. Los folletos tienen el texto vectorizado, así que los leí renderizando las páginas. Las coordenadas de inicio son las del enlace "Cómo llegar" (`destination=`) de cada ficha de turismocastillayleon.com.

He descartado varias candidatas del encargo:
- **Cañón de la Horadada y Las Tuerces:** solo encontré cifras en terranostrum y escapadarural, ninguna fuente oficial.
- **Pozo de los Humos, Ruesga y Monte Bernorio:** no las he investigado.
- **Cascada de Mazobre:** está en Cardaño (Velilla del Río Carrión), fuera de la lista de municipios.

## Núcleos usados

| slug | nombre | municipio | lat | lng | fuente |
|---|---|---|---|---|---|
| estalaya | Estalaya | cervera-de-pisuerga | 42.9279766 | -4.4749111 | Nominatim/OSM. Municipio según es.wikipedia "Estalaya" y la ficha JCyL P8 ("Estalaya (Cervera de Pisuerga)") |
| verdena | Verdeña | cervera-de-pisuerga | 42.9429264 | -4.4623518 | Nominatim/OSM. Municipio según es.wikipedia "Verdeña" y la ficha JCyL P5 |
| santibanez-de-resoba | Santibáñez de Resoba | cervera-de-pisuerga | 42.9090404 | -4.6078831 | Nominatim/OSM. Municipio según es.wikipedia "Santibáñez de Resoba" y la ficha JCyL P10 |
| dehesa-de-montejo | Dehesa de Montejo (cabecera) | dehesa-de-montejo | 42.8207429 | -4.5108875 | Nominatim/OSM |
| santa-maria-de-redondo | Santa María de Redondo | la-pernia | 42.9904813 | -4.4343530 | Nominatim/OSM (devuelve municipio La Pernía). Lo confirman es.wikipedia y la ficha JCyL P2 |

## Fuentes y decisiones por ruta

### 1. Senda del Roblón de Estalaya (P8)
- **fuente_url:** el folleto oficial https://patrimonionatural.org/ficheros/El_Roblon.pdf. Da 4,6 km, 1 h 30 min, 125 m, dificultad baja, circular, "pista y senda", todo el año.
- **Ficha JCyL** https://www.turismocastillayleon.com/es/naturaleza/p8-senda-roblon-estalaya: 4,6 km, 125 m, baja, circular y "Recorrido apto para familias", que es la base de `apta_ninos`. De ella salen las coordenadas de inicio (42.924446, -4.471898).
- **Discrepancia en la duración:** la web de Patrimonio Natural (https://patrimonionatural.org/senderos/senda-del-roblon-de-estalaya) dice "4,64 km (2.49 horas)". He usado 1,5 h, la del folleto oficial, que concuerda con la distancia y el desnivel.
- **Discrepancia en la edad:** JCyL dice "más de 800 años". El folleto dice "más de 500, algunos expertos opinan 800". El texto usa lo del folleto.
- **apta_carrito omitido:** la ruta tiene cancela y paso canadiense con paso lateral, y ninguna fuente dice nada sobre carritos.

### 2. Senda del Bosque Fósil (P5), Verdeña
- **fuente_url:** https://patrimonionatural.org/senderos/senda-del-bosque-fosil. Da 3 km, 1 h, 120 m, baja, circular, todo el año y salida desde el aparcamiento de Verdeña.
- **Folleto** https://patrimonionatural.org/ficheros/sendabosquefosilverdenapdf140111_131636.pdf: confirma esos datos y aporta la descripción (escaleras y pasadizo al salir del pueblo, los tres miradores y la Casa del Oso en Verdeña).
- **Ficha JCyL P5** (https://www.turismocastillayleon.com/es/naturaleza/p5-senda-bosque-fosil): dice "Experiencia apta para familias". De ella salen las coordenadas (42.941469, -4.461132).
- **apta_carrito: false:** lo deduzco de las escaleras que menciona la descripción oficial. Revísalo si prefieres omitirlo.

### 3. Senda del Gigante del Valle Estrecho (P10)
- **fuente_url:** el folleto https://patrimonionatural.org/ficheros/5e7112e99cc33_Folleto-Senda-del-Gigante-del-Valle-Estrecho.pdf (versión 1/2016). Da 1 h 6 min, 113 m de subida y 113 de bajada, 4,4 km, lineal, todo el año y aparcamiento en el km 15,5 de la "ruta de los pantanos". Dice además que es "una buena forma de iniciar a los más jóvenes", que es la base de `apta_ninos`.
- **Ficha JCyL P10:** 4,4 km, 113 m, baja, lineal. Coordenadas: 42.905555, -4.627777.
- **Distancia de ida y vuelta:** el perfil del folleto es simétrico (de 0 a ~4.400 m) y la vuelta es "por el mismo camino", así que los 4,4 km son el total. `circular: false`.
- **Discrepancia en la duración:** Patrimonio Natural web dice 4,00 km y 2 h. He usado el folleto: 4,4 km y 1,1 h (1 h 6 min).

### 4. Senda de la Tejeda de Tosande (P4)
- **fuente_url:** el folleto https://patrimonionatural.org/ficheros/folletosendatosandepdf240512_091402.pdf (Junta de CyL). Da media, 10,5 km, 3 h 30 min, 200 m de desnivel y sentido circular.
- **Ficha JCyL P4:** 10,5 km, 200 m, media, circular. Coordenadas: 42.825387, -4.516822.
- **Discrepancias en las cifras:**
  - La web de Patrimonio Natural dice 11 km y 3 h.
  - Terranostrum da 400 m y escapadarural ~350 m de desnivel.
  - El propio perfil del folleto va de ~1.100 a >1.400 m, así que los 200 m oficiales parecen bajos.
  - He usado la cifra oficial (200 m), pero conviene contrastarla con un GPX propio.
- **Restricciones estacionales (folleto):** el circuito completo solo se puede hacer en primavera y verano. En otoño e invierno se va del aparcamiento al mirador y se vuelve por el mismo camino. Los días de batida la senda cierra entera.
  - Por eso `temporada` es `["primavera","verano"]`.
  - El teléfono de la Casa del Parque, 979 87 06 88, sale del folleto (2010). Coincide con el 979 870 688 del folleto del Gigante (2016).
- **apta_ninos y apta_carrito omitidos:** la dificultad oficial es media y son 10,5 km. Escapadarural la llama "apta para niños", pero no es una fuente oficial, así que no lo he afirmado.

### 5. Senda de Fuente Cobre, nacimiento del Pisuerga (P2)
- **fuente_url:** https://www.turismocastillayleon.com/es/naturaleza/p2-senda-fuente-cobre-nacimiento-rio-pisuerga. Da 13 km, 400 m, media, circular y salida en el aparcamiento de Santa María de Redondo. Coordenadas: 42.991648, -4.428119, a unos 500 m al este del núcleo según OSM, coherente con "a las afueras".
- **Folleto** https://patrimonionatural.org/ficheros/sendafuentecobrepdf240512_091321.pdf: confirma media, 13 km, 4 h 30 min, 400 m y circular, y aporta la descripción (pasarelas, chozo, piedras de molino, Colla Cobre y vistas a Picos).
- **Discrepancia en la distancia:** terranostrum da 11,6 km e iso-maps 8,29 km con 669 m. He usado la oficial.
- **Campos omitidos:**
  - `temporada`: ninguna fuente oficial da época recomendada.
  - `apta_ninos` y `apta_carrito`: ninguna fuente dice nada al respecto.
- **FAQ del perro:** sale del pictograma de normativa del folleto ("Lleve a sus animales de compañía controlados").

## Dudas y pendientes
- Ninguna ruta lleva `gpx`, `autor` ni `experiencia_propia`, como se pidió.
- **Fechas de los folletos:** son de 2007-2016, y no he podido comprobar sobre el terreno si los aparcamientos o la señalización han cambiado. Las fichas JCyL actuales coinciden en distancias y desniveles.
- **Duraciones de Patrimonio Natural:** las de la web (2.49 h el Roblón, 2 h el Gigante) contradicen sus propios folletos. Siempre he usado el folleto.
- **Núcleos nuevos:** hay que crear estalaya, verdena y santibanez-de-resoba (Cervera de Pisuerga), santa-maria-de-redondo (La Pernía) y la cabecera dehesa-de-montejo en `municipios.json` antes de importar.
