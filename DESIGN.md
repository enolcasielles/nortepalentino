# DESIGN.md — Norte Palentino

Sistema visual y de interacción del portal. Complementa a [`CLAUDE.md`](CLAUDE.md), que tiene las reglas técnicas, SEO y de contenido. Léelo antes de crear o modificar cualquier componente o plantilla.

> **Dirección visual: guía de campo moderna.** Sobria, clara y fiable, como una buena guía de montaña o un mapa bien hecho. Mucho fondo claro, datos ordenados, un verde haya como color de marca y detalles tomados de la señalética de sendero. Referencias: Komoot, guías Cicerone, Ordnance Survey. Usa siempre los tokens con nombre (§3), nunca valores crudos.

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
| `--color-bg` | `#FAFAF7` | Fondo de página (blanco papel) | — |
| `--color-surface` | `#FFFFFF` | Tarjetas | — |
| `--color-surface-alt` | `#F1F0EA` | Paneles de datos, FAQs, pie | — |
| `--color-text` | `#1C2321` | Texto principal | 15,3 |
| `--color-text-muted` | `#5A6360` | Metadatos, texto secundario | 5,9 |
| `--color-border` | `#DAD8CF` | Bordes y separadores (decorativo) | — |
| `--color-border-strong` | `#8C918C` | Bordes de campos de formulario | 3,2 |
| `--color-primary` | `#2F5D3A` | **Verde haya.** Marca, botones, enlaces | 7,3 |
| `--color-primary-hover` | `#244A2E` | Hover y activo | 9,6 |
| `--color-primary-contrast` | `#FFFFFF` | Texto sobre primary | 7,6 |
| `--color-primary-soft` | `#E6EEE6` | Fondos tintados, chips activos | — |
| `--color-accent` | `#C8762B` | **Ocre de otoño.** Solo gráfico: iconos, subrayados, flechas, detalles | 3,3 ⚠️ no apto para texto |
| `--color-accent-text` | `#9A5518` | Ocre cuando tiene que ser texto | 5,5 |
| `--color-success` | `#3F7A3A` | Abierto, disponible | 5,0 |
| `--color-warning` | `#8A6A00` | Avisos (cerrado temporalmente, de temporada) | 4,9 |
| `--color-danger` | `#B3362B` | Errores, cerrado | 5,8 |
| `--color-focus` | `#C8762B` | Anillo de foco (2 px + offset 2 px) | 3,3 |

**Categorías** (paleta terrosa). Se usan como franja, placa o fondo de icono. El texto o icono encima usa `-contrast`. Como los colores son apagados, la categoría **siempre** se identifica también por icono y texto.

| Token | Valor | `-contrast` | Categorías |
| :-- | :-- | :-- | :-- |
| `--color-cat-dormir` | `#3E5C76` pizarra | `#FFFFFF` | hotel, casa rural, camping, albergue |
| `--color-cat-comer` | `#A4462F` teja | `#FFFFFF` | restaurante, bar, tienda de producto local |
| `--color-cat-activo` | `#C8762B` ocre | `#1C2321` | turismo activo |
| `--color-cat-rutas` | `#2F5D3A` haya | `#FFFFFF` | rutas |
| `--color-cat-romanico` | `#7A5A44` arenisca | `#FFFFFF` | iglesia románica, patrimonio |
| `--color-cat-naturaleza` | `#5B7B3A` musgo | `#FFFFFF` | mirador, cascada, espacio natural, fauna |
| `--color-cat-museo` | `#5E4B6B` ciruela | `#FFFFFF` | museo, centro de interpretación, yacimiento |

`categorias_negocio.color_token` y `tipos_recurso.color_token` guardan uno de estos slugs. Una categoría nueva se asigna a uno de los siete grupos; no se crean colores nuevos.

**Dificultad** (solo para la baliza gráfica, §3.5; la etiqueta se escribe en `--color-text`):

| Token | Valor |
| :-- | :-- |
| `--color-difficulty-facil` | `#3F7A3A` |
| `--color-difficulty-moderada` | `#D9A300` (franja con borde `#8A6A00`) |
| `--color-difficulty-dificil` | `#B3362B` |

**Solo tema claro.** No hay modo oscuro en la fase 1: es lo propio de una guía de campo y se lee mejor al sol. Como los componentes solo usan tokens semánticos, añadirlo más adelante no obligará a tocarlos.

### 3.2 Tipografía

- **Una sola superfamilia: Inter.** `Inter Tight` (600–700) para títulos, cifras de datos clave y el wordmark; `Inter` (400, 500, 600) para el texto y la UI. Se autoalojan con `next/font/google`, `display: swap` y subsets `latin` y `latin-ext`. Son fuentes variables: un fichero por familia y ninguna otra fuente.
- Tokens: `--font-display: "Inter Tight"`, `--font-body: "Inter"`.
- Títulos con `letter-spacing: -0.01em` (H1 `-0.02em`). Eyebrows y etiquetas de placa en mayúsculas con `letter-spacing: 0.06em`, `text-xs`, peso 600.
- Escala fluida con `clamp()`: `text-xs`, `sm`, `base` (16–17 px; nunca menos de 16 px en el cuerpo), `lg`, `xl`, `2xl`, `3xl`, `4xl`.
- Longitud de línea de 60–75 caracteres en la prosa (`max-w-prose`).
- Cifras tabulares (`tabular-nums`) en tablas de datos y estadísticas de ruta.

### 3.3 Espacio, forma y elevación

- Espaciado en la escala por defecto de Tailwind (base 4 px).
- **Radios:** `--radius-sm: 4px` (campos, placas, baliza), `--radius-md: 8px` (tarjetas, botones, paneles), `--radius-lg: 12px` (hero, mapa) y `--radius-full` (chips en píldora, avatares).
- **Bordes antes que sombras.** Las tarjetas llevan un borde de 1 px en `--color-border` y ninguna sombra en reposo. `--shadow-card: 0 2px 8px rgb(28 35 33 / 0.08)` solo en hover de tarjetas clicables; `--shadow-overlay: 0 8px 24px rgb(28 35 33 / 0.16)` para el menú móvil y el banner de consentimiento.

### 3.4 Layout

- Contenedor: `max-w-6xl` con un *gutter* de 16 px en móvil y 24 px desde `md`.
- Breakpoints de Tailwind (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).
- Ficha y artículo: una columna en móvil. Desde `lg`, contenido a la izquierda y una columna lateral fija con datos clave y acciones.
- Rejillas de tarjetas: 1 columna, 2 desde `sm` y 3 desde `lg`.
- Sin scroll horizontal a ningún ancho.

### 3.5 Lenguaje de señalética

El rasgo distintivo de la marca toma prestados recursos de la señalización de senderos. Se aplica **solo** en estos tres sitios, para que siga siendo un acento:

1. **`KeyFacts` como panel de inicio de ruta.** El panel informativo del arranque de un sendero: cabecera de 4 px en el color de la categoría (o `--color-primary`), fondo `--color-surface-alt`, cifras grandes en `Inter Tight` 600 `tabular-nums` con su unidad en `--color-text-muted`, separadores finos entre filas y radio `md`.
   ```
   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
    6,2 km      +240 m     2 h 30
    distancia   desnivel   duración
   ─────────────────────────────────
    ▬▬ Fácil · Circular · Apta carrito
   ```
2. **`DifficultyMark`: baliza de dificultad.** Una placa de 24×12 px con radio `sm` y dos franjas horizontales (blanco arriba y el color de dificultad abajo), igual que una marca pintada en un árbol, seguida **siempre** de la etiqueta en texto (*Fácil* / *Moderada* / *Difícil*). Nunca aparece sola.
3. **`TrailArrow`: flecha direccional.** Una flecha de señal de sendero (SVG propio: placa con punta, no un chevron genérico) en `--color-accent`, para los enlaces "Ver todos →", "Cerca de aquí" y el paso entre secciones. Al hacer hover se desplaza 2 px.

Las categorías **no** usan placas: se muestran con eyebrow de texto e icono (§5, tarjetas).

### 3.6 Logotipo

- **Wordmark** "norte palentino" en minúsculas, `Inter Tight` 700, `letter-spacing: -0.02em` y color `--color-primary`. Con subtítulo opcional (*Guía de la Montaña Palentina* / *Mountains, villages & Romanesque of northern Spain*) en `Inter` 500, `--color-text-muted`.
- **Símbolo:** 3–4 curvas de nivel concéntricas que forman una cumbre (evocación del Curavacas/Espigüete), con un trazo uniforme y sin relleno. Se dibuja como SVG propio en `src/components/brand/`.
- **Versiones:** horizontal (símbolo + wordmark) para el header, solo wordmark para usos estrechos, y solo símbolo para favicon, `apple-touch-icon` e imagen OG.
- **Colores:** verde haya sobre claro y blanco sobre verde haya. Nada más.
- El símbolo de curvas de nivel **no** se usa como textura de fondo ni como patrón decorativo.

---

## 4. Imágenes e iconos

- Siempre con `next/image`, `sizes` correcto y dimensiones o `aspect-ratio` fijos (CLS 0).
- Proporciones: portada de municipio y ruta **16:9** (21:9 desde `lg`), tarjeta **4:3** y avatar de autor **1:1**.
- Solo la imagen *hero* lleva `priority`; el resto, `lazy`.
- `alt` obligatorio y descriptivo en cada idioma (*"Iglesia de Santa María la Real en Aguilar de Campoo, fachada oeste"*), nunca *"imagen"* ni el nombre del archivo. Imágenes decorativas con `alt=""`.
- El crédito aparece visible cuando la foto no es propia.
- **Estilo fotográfico, mixto por contexto** (es la guía para quien haga las fotos propias):
  - *Heros* de municipio, plan y home: **evocadora**. Paisaje amplio, hora dorada o niebla en los valles, con espacio limpio donde no tape el H1. Sin filtros ni HDR exagerado.
  - Fichas de negocio, rutas y recursos: **documental**. Luz natural y encuadres que informan (cómo es el sendero, el comedor, la habitación, el acceso, el aparcamiento). Personas reales de espaldas o en plano general (familias caminando), nunca posados de banco de imágenes.
  - Horizontal siempre. Mínimo 2000 px de lado largo en el original.
- **Mapas estáticos** con el estilo propio de Static Maps: colores desaturados, agua en azul pizarra apagado, vegetación en verde muy claro, sin puntos de interés de Google. Marcadores en el color de la categoría y polyline de ruta en `--color-primary` con 4 px de grosor.
- **Sin foto:** la tarjeta muestra una franja de color `--color-cat-{slug}` con el icono de la categoría, y la ficha usa el **mapa estático** como elemento visual principal.
- Iconos de `lucide-react`, a 20–24 px, con `aria-hidden` si acompañan a un texto. Cada categoría y cada atributo de familia tiene un icono asignado en `lib/icons.ts`.

---

## 5. Componentes

Todos son Server Components salvo los marcados con 🏝 (isla de cliente). Viven en `src/components/` y reciben props tipadas, sin hacer *fetch* por su cuenta salvo los de nivel de página.

### Estructura

- **`SiteHeader`**: logotipo, navegación principal (Dónde dormir · Dónde comer · Qué hacer · Rutas · Qué ver · Planes), buscador compacto y `LanguageSwitcher`. En móvil, el menú se abre con `<details>` sin JS.
- **`SiteFooter`**: aviso de portal independiente (texto de §2), enlaces a municipios y categorías, legales, "Sobre nosotros y metodología" y redes.
- **`Breadcrumbs`**: visibles en todas las páginas salvo la home. Comparten datos con el JSON-LD `BreadcrumbList`.
- **`LanguageSwitcher`**: enlaza a la URL equivalente localizada. Si no existe en el otro idioma, se oculta.

### Contenido answer-first

- **`AnswerSummary`**: resumen de 2–3 frases bajo el H1. Es la primera respuesta de la página.
- **`KeyFacts`**: lista de definiciones (`<dl>`) con los datos clave según el tipo de página (ver §6), con estilo de panel de inicio de ruta (§3.5). Va en la columna lateral desde `lg` y bajo el resumen en móvil.
- **`DifficultyMark`**: baliza de dificultad con su etiqueta de texto (§3.5).
- **`TrailArrow`**: flecha de señal de sendero para los enlaces de "ver más" y "cerca de aquí" (§3.5).
- **`FamilyAttributes`**: chips con icono y texto de los atributos de familia. Solo se muestran los presentes; nunca se pinta la ausencia de un atributo.
- **`VerifiedNote`**: *"Verificado el {fecha}"* con enlace a la fuente cuando procede.
- **`AuthorByline`**: avatar, nombre (enlace a la página del autor), *"Actualizado el {fecha}"*.
- **`FaqList`**: `<details>`/`<summary>` nativos, con un H2 *"Preguntas frecuentes"*. Las respuestas se ven completas en el HTML.
- **`Prose`**: estilo para rich text de Payload (planes, experiencia propia).
- **`ExperienceBlock`**: bloque diferenciado visualmente para la *experiencia propia* (*"Lo hicimos en octubre con dos niños de 4 y 7 años…"*), firmado.

### Tarjetas

`MunicipioCard`, `BusinessCard`, `RouteCard`, `SightCard` y `PlanCard` comparten la anatomía **`Card`**: media (foto o franja de categoría) → eyebrow (categoría · núcleo) → título (enlace; toda la tarjeta es clicable mediante un pseudo-elemento) → 1–3 datos clave → chips. Ejemplos:

- `BusinessCard`: precio (`€€`), núcleo y atributos de familia.
- `RouteCard`: distancia, desnivel, duración, dificultad y chips "niños" y "carrito".

### Acción y navegación

- **`ContactActions`**: Llamar (`tel:`), Cómo llegar (enlace a Google Maps con las coordenadas) y Web. Botones grandes (mín. 44×44 px) y fijos en la parte inferior de la ficha en móvil. Cada clic se registra como evento de analítica.
- **`FilterBar`**: `<form method="get">` con selects y checkboxes. Funciona sin JS; en móvil se pliega en un `<details>`. Muestra los filtros activos como chips eliminables (enlaces).
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
1. Hero: H1 con propuesta de valor (*Guía de la Montaña Palentina*), `SearchBox` y una foto propia si existe.
2. Accesos por intención: Dormir · Comer · Rutas con niños · Románico · Turismo activo · Fauna.
3. Planes destacados (3 `PlanCard`).
4. Municipios (rejilla de `MunicipioCard`).
5. `MapFacade` de la comarca.
6. Bloque *"Quiénes somos"* breve, con enlace a la metodología.
7. [FAQs generales].

### Municipio `/es/{municipio}`
H1 *"{Municipio}: qué ver, dónde dormir y comer"* → `AnswerSummary` → `KeyFacts` (comarca, altitud, distancia desde Palencia, Santander, Madrid y Bilbao si hay dato) → [Experiencia] → Qué ver (`SightCard`) → Dónde dormir → Dónde comer → Rutas desde aquí. Cada sección muestra 3–6 tarjetas y enlaza a su listado si existe → `MapFacade` → `FaqList` → `AuthorByline`.

### Listado `/es/{municipio}/{categoria}` · `/es/{categoria}` · landing de filtro
H1 *"Restaurantes en Cervera de Pisuerga"* → intro de la `landing` (answer-first) → `FilterBar` → rejilla de tarjetas (orden: `orden` manual y luego alfabético; nunca por pago en la fase 1) → `MapFacade` con todos los puntos → `FaqList` → enlaces a la misma categoría en municipios vecinos.

### Ficha de negocio
H1 nombre → eyebrow (categoría · núcleo, municipio) → `AnswerSummary` (descripción) → `KeyFacts` (dirección, teléfono, horario, rango de precio, web) → `FamilyAttributes` → `ContactActions` → `MapFacade` → [fotos] → `VerifiedNote` → `NearbyList`.

### Ficha de ruta
H1 → `AnswerSummary` → `KeyFacts` **destacado** (distancia, desnivel, duración, dificultad, circular, apta para niños y carrito, temporada, punto de inicio) → **Premio final** (qué hay al llegar, el gancho familiar) → `MapFacade` con polyline y descarga del GPX → Descripción → `ExperienceBlock` → `NearbyList` (comer y dormir cerca del inicio) → `FaqList` → `AuthorByline` + `VerifiedNote`.

### Recurso (qué ver)
H1 → `AnswerSummary` → `KeyFacts` (tipo, horario y acceso, precio de entrada, ubicación) → Descripción → `MapFacade` → `NearbyList` → `VerifiedNote`.

### Plan
H1 → `AuthorByline` → `AnswerSummary` → índice (si hay más de 3 H2) → `Prose` con tarjetas incrustadas de rutas, negocios y recursos → `FaqList`.

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
- Respetar `prefers-reduced-motion`. Animaciones mínimas: solo transiciones de 150–200 ms en hover y foco.
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

- [ ] Dibujar el símbolo de curvas de nivel y componer el wordmark definitivo (SVG).
- [ ] Favicon, `apple-touch-icon` y plantilla de imagen OG (`next/og`): símbolo y título sobre `--color-primary` o `--color-bg`.
- [ ] Definir el JSON de estilo de Google Static Maps según §4.
- [ ] Comprobar "Norte Palentino" en la OEPM antes de cerrar el logotipo.
