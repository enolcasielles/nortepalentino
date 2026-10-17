# DESIGN.md — Norte Palentino

Sistema visual y de interacción del portal. Complementa a [`CLAUDE.md`](CLAUDE.md), que tiene las reglas técnicas, SEO y de contenido. Léelo antes de crear o modificar cualquier componente o plantilla.

> **Dirección visual: producto outdoor.** Moderna, viva y fiable, como una buena app de montaña. Fondo blanco, tarjetas redondeadas con sombra suave, un verde bosque vivo como color de marca, tintes por categoría, curvas de nivel como textura y siluetas de cumbres en los grandes bloques. Los datos siguen ordenados y a la vista. Referencias: Komoot, AllTrails, Airbnb. Usa siempre los tokens con nombre (§3), nunca valores crudos.

---

## 1. Principios

1. **Útil antes que bonito.** El visitante viene a decidir dónde dormir, comer o caminar este fin de semana. Los datos clave van visibles sin hacer scroll ni clic.
2. **Answer-first.** Cada página responde primero (resumen y datos clave) y amplía después (contexto, experiencia, FAQs). Sirve igual a una persona con prisa que a un buscador o un LLM.
3. **Funciona sin fotos.** Las tarjetas y fichas se diseñan para verse completas sin imagen. La foto mejora el resultado, pero no es un requisito. **Nunca** uses fotos de stock genéricas que aparenten ser del lugar.
4. **Mobile-first, de verdad.** El diseño de referencia es un móvil de 360 px con mala cobertura en mitad de la montaña. El escritorio es una ampliación.
5. **Ligero.** HTML y CSS servidos desde el servidor, sin JS salvo en las islas de §7. Si algo se puede hacer con HTML nativo (`<details>`, `<form method="get">`, `<dialog>`), se hace así.
6. **Honesto e independiente.** Nada de sellos que imiten lo institucional. Las fechas de verificación se ven y el aviso de portal independiente está siempre presente.
7. **Familias primero.** Los atributos familiares (niños, carrito, trona…) son información de primer nivel, no letra pequeña.

---

## 2. Voz y tono

**Cercano y experto, de tú.** Como un amigo local que ha hecho cada senda.

- Frases cortas y datos concretos. Se permite una opinión honesta: *"El aparcamiento se llena antes de las 11 en agosto."*
- **Prohibidos** los superlativos vacíos: *paraje incomparable, maravilla, enclave privilegiado, rincón con encanto*.
- **EN:** cálido y práctico, al estilo de las guías de viaje británicas. Con vocabulario del visitante extranjero: *pushchair-friendly*, *family-friendly*, *Romanesque church*, *walking route*.

### Microcopy de UI (referencia)

| Clave | ES | EN |
| :-- | :-- | :-- |
| Verificación | Verificado el 16 oct 2026 | Checked on 16 Oct 2026 |
| Llamar | Llamar | Call |
| Cómo llegar | Cómo llegar | Directions |
| Web | Web oficial del negocio | Business website |
| Mapa | Ver mapa interactivo | Open interactive map |
| Cercanos | Cerca de aquí | Nearby |
| Vacío | Todavía no hemos verificado ningún sitio aquí. | We haven't checked any places here yet. |
| Aviso | Norte Palentino es una guía independiente; no es la web oficial de ningún organismo. | Norte Palentino is an independent guide, not an official tourism website. |

Los textos de UI viven en `lib/i18n/{es,en}.ts`. No escribas literales en los componentes.

---

## 3. Tokens

Se definen como variables CSS en `@theme` (Tailwind v4) en `src/app/(frontend)/globals.css`. **Los componentes usan solo tokens semánticos** (`bg-surface`, `text-muted`), nunca valores crudos (`#2f5d3a`, `text-green-700`).

### 3.1 Color

Contrastes calculados sobre `--color-bg`. Mínimo exigido: 4,5:1 en texto y 3:1 en elementos gráficos y de UI.

**Base**

| Token | Valor | Rol | Contraste |
| :-- | :-- | :-- | :-- |
| `--color-bg` | `#FFFFFF` | Fondo de página | — |
| `--color-surface` | `#FFFFFF` | Tarjetas | — |
| `--color-surface-alt` | `#F3F6F1` | Celdas de datos, FAQs cerradas, notas | — |
| `--color-text` | `#13201A` | Texto principal | 16,8 |
| `--color-text-muted` | `#536159` | Metadatos, texto secundario | 6,5 |
| `--color-border` | `#E1E7E2` | Bordes y anillos de tarjeta (decorativo) | — |
| `--color-border-strong` | `#7F8B84` | Bordes de campos de formulario | 3,5 |
| `--color-primary` | `#17734A` | **Verde bosque.** Marca, botones, enlaces | 5,9 |
| `--color-primary-hover` | `#105C3A` | Hover y activo | 8,0 |
| `--color-primary-contrast` | `#FFFFFF` | Texto sobre primary | 5,9 |
| `--color-primary-soft` | `#E3F1E8` | Fondos tintados, chips | — |
| `--color-ink` | `#0D2A1D` | Fondo del hero de la home y del pie; títulos | 15,4 |
| `--color-ink-muted` | `#B9D3C3` | Texto secundario **sobre `ink`** | 9,6 sobre ink |
| `--color-accent` | `#DD6B1C` | **Naranja atardecer.** Solo gráfico: flechas, sol, comillas, foco | 3,4 ⚠️ no apto para texto |
| `--color-accent-text` | `#B4561A` | Naranja cuando tiene que ser texto | 4,9 |
| `--color-accent-soft` | `#FDF0E5` | Fondo del bloque de experiencia | — |
| `--color-success` | `#2F7D32` | Abierto, disponible, verificado | 5,1 |
| `--color-warning` | `#8A6400` | Avisos (cerrado temporalmente, de temporada) | 5,4 |
| `--color-danger` | `#C0392B` | Errores, cerrado | 5,4 |
| `--color-focus` | `#DD6B1C` | Anillo de foco (2 px + offset 2 px) | 3,4 |

**Categorías.** Cada una tiene color pleno (placa de icono, franja de KeyFacts), `-contrast` (icono o texto encima) y `-soft` (tinte de fondo de la media sin foto y de la cabecera de página, con las curvas de nivel en el color pleno). La categoría **siempre** se identifica también por icono y texto. Algunos tonos plenos no llegan a 4,5:1: úsalos solo en gráficos (`categoryIconColor`), nunca como color de texto.

| Token | Valor | `-contrast` | `-soft` | Categorías |
| :-- | :-- | :-- | :-- | :-- |
| `--color-cat-dormir` | `#2B6CB0` azul lago | `#FFFFFF` | `#E6EFF8` | hotel, casa rural, camping, albergue |
| `--color-cat-comer` | `#C44A2C` teja | `#FFFFFF` | `#FBEBE6` | restaurante, bar, tienda de producto local |
| `--color-cat-activo` | `#E8920C` ámbar | `#13201A` | `#FDF2DF` | turismo activo |
| `--color-cat-rutas` | `#17734A` bosque | `#FFFFFF` | `#E3F1E8` | rutas |
| `--color-cat-romanico` | `#A0643A` arenisca | `#FFFFFF` | `#F6EDE5` | iglesia románica, patrimonio |
| `--color-cat-naturaleza` | `#457D1F` musgo | `#FFFFFF` | `#ECF3E1` | mirador, cascada, espacio natural, fauna |
| `--color-cat-museo` | `#7B4FA0` ciruela | `#FFFFFF` | `#F1EAF6` | museo, centro de interpretación, yacimiento |

`categorias_negocio.color_token` y `tipos_recurso.color_token` guardan uno de estos slugs. Una categoría nueva se asigna a uno de los siete grupos; no se crean colores nuevos.

**Dificultad** (solo para la baliza gráfica, §3.5; la etiqueta se escribe en `--color-text`):

| Token | Valor |
| :-- | :-- |
| `--color-difficulty-facil` | `#2F7D32` |
| `--color-difficulty-moderada` | `#E0A800` (franja con borde `#8A6400`) |
| `--color-difficulty-dificil` | `#C0392B` |

**Solo tema claro.** No hay modo oscuro en la fase 1: se lee mejor al sol. El verde `ink` del hero y el pie es un bloque de marca, no un tema. Como los componentes solo usan tokens semánticos, añadirlo más adelante no obligará a tocarlos.

### 3.2 Tipografía

- **Dos familias.** `Bricolage Grotesque` (700–800) para títulos, cifras de datos clave y el wordmark; `Inter` (400, 500, 600) para el texto y la UI. Se autoalojan con `next/font/google`, `display: swap` y subsets `latin` y `latin-ext`. Son fuentes variables: un fichero por familia y ninguna otra fuente.
- Tokens: `--font-display: "Bricolage Grotesque"`, `--font-body: "Inter"`.
- Títulos con `letter-spacing: -0.02em`, peso 700 y `text-wrap: balance`; el H1 a 800 y `-0.035em`. Títulos en `--color-ink`. Eyebrows con la utilidad `eyebrow` (mayúsculas, `text-xs`, peso 600, `letter-spacing: 0.08em`).
- Escala fluida con `clamp()`: `text-xs`, `sm`, `base` (16–17 px; nunca menos de 16 px en el cuerpo), `lg`, `xl`, `2xl`, `3xl` (H2 de sección), `4xl` (H1) y `5xl` (solo el H1 de la home).
- Longitud de línea de 60–75 caracteres en la prosa (`max-w-prose`).
- Cifras tabulares (`tabular-nums`) en tablas de datos y estadísticas de ruta.

### 3.3 Espacio, forma y elevación

- Espaciado en la escala por defecto de Tailwind (base 4 px).
- **Radios:** `--radius-sm: 6px` (campos, baliza), `--radius-md: 10px` (botones, placas de icono, celdas), `--radius-lg: 16px` (tarjetas, paneles, mapa, FAQs), `--radius-xl: 24px` (bloques grandes) y `--radius-full` (chips, píldoras, enlaces de sección, avatares).
- **Sombra suave en reposo.** Las tarjetas y paneles llevan `--shadow-card` y un anillo de 1 px en `--color-border` (`ring-1 ring-border`). Las clicables suben 2 px y pasan a `--shadow-card-hover` en hover (sin desplazamiento con `prefers-reduced-motion`). `--shadow-overlay` para el menú móvil, la barra de acciones fija y el banner de consentimiento.
- Los enlaces de acción secundarios ("Ver todos", GPX, idioma) son **píldoras** con anillo; los primarios, píldoras o botones rellenos en `primary`.

### 3.4 Layout

- Contenedor: `max-w-6xl` con un *gutter* de 16 px en móvil y 24 px desde `md`. El hero de la home, la cabecera de página (`PageHero`) y el pie van a todo el ancho; su contenido, dentro del contenedor.
- Cabecera fija (`sticky`) con fondo blanco translúcido y `backdrop-blur`; `scroll-padding-top` evita que tape las anclas.
- Breakpoints de Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).
- Ficha y artículo: una columna en móvil, con `KeyFacts` justo bajo la cabecera. Desde `lg`, contenido a la izquierda y una columna lateral `sticky` con datos clave y acciones.
- Rejillas de tarjetas: 1 columna, 2 desde `sm` y 3 desde `lg`.
- Sin scroll horizontal a ningún ancho.

### 3.5 Lenguaje de montaña

El rasgo distintivo de la marca mezcla la cartografía y la señalética de sendero. Se aplica **solo** en estos sitios, para que siga siendo un acento:

1. **Curvas de nivel** (`public/textures/contours.svg`, generadas a partir de un campo de alturas). Se usan con la utilidad `contours`, que las pinta con el color de texto actual mediante una máscara: en la media de las tarjetas sin foto y en `PageHero` (color pleno de la categoría al 20–25 % sobre su `-soft`) y en el hero de la home (blanco al 7 % sobre `ink`). La posición se desplaza por un *hash* del título (`contourOffset`) para que dos tarjetas seguidas no repitan dibujo. Nunca detrás de texto largo ni con más opacidad.
2. **Siluetas de cumbres** (`Ridges`): tres planos de cresta. Cierran el hero de la home (fundiéndose con el fondo blanco) y abren el pie (fundiéndose con `ink`). Ningún otro uso.
3. **`KeyFacts` como panel de inicio de ruta.** Tarjeta blanca con sombra, cabecera de 4 px en el color de la categoría (o `--color-primary`), eyebrow "Datos clave", cifras grandes en `Bricolage Grotesque` 700 `tabular-nums` en celdas `surface-alt` con su unidad en `--color-text-muted`, y filas de definición con separadores finos.
   ```
   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
    DATOS CLAVE
    ┌────────┐ ┌────────┐ ┌────────┐
    │ 6,2 km │ │ +240 m │ │ 2 h 30 │
    └────────┘ └────────┘ └────────┘
    Dificultad      ▬▬ Fácil
    ───────────────────────────────
    Circular        Circular
   ```
4. **`DifficultyMark`: baliza de dificultad.** Una placa de 24×12 px con radio `sm` y dos franjas horizontales (blanco arriba y el color de dificultad abajo), igual que una marca pintada en un árbol, seguida **siempre** de la etiqueta en texto (*Fácil* / *Moderada* / *Difícil*). Nunca aparece sola. En las tarjetas de ruta va en la píldora sobre la media.
5. **`TrailArrow`: flecha direccional.** Una flecha de señal de sendero (SVG propio: placa con punta, no un chevron genérico) en `--color-accent`, para los enlaces "Ver todos →", los enlaces a listados y el paso entre secciones. Al hacer hover se desplaza 2 px.

Las categorías se muestran con una píldora (icono en su color + nombre) sobre la media de la tarjeta y con la placa de icono en `PageHero`.

### 3.6 Logotipo

- **Wordmark** "norte palentino" en minúsculas, `Bricolage Grotesque` 800, `letter-spacing: -0.03em`, en `--color-ink` (blanco sobre `ink`).
- **Símbolo:** tres cumbres anidadas de trazo uniforme y sin relleno, como las curvas de nivel de un perfil de sierra (evocación del Curavacas/Espigüete). SVG propio en `src/components/brand/Wordmark.tsx` (`LogoSymbol`). **Provisional** hasta cerrar el logotipo (§9).
- **Versiones:** horizontal (placa redondeada `primary` con el símbolo en blanco + wordmark) para el header y el pie (placa blanca con símbolo `primary` sobre `ink`); solo símbolo para favicon, `apple-touch-icon`, imagen OG y la página 404.
- **Colores:** verde bosque, `ink` y blanco. Nada más.

## 4. Imágenes e iconos

- Siempre con `next/image`, `sizes` correcto y dimensiones o `aspect-ratio` fijos (CLS 0).
- Proporciones: portada de municipio y ruta **16:9** (21:9 desde `lg`), tarjeta **16:10** (con o sin foto, para que la rejilla no salte) y avatar de autor **1:1**.
- Solo la imagen *hero* lleva `priority`; el resto, `lazy`.
- `alt` obligatorio y descriptivo en cada idioma (*"Iglesia de Santa María la Real en Aguilar de Campoo, fachada oeste"*), nunca *"imagen"* ni el nombre del archivo. Imágenes decorativas con `alt=""`.
- El crédito aparece visible cuando la foto no es propia.
- **Estilo fotográfico, mixto por contexto** (es la guía para quien haga las fotos propias):
  - *Heros* de municipio, artículo y home: **evocadora**. Paisaje amplio, hora dorada o niebla en los valles, con espacio limpio donde no tape el H1. Sin filtros ni HDR exagerado.
  - Fichas de negocio, rutas y recursos: **documental**. Luz natural y encuadres que informan (cómo es el sendero, el comedor, la habitación, el acceso, el aparcamiento). Personas reales de espaldas o en plano general (familias caminando), nunca posados de banco de imágenes.
  - Horizontal siempre. Mínimo 2000 px de lado largo en el original.
- **Mapas estáticos** con el estilo propio de Static Maps: colores desaturados, agua en azul lago apagado, vegetación en verde muy claro, sin puntos de interés de Google. Marcadores en el color de la categoría y polyline de ruta en `--color-primary` con 4 px de grosor.
- **Sin foto:** la tarjeta muestra el tinte `--color-cat-{slug}-soft` con curvas de nivel y el icono de la categoría en una placa de color pleno (`MediaPlaceholder`), y la ficha usa `PageHero` y el **mapa estático** como elementos visuales principales.
- **Ilustración:** solo las curvas de nivel y las siluetas de §3.5, dibujadas por nosotros. Nada de ilustraciones de stock ni de escenas que aparenten ser un lugar concreto.
- Iconos de `lucide-react`, a 20–24 px, con `aria-hidden` si acompañan a un texto. Cada categoría y cada atributo de familia tiene un icono asignado en `lib/icons.ts`.

---

## 5. Componentes

Todos son Server Components salvo los marcados con 🏝 (isla de cliente). Viven en `src/components/` y reciben props tipadas, sin hacer *fetch* por su cuenta salvo los de nivel de página.

### Estructura

- **`SiteHeader`**: fija arriba. Logotipo, navegación principal con dos entradas, **Directorio** (desplegable `<details>` sin JS con los listados que existen: categorías de negocio, Rutas, Qué ver) y **Blog**, buscador compacto (cuando exista la búsqueda) y `LanguageSwitcher`. En móvil, un único menú `<details>` como panel flotante, con el directorio agrupado y el blog debajo. Cabecera, pie y home sacan los enlaces de `components/layout/nav.ts`.
- **`SiteFooter`**: siluetas de cumbres sobre un bloque `ink`. Logotipo y lema, enlaces a listados ("Explora") y municipios, aviso de portal independiente (texto de §2), y más adelante legales, "Sobre nosotros y metodología" y redes.
- **`PageHero`**: cabecera a todo el ancho de toda página salvo la home (prop `hero` de `PageLayout`). Tinte de la categoría con curvas de nivel, migas, placa de icono + eyebrow, H1, resumen answer-first y, opcionalmente, chips (atributos de familia, dificultad…).
- **`Breadcrumbs`**: visibles en todas las páginas salvo la home. Comparten datos con el JSON-LD `BreadcrumbList`.
- **`LanguageSwitcher`**: píldora que enlaza a la URL equivalente localizada; en móvil solo muestra el código (`EN`/`ES`) y el nombre accesible es el texto completo. Si la página no existe en el otro idioma, se oculta.

### Contenido answer-first

- **`AnswerSummary`**: resumen de 2–3 frases bajo el H1. Es la primera respuesta de la página.
- **`KeyFacts`**: lista de definiciones (`<dl>`) con los datos clave según el tipo de página (ver §6), con estilo de panel de inicio de ruta (§3.5). Va en la columna lateral desde `lg` y bajo el resumen en móvil.
- **`DifficultyMark`**: baliza de dificultad con su etiqueta de texto (§3.5).
- **`TrailArrow`**: flecha de señal de sendero para los enlaces de "ver más" y "cerca de aquí" (§3.5).
- **`FamilyAttributes`**: chips con icono y texto de los atributos de familia. Solo se muestran los presentes; nunca se pinta la ausencia de un atributo.
- **`VerifiedNote`**: píldora discreta con icono de calendario, *"Verificado el {fecha}"* y enlace a la fuente cuando procede. Sin insignias que parezcan un sello oficial.
- **`AuthorByline`**: avatar, nombre (enlace a la página del autor), *"Actualizado el {fecha}"*.
- **`FaqList`**: `<details>`/`<summary>` nativos en tarjetas separadas, con un botón `+` que gira al abrir, bajo un H2 *"Preguntas frecuentes"*. Las respuestas se ven completas en el HTML.
- **`Prose`**: texto de un `textarea` de Payload en párrafos (descripciones, intros, experiencia propia).
- **`RichText`**: cuerpo Lexical de los artículos, renderizado en servidor: H2/H3 con id (para el índice), listas, citas, imágenes de `media` y negrita/cursiva. Los **enlaces internos** se resuelven en el idioma de la página y se pintan subrayados en `primary`; si el destino no existe, queda el texto sin enlace. El bloque **`ficha`** se pinta con la tarjeta de su tipo (`BusinessCard`, `RouteCard`, `SightCard`), a un máximo de `max-w-md`.
- **`BlogMentions`**: sección *"Lo contamos en el blog"* en fichas y municipios, con hasta 3 `ArticleCard` de los artículos que los enlazan.
- **`ExperienceBlock`**: bloque en `accent-soft` con comillas en `accent` para la *experiencia propia* (*"Lo hicimos en octubre con dos niños de 4 y 7 años…"*), firmado.

### Tarjetas

`MunicipioCard`, `BusinessCard`, `RouteCard`, `SightCard` y `ArticleCard` comparten la anatomía **`Card`**: media 16:10 (foto o `MediaPlaceholder`) con píldora de categoría → título (enlace; toda la tarjeta es clicable mediante un pseudo-elemento) → lugar con icono → 1–3 datos clave → chips. Ejemplos:

- `BusinessCard`: píldora de categoría, núcleo, precio (`€€`) y atributos de familia.
- `RouteCard`: baliza de dificultad en la píldora; distancia, desnivel y duración con icono; chips "niños" y "carrito".
- `ArticleCard`: píldora "Blog" con icono de libro, foto de portada o placeholder, fecha de publicación y minutos de lectura.

### Acción y navegación

- **`ContactActions`**: Llamar (`tel:`), Cómo llegar (enlace a Google Maps con las coordenadas) y Web. Botones grandes (48 px de alto) en fila y fijos en la parte inferior de la ficha en móvil; apilados bajo `KeyFacts` desde `lg`. Cada clic se registra como evento de analítica.
- **`FilterBar`**: `<form method="get">` con selects y checkboxes con forma de píldora (se marcan con `:has(:checked)`, sin JS). Funciona sin JS; se pliega en un `<details>`. Muestra los filtros activos como chips eliminables (enlaces).
- **`NearbyList`**: "Dormir cerca", "Comer cerca", "Rutas desde aquí", con 3–6 tarjetas compactas.
- **`SearchBox`**: `<form action="/{locale}/buscar">` con `<input type="search">`, sin autocompletado en el MVP.
- **`EmptyState`**: solo para la búsqueda sin resultados y los filtros sin coincidencias. Los listados vacíos no existen (CLAUDE.md §7.4).

### Islas de cliente 🏝 (lista cerrada)

- 🏝 **`MapFacade`**: muestra una imagen estática de Static Maps con marcadores o polyline y un botón *"Ver mapa interactivo"*. Al pulsarlo, carga la JS API y monta el mapa en el mismo hueco, con las mismas dimensiones (CLS 0).
- 🏝 **`ConsentBanner`**: `vanilla-cookieconsent`, con "Aceptar" y "Rechazar" del mismo tamaño y peso, y un enlace a la configuración en el pie.
- 🏝 **`AnalyticsEvents`**: delegación de clics para los eventos salientes.

Añadir una isla nueva requiere justificarla y añadirla a esta lista.

---

## 6. Anatomía de páginas

El orden es vinculante. Los bloques entre [corchetes] son condicionales.

### Home `/es`
Resumen de las dos secciones del sitio. No es la página que trae el tráfico, pero es la carta de presentación.
1. Hero a todo el ancho sobre `ink`: curvas de nivel, sol de atardecer en `accent`, eyebrow *"Guía independiente"*, H1 con propuesta de valor (*Guía de la Montaña Palentina*), entradilla, [`SearchBox`] y los **accesos rápidos** como píldoras blancas con icono: Directorio (ancla a la sección) · [Rutas con niños] · [Blog]. Se cierra con las siluetas de cumbres. Con foto propia, la foto sustituye al fondo `ink` (con velo para el contraste).
2. **Directorio**: H2 con entradilla y una rejilla de accesos (placa de color de la categoría con icono, nombre y número de sitios) a cada listado que existe: categorías de negocio, Rutas y Qué ver.
3. **Del blog**: los 3 artículos más recientes (`ArticleCard`), enlace al índice si existe.
4. Municipios (rejilla de `MunicipioCard`).
5. Rutas (3 `RouteCard`, enlace al listado).
6. Qué ver (3 `SightCard`, enlace al listado).
7. `MapFacade` de la comarca.
8. Bloque *"Quiénes somos"* breve, con enlace a la metodología.
9. [FAQs generales].

### Municipio `/es/{municipio}`
`PageHero` (H1 *"{Municipio}: qué ver, dónde dormir y comer"* + `AnswerSummary`) → `KeyFacts` (comarca, altitud, distancia desde Palencia, Santander, Madrid y Bilbao si hay dato) → [Experiencia] → Qué ver (`SightCard`) → Dónde dormir → Dónde comer → Rutas desde aquí. Cada sección muestra 3–6 tarjetas y enlaza a su listado si existe → `MapFacade` → [`BlogMentions`] → `FaqList` → `AuthorByline`.

### Listado `/es/{municipio}/{categoria}` · `/es/{categoria}` · landing de filtro
`PageHero` (H1 *"Restaurantes en Cervera de Pisuerga"*, intro de la `landing` answer-first y número de sitios) → `FilterBar` → rejilla de tarjetas (orden: `orden` manual y luego alfabético; nunca por pago en la fase 1) → `MapFacade` con todos los puntos → `FaqList` → enlaces a la misma categoría en municipios vecinos.

### Ficha de negocio
`PageHero` (eyebrow categoría · núcleo, municipio → H1 nombre → `FamilyAttributes`) → `KeyFacts` (dirección, teléfono, horario, rango de precio, web) → `ContactActions` → `AnswerSummary` (descripción) → `MapFacade` → [fotos] → `VerifiedNote` → `NearbyList` → [`BlogMentions`].

### Ficha de ruta
`PageHero` (H1 → `AnswerSummary` → chips de dificultad, circular, niños y carrito) → `KeyFacts` **destacado** (distancia, desnivel, duración, dificultad, circular, apta para niños y carrito, temporada, punto de inicio) → **Premio final** (qué hay al llegar, el gancho familiar) → `MapFacade` con polyline y descarga del GPX → Descripción → `ExperienceBlock` → `NearbyList` (comer y dormir cerca del inicio) → [`BlogMentions`] → `FaqList` → `AuthorByline` + `VerifiedNote`.

### Recurso (qué ver)
`PageHero` (eyebrow tipo · lugar → H1 → `AnswerSummary`) → `KeyFacts` (tipo, horario y acceso, precio de entrada, ubicación) → Descripción → `MapFacade` → `VerifiedNote` → `NearbyList` → [`BlogMentions`].

### Artículo `/es/blog/{articulo}`
`PageHero` (eyebrow *Blog* → H1 → `AnswerSummary` → `AuthorByline` + minutos de lectura) → [foto de portada 16:9, `priority`] → `RichText` con enlaces al directorio y tarjetas incrustadas, con el índice (si hay más de 3 H2) en columna lateral `sticky` desde `lg` y arriba en móvil → *"Sitios que aparecen en este artículo"* (tarjetas de las fichas enlazadas que no van ya incrustadas) → `FaqList` → *"Más artículos"* (3, primero los que comparten fichas).

### Blog `/es/blog`
`PageHero` (H1, intro de la `landing` y número de artículos) → rejilla de `ArticleCard`, del más reciente al más antiguo → `FaqList` → `AuthorByline`.

### Autor
Foto, nombre, bio y relación con la zona → enlaces → contenido firmado.

### Búsqueda
`SearchBox` con la consulta → resultados agrupados por tipo → `EmptyState` con sugerencias.

---

## 7. Accesibilidad (WCAG 2.2 AA)

- Un solo `<h1>` por página y jerarquía de encabezados sin saltos. Landmarks: `header`, `nav`, `main`, `footer`.
- Foco visible siempre (`focus-visible` con un anillo de token propio) y orden de tabulación lógico. Enlace "Saltar al contenido".
- Objetivos táctiles de 44×44 px como mínimo.
- El color nunca es el único portador de información: dificultad y categoría siempre llevan texto o icono.
- `lang` correcto en `<html>`; los fragmentos en otro idioma llevan su propio `lang`.
- Respetar `prefers-reduced-motion` (sin desplazamientos ni zoom en hover). Animaciones mínimas: solo transiciones de 150–300 ms en hover y foco.
- Las tablas de datos usan `<dl>` o `<table>` semántica, nunca `div`s.

---

## 8. Qué no hacer

- ❌ Carruseles, sliders, *parallax* o vídeo de fondo.
- ❌ Modales o popups (newsletter, app…) aparte del banner de consentimiento.
- ❌ *Infinite scroll*.
- ❌ Texto dentro de imágenes.
- ❌ Fotos de stock o de otros portales.
- ❌ Contenido oculto tras pestañas o acordeones que requieran JS (las FAQ usan `<details>`, que es HTML nativo).
- ❌ Colores, tamaños o fuentes fuera de los tokens.
- ❌ Insignias o estilos que sugieran que somos la web oficial.
- ❌ Destacar visualmente negocios por pago durante la fase 1.

---

## 9. Pendiente

- [ ] Cerrar el símbolo y el wordmark definitivos (el actual, de cumbres anidadas, es provisional).
- [ ] Favicon, `apple-touch-icon` y plantilla de imagen OG (`next/og`): símbolo y título sobre `--color-primary` o `--color-bg`.
- [ ] Definir el JSON de estilo de Google Static Maps según §4.
- [ ] Comprobar "Norte Palentino" en la OEPM antes de cerrar el logotipo.
