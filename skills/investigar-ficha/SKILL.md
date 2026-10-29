---
name: investigar-ficha
description: Verifica en fuentes los datos de un negocio, ruta o recurso (contacto, horario, coordenadas, cifras) y crea o actualiza su borrador en Norte Palentino. Para añadir, reverificar o inventariar.
---

# Investigar y verificar una ficha

Conviertes "añade X" en un borrador del CMS de Norte Palentino que solo contiene **datos comprobados en una fuente**, con su procedencia. Trabajas con la extensión **Norte Palentino CMS** (herramientas `referencias`, `buscar`, `leer`, `esquema`, `crear`, `actualizar`, `revisar`) y con la búsqueda web. Las reglas generales de la extensión siguen vigentes; aquí está el proceso.

Lo que no haces: descripciones, resúmenes, FAQs, intros ni fotos. Eso es de la skill `redactar-ficha`. Tampoco publicas: todo queda en borrador.

## Modos

| El editor dice | Modo |
| :-- | :-- |
| "Añade el restaurante X", "mete la ruta Y" | **Ficha nueva** |
| "Revisa los datos de X", "¿sigue abierto X?", "completa el horario de X", un enlace caído o una verificación caducada de `mantenimiento` | **Reverificar** |
| "Todos los restaurantes de Aguilar", "¿qué alojamientos nos faltan en Guardo?" | **Inventario** |

## Fuentes: qué vale y en qué orden

Usa la fuente más alta disponible para cada dato. Un dato que solo aparece en una fuente no admitida se queda vacío.

**Negocios y recursos**
1. Web propia del negocio o del recurso.
2. Fuentes oficiales: ayuntamiento, Junta de Castilla y León y su portal de turismo, Diputación de Palencia, Parque Natural Montaña Palentina, Fundación Santa María la Real, diócesis o la entidad que gestione el monumento.
3. Ficha de Google Business (Google Maps) del propio negocio, **solo** para dirección, teléfono y horario, y solo si no hay web propia que los dé.

TripAdvisor, Booking, Tenedor, redes sociales de terceros, blogs y portales turísticos privados **nunca** son fuente: sirven como pista para encontrar la fuente buena. Los perfiles de redes sociales del propio negocio sí valen para confirmar que sigue abierto.

**Cifras de rutas** (distancia, desnivel, duración, dificultad, circular)
1. Fuente oficial: Parque Natural, panel o ficha del sendero homologado (PR, GR, SL), ayuntamiento.
2. Track propio del editor (si te da un GPX o sus datos).
3. Wikiloc, blogs de montaña u otras webs de rutas, citando el track o la página concreta.

Nunca estimes una cifra ni la calcules a partir de otras (duración a partir de distancia, por ejemplo). Si no aparece, va vacía y la ruta no se podrá publicar hasta tenerla.

**Coordenadas**: solo si la fuente las da (o un enlace de mapa con coordenadas explícitas) o si el editor pega el pin. Nunca las geocodifiques "a ojo" desde la dirección. Formato: grados decimales, lat 42.3–43.3, lng -5.3 – -3.7. Si faltan, avisa: sin ellas no hay mapa ni "cerca de aquí".

## Proceso: ficha nueva

1. **Orientarte.** Con `referencias`, identifica el núcleo (no el municipio: el municipio se deriva), la categoría (negocios) o el tipo (recursos) y sus slugs. Si el sitio está en un núcleo que no existe, para y díselo al editor.
2. **Comprobar que no existe.** `buscar` por nombre y por municipio, sin filtrar por estado (los borradores cuentan). Si ya existe, pasa al modo reverificar.
3. **Buscar fuentes.** Localiza la web propia y las oficiales. Usa la búsqueda web; abre las páginas y lee los datos en ellas, no en el fragmento del buscador.
4. **Extraer los datos** campo a campo (lista por tipo más abajo) y enséñaselos al editor en una tabla:

   | Campo | Valor | Fuente |
   | :-- | :-- | :-- |
   | Teléfono | +34 979 00 00 00 | web propia |
   | Horario | — | no publicado en ninguna fuente admitida |

   Señala aparte las **discrepancias** entre fuentes (dos horarios distintos, 8 km frente a 9,5 km) con las dos versiones y sus URLs. No elijas tú: decide el editor.
5. **Guardar** con `crear`, en borrador, cuando el editor dé el visto bueno a la tabla (en un lote, basta con el visto bueno al lote). Pon:
   - `fuente_url`: la fuente principal, la que aporta más datos. Si hay varias, menciona las demás en tu resumen.
   - `fecha_verificacion`: la fecha de hoy (AAAA-MM-DD), el día en que leíste la fuente.
   - El nombre tal como lo escribe el propio negocio o la fuente oficial. Sin slug: se genera solo.
6. **Informar** al editor: id y slug, qué campos quedan vacíos y por qué, qué falta para publicar (`revisar`) y el siguiente paso: redactar la ficha con `redactar-ficha`.

### Campos por tipo

**Negocio** (`negocios`): `nombre`, `categoria`, `nucleo`, `direccion`, `coordenadas`, `telefono` (formato `+34 979 000 000`), `email`, `web`, `horario_texto` ({es, en}: el horario tal cual, sin redactar; en inglés con formato inglés de días y horas), `precio_rango` (€ a €€€€, solo si la fuente da precios o carta con precios), `atributos_familia`.

Los `atributos_familia` (`admite-ninos`, `cuna`, `trona`, `menu-infantil`, `accesible-carrito`, `jardin-cerrado`, `admite-mascotas`, `parking`, `chimenea`) solo se marcan si la fuente lo dice expresamente. "Ambiente familiar" no es `admite-ninos`; una foto de una chimenea sí es `chimenea` solo si es del propio negocio.

**Ruta** (`rutas`): `nombre` ({es, en}), `distancia_km`, `desnivel_m` (positivo acumulado), `duracion_h`, `dificultad` (`facil`, `moderada`, `dificil`: la que da la fuente; si la fuente usa otra escala, propón la equivalencia al editor), `circular`, `apta_ninos` y `apta_carrito` (solo si la fuente lo dice o el editor lo afirma por experiencia), `temporada`, `inicio_nucleo`, `inicio_coordenadas`, `gpx` (si el editor da el fichero: `subir_gpx` desde su ruta local).

**Recurso** (`recursos`): `nombre` ({es, en}), `tipo`, `nucleo`, `coordenadas`, `horario_acceso` ({es, en}: horario y cómo se accede, por ejemplo "llave en el bar de la plaza"), `precio_entrada` ({es, en}).

Usa `esquema` si dudas de un campo: manda sobre esta lista.

## Proceso: reverificar

1. `leer` la ficha. Abre su `fuente_url` y, si hace falta, busca fuentes nuevas.
2. Compara campo a campo y enseña solo los cambios: `campo | antes | ahora | fuente`. Incluye lo que no has podido comprobar.
3. Señales de cierre (web caída o en venta, "cerrado definitivamente" en Google, anuncio en redes): no borres ni despubliques nada. Avisa al editor con las pruebas y que decida.
4. Con el visto bueno, `actualizar` solo los campos que cambian, más `fecha_verificacion` con la fecha de hoy (y `fuente_url` si la fuente principal es otra). Si todo coincide, actualiza solo la fecha.

No toques los textos redactados (`descripcion`, `resumen`, FAQs). Si un cambio de datos los deja desfasados (cambió el horario que se menciona en la descripción), díselo al editor.

## Proceso: inventario

1. Busca en las fuentes oficiales (registro de turismo de Castilla y León, web del ayuntamiento) y en la web lo que existe de esa categoría en ese municipio o zona.
2. Cruza con `buscar` y presenta tres listas: **ya está** (con su estado), **falta** (con la fuente donde aparece) y **dudoso** (posiblemente cerrado, fuera de la zona o de otra categoría).
3. El editor elige cuáles crear. Después, aplica el proceso de ficha nueva a cada una, enseñando las tablas por bloques para que la revisión sea manejable.

## Reglas que no se saltan

- Un campo sin fuente admitida va vacío. Prefiere una ficha incompleta a un dato inventado.
- Nada de nombres con "[DEMO]" ni de datos de ejemplo.
- Nunca cambies `estado` a publicado: lo hace `revisar-publicacion` cuando el editor lo pida.
- No copies textos de las fuentes en campos de texto libre. Los datos (teléfono, horario) sí se transcriben.
