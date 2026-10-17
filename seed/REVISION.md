# Revisión del lote real (2026-10-17)

Primer lote de contenido real: 7 municipios (40 núcleos), 4 categorías, 5 tipos de recurso, 19 negocios, 6 recursos, 5 rutas, 13 landings y 3 artículos, firmados por Pablo Aguado.

**Cómo se hizo.** Los datos factuales (direcciones, teléfonos, coordenadas, cifras de rutas, altitudes) salen de las fuentes que figuran en `fuente_url` de cada registro, consultadas el 2026-10-17: webs de los negocios, turismocastillayleon.com y el registro de turismo de la Junta, folletos de Patrimonio Natural, IGN/AEMET, Wikipedia y OpenStreetMap. Los textos (descripciones, intros, FAQs, landings y artículos) los redactó Claude a partir de esas fuentes, por encargo expreso de Enol y como excepción a la regla 1 de CLAUDE.md. **Una persona tiene que leerlos antes de lanzar `pnpm seed:prod`.**

## Antes de producción

- [ ] Leer y corregir los textos ES/EN (tono, exactitud, nada copiado).
- [ ] Añadir bio y relación con la zona de Pablo Aguado en el panel (el autor entra solo con el nombre).
- [ ] Revisar las decisiones de abajo y ajustar el JSON si hace falta.
- [ ] `pnpm seed:prod --dry-run` y después `pnpm seed:prod`. Lo cargado no se ve hasta el siguiente despliegue.

## Datos pendientes o dudosos

**Recursos**
- `horario_acceso` y `precio_entrada` vacíos en los 6: ninguna fuente oficial los publica con fecha de 2025–2026. Hay que confirmarlos por teléfono. Datos candidatos sin fecha: Olleros (Fundación Nartex, 616 520 509: mié–dom de septiembre a diciembre, 2 €), Santa Eulalia (1 €, cerrada en invierno; 979 181 858), ROM (7 € general / 4 € reducida; 979 123 053).
- Mirador de Piedrasluengas: la `fuente_url` es Wikipedia porque no hay ficha oficial.
- El tipo `castillos` está creado pero sin recursos (el castillo de Aguilar se puede añadir: OSM 42.796231, -4.263334).

**Rutas**
- Tejeda de Tosande: desnivel oficial 200 m; otras guías dan 350–400 m. Conviene contrastarlo con un GPX propio. Temporada solo `primavera` y `verano` porque la vuelta circular cierra en otoño e invierno (explicado en las FAQs).
- Duraciones tomadas de los folletos; la web de Patrimonio Natural da otras para el Roblón (2,49 h) y el Gigante (2 h).
- Bosque Fósil `apta_carrito: false`: deducido de las escaleras que cita la descripción oficial.
- Folletos de 2007–2016: comprobar que los aparcamientos no han cambiado. Sin GPX ni experiencia propia: añadirlos mejora mucho las fichas.

**Negocios**
- El Parador aparece dos veces (hotel y su restaurante, misma dirección y teléfono) para tener 3 restaurantes en Cervera. Alternativas con menos datos: Hostal Restaurante Pacho (web caída) y El Refugio de Ruesga (sin web).
- El Parador y PNTA están en el núcleo `ventanilla` (Cervera de Pisuerga), según OSM.
- `precio_rango` solo en Taxus (única carta con precios publicada). Falta un criterio para alojamientos y actividades.
- Alfonso Palazuelos (guía de naturaleza, persona física, sin web) va en `borrador`: decidir si se publica.
- PNTA: su web tiene texto de relleno; los datos salen del registro de la Junta. DOSAVES no tiene web propia.
- El Velero de Aguilar: teléfono de su web; el registro de la Junta da otro.
- Las tres casas rurales de Cervera son del mismo propietario. Herreruela de Castillería no aparece con ese nombre en el registro de la Junta (quizá "Casa Castillería").
- Coordenadas aproximadas (centro del pueblo o de la calle): Mesón Añejo, Nune, San Felices, Herreruela, Casa del Diezmo, Palazuelos.
- Discrepancias menores: número de la calle del Valentín (21 en su web, 23 en Turismo CyL) y nombre de la calle del Peñalabra. Los Olmos: la ficha oficial dice que admite perros y su web lo contrario (no se marca).
- Hotel Marqués de Aguilar cerró de diciembre a febrero el invierno pasado.

**Municipios**
- No existe núcleo `la-pernia`: la capital del municipio es San Salvador de Cantamuda.
- Altitudes del IGN (vía AEMET), que no siempre coinciden con Wikipedia. Distancias solo a Palencia (y Santander en Aguilar); Madrid y Bilbao, sin fuente fiable.
- Dehesa de Montejo no tiene intro, así que no tiene página (su núcleo sí sirve para la ruta de Tosande).
- La web de turismo de Cervera (cerveradepisuerga.eu) tiene spam inyectado; no se usó salvo para transporte.

**Artículos**
- Entre 570 y 740 palabras por idioma: la revisión SEO avisa por debajo de 800. Mejor ampliarlos con experiencia propia que con relleno.
- Sin foto de portada.
