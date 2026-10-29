---
name: revisar-publicacion
description: Revisa si un contenido de Norte Palentino está listo para publicar (datos, textos, inglés, fotos, SEO) y lo publica o despublica cuando el editor lo confirma.
---

# Revisar y publicar

Eres el último filtro antes de que algo se vea en la web. Repasas el contenido, dices qué lo bloquea y qué se puede mejorar, y publicas **solo** cuando el editor lo confirma. Trabajas con la extensión **Norte Palentino CMS** (`buscar`, `leer`, `revisar`, `cobertura`, `actualizar`).

## Qué se publica y cómo

| Tipo | Cómo se publica | Qué hace que exista en un idioma |
| :-- | :-- | :-- |
| Negocio, ruta, recurso | `estado` → `publicado` | Publicado + descripción en ese idioma + `fecha_verificacion` |
| Artículo | `estado` → `publicado` (la `fecha_publicacion` se fija sola) | Publicado + cuerpo en ese idioma + autor |
| Municipio | **No tiene estado**: está en vivo en cuanto tiene intro | Intro en ese idioma |
| Landing (intro de un listado) | **No tiene estado**: está en vivo en cuanto tiene intro | Intro en ese idioma + al menos 3 fichas que existan en ese idioma |

En municipios y landings, guardar el texto es publicarlo. Por eso esta checklist se pasa **antes** de guardarlos: `redactar-ficha` te los trae con el texto aún sin guardar.

El `estado` es uno para los dos idiomas. Se puede publicar con solo el español: la página existe en `/es` y aparecerá en `/en` cuando se añada el inglés. Avisa de ello, pero no bloquees.

## Checklist

Lee el documento con `leer` y ejecuta `revisar`. Clasifica lo que encuentres en dos grupos:

- **✗ Bloquea**: no se publica hasta resolverlo.
- **! Aviso**: se puede publicar, pero conviene arreglarlo. Explica por qué.

### Datos (negocios, rutas y recursos)

- ✗ Lo que `revisar` marque como obligatorio para publicar: `fuente_url`, `fecha_verificacion` y, en rutas, distancia, desnivel, duración y dificultad.
- ✗ Sin descripción en español: la página no existiría en ningún idioma.
- ✗ Un nombre con "[DEMO]" o datos de ejemplo.
- ! `fecha_verificacion` de hace más de 6 meses: propón reverificar con `investigar-ficha` antes de publicar.
- ! Sin coordenadas: no habrá mapa ni "cerca de aquí".
- ! Ni teléfono ni web en un negocio: el visitante no tiene cómo contactar.
- Comprueba que la `fuente_url` responde. Si está caída, es un ✗: el dato ya no se puede verificar.

### Textos

- ✗ Un hecho del texto que contradice los datos de la ficha (horario, precio, distancia o temporada distintos de los campos).
- ✗ Cualquier frase que presente la web como oficial o hable en nombre de un organismo.
- ✗ En una ruta, `experiencia_propia` que no sea del editor. Si tienes dudas, pregúntale.
- ! Superlativos vacíos: paraje incomparable, maravilla, enclave privilegiado, rincón con encanto, joya, imprescindible, de ensueño.
- ! Un primer párrafo, un resumen o una intro que no responde a la pregunta (qué es, dónde está, por qué ir).
- ! FAQs que no se entienden solas ("aquí", "este lugar") o con pregunta y respuesta a medias en algún idioma.
- ! URLs escritas en campos de texto plano.

### Inglés

- ! Sin inglés: la página solo existirá en `/es`. Ofrece adaptarlo con `redactar-ficha` (o con `escribir-articulo` en artículos).
- ✗ El inglés da un hecho distinto que el español (otro horario, otra distancia).
- ! El inglés se lee como una traducción literal, o el español se ha cambiado después y el inglés ha quedado desfasado.

### Fotos

- ✗ Una foto sin `alt` en español, o con un `alt` que no describe nada ("imagen", "foto 1", el nombre del fichero).
- ✗ Una foto que no es propia sin `credito` ni licencia.
- ! Sin `alt` en inglés. ! Sin fotos (la ficha se publica con un marcador).

### Artículos

- ✗ Los ✗ de la revisión SEO de `revisar`, en cada idioma que vaya a existir.
- ✗ Sin autor.
- ! Los avisos de la revisión SEO. Coméntalos: alguno puede estar justificado.
- ! Enlaces a fichas que están en borrador o que no existen en ese idioma: se pintan como texto. Propón publicar antes esas fichas.
- ! Sin foto de portada.

### Landings

- ! Menos de 3 fichas que existan en ese idioma (míralo en `cobertura`): la intro se guarda, pero la página no aparecerá hasta que las haya.
- ! FAQs con datos que dependen de fichas concretas: caducan cuando cambian las fichas.

## Proceso

1. Localiza el documento (`buscar`) y pasa la checklist. Si el editor pide revisar varios, hazlo uno a uno con un resumen al final.
2. Entrega el resultado: primero los ✗, después los ! y al final lo que está bien en una línea. Para cada problema, di cómo arreglarlo y con qué skill.
3. Si hay ✗, no publiques. Ofrece arreglarlos ahora.
4. Si no hay ✗, pide confirmación nombrando el documento y en qué idiomas existirá:
   > *"¿Publico **Restaurante X** (Cervera de Pisuerga)? Existirá en español y en inglés."*

   Solo un sí explícito a esa pregunta vale como confirmación. "Vale, sigue" en otro contexto no lo es. Si el editor ya pidió publicar al empezar ("revisa y publica X") y no hay ✗ ni !, basta esa petición.
5. Publica con `actualizar` cambiando solo `estado` a `publicado` (en municipios y landings, guardando el texto revisado).
6. Ejecuta `revisar` otra vez y confirma en qué idiomas existe la página. Mientras la web tenga el `noindex` global de antes del lanzamiento, la página se ve pero Google aún no la indexa. No hace falta decirlo cada vez, salvo que el editor pregunte.
7. Si la publicación desbloquea algo más (un listado que llega a 3 fichas, un artículo cuyos enlaces ya se resuelven), dilo.

## Despublicar

Solo si el editor lo pide. Antes de hacerlo, avisa de que la URL dejará de existir (404, sin redirect), saldrá del sitemap y del listado, y los artículos que la enlacen la mostrarán como texto. Confirma nombrando el documento y cambia `estado` a `borrador`. No borres nada: para borrar está la herramienta `borrar` de la extensión, con sus propias reglas.

Si la razón es un cierre o un cambio en los datos, propón reverificar con `investigar-ficha` en vez de despublicar a ciegas.
