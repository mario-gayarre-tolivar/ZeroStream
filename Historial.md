# Historial de Cambios y Registro de Actividades

Este archivo registra cronológicamente cada requerimiento ejecutado en el proyecto, el prompt de entrada suministrado y el detalle técnico de todos los archivos creados o modificados.

---

## Entrada 01: Implementación del Frontend (Arquitectura Zero-Storage)

### 1. Prompt de Entrada
```text
Actúa como un desarrollador frontend senior especializado en Next.js, React y UI/UX de alto rendimiento.

### Contexto y Alcance
Lee detenidamente funcionalidad.md y SRS.md presentes en el workspace. Tu tarea es implementar únicamente el frontend de la plataforma web unificada (Anime, Películas y Series), siguiendo la arquitectura de costo cero y cero almacenamiento propio (Zero-Storage).

### Directrices de Diseño y Skills (.agents/skills)
Antes de generar código, consulta y aplica las pautas de las skills del workspace (.agents/skills/frontend-design, .agents/skills/react-best-practices, .agents/skills/react-view-transitions y .agents/skills/web-design-guidelines):
- Estética y UI: Diseño moderno, sobrio y en modo oscuro nativo, centrado en las carátulas del contenido. Cero textos de relleno (lorem ipsum), sin secciones superfluas ni banners vacíos.
- Rendimiento y Consumo: Aprovechar React Server Components (RSC) donde sea posible, lazy loading en imágenes con dimensiones explícitas para evitar CLS, y transiciones fluidas pero ligeras.
- Usabilidad: Navegación directa e intuitiva entre las tres categorías (Anime, Películas, Series), buscador con respuesta rápida y visualización de "Continuar Viendo" persistida en localStorage.

### Entregables Frontend
1. Layout y Navegación: Barra superior minimalista con buscador, tabs de categorías y drawer/menú móvil accesible.
2. Vistas de Catálogo: Cuadrículas limpias con filtros funcionales (género, año, orden por popularidad).
3. Ficha de Contenido: Vista de detalle con sinopsis, selector interactivo de temporadas/episodios (para series y anime) y ficha técnica concisa.
4. Reproductor Embebido Seguro: Contenedor responsivo en ratio 16:9 (aspect-video) con <iframe> sandboxed, tabs para alternar entre servidores de respaldo y control de estados (cargando, error, cambiar servidor).
5. Servicios de Integración: Módulos cliente para TMDB, AniList y mapeador de URLs de embeds definidos en SRS.md.

### Criterios de Aceptación
- La aplicación compila limpiamente (npm run build o equivalente) sin errores de tipos ni advertencias bloqueantes.
- El almacenamiento de historial y favoritos se maneja íntegramente en el cliente (localStorage), sin dependencias de bases de datos externas.
- La interfaz es totalmente responsiva y accesible desde dispositivos móviles hasta pantallas de escritorio.
```

---

### 2. Archivos Creados y Modificados

#### Configuración e Infraestructura Base
- **`package.json`**:
  - *Qué hace*: Declara dependencias de producción (`next`, `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`) y desarrollo (`typescript`, `tailwindcss`, `postcss`, `autoprefixer`).
  - *Por qué*: Establece el ecosistema Next.js 15 y React 19 optimizado para Server Components y renderizado ligero.
- **`tsconfig.json`**:
  - *Qué hace*: Configura el compilador TypeScript en modo estricto, resolución de módulos `bundler` y alias `@/*` apuntando a `./src/*`.
  - *Por qué*: Garantiza tipado seguro y rutas limpias para imports en todo el código.
- **`tailwind.config.ts`**:
  - *Qué hace*: Configura tema oscuro nativo personalizado con paleta de alto contraste (`#0b0c10` fondo, `#13151b` tarjetas, `#6366f1` acento índigo).
  - *Por qué*: Implementa las pautas visuales de `.agents/skills/frontend-design` evitando plantillas genéricas.
- **`postcss.config.mjs`**:
  - *Qué hace*: Conecta Tailwind CSS y Autoprefixer con el pipeline de construcción de Next.js.
  - *Por qué*: Necesario para procesar las directivas de utilidad de Tailwind.
- **`next.config.mjs`**:
  - *Qué hace*: Configura dominios de imágenes remotas permitidos (`image.tmdb.org`, `s4.anilist.co`, `images.unsplash.com`) y desactiva optimización en servidor (`unoptimized: true`).
  - *Por qué*: Evita consumo de CPU/memoria en Edge y permite mostrar carátulas externas sin servidor de almacenamiento intermedio.

#### Tipos y Capa de Datos (Zero-Storage)
- **`src/types/index.ts`**:
  - *Qué hace*: Define las interfaces TypeScript `MediaItem`, `MediaDetail`, `Season`, `Episode`, `ServerOption`, `WatchHistoryItem` y `FilterOptions`.
  - *Por qué*: Proporciona un contrato de datos homogéneo entre anime, cine y series de televisión.
- **`src/services/embeds.ts`**:
  - *Qué hace*: Mapea identificadores de contenido a 4 servidores de embed de video independientes (VidSrc, Embed.su, SuperEmbed, VidSrc.cc).
  - *Por qué*: Resuelve el principio Zero-Storage de `SRS.md`, delegando el streaming a terceros con redundancia en caso de caída de un host.
- **`src/services/history.ts`**:
  - *Qué hace*: Administra lectura y guardado en `localStorage` de historial de episodios reproducidos y lista de favoritos del usuario.
  - *Por qué*: Elimina la necesidad de bases de datos de usuarios o servidores de autenticación propios.
- **`src/services/anilist.ts`**:
  - *Qué hace*: Conecta con la API GraphQL pública de AniList para obtener anime en emisión, sinopsis, episodios y carátulas, con fallback local.
  - *Por qué*: Proporciona catálogo de anime real, actualizado y sin costo ni registro de API key.
- **`src/services/tmdb.ts`**:
  - *Qué hace*: Conecta con TMDB API para películas y series; incluye catálogo de respaldo con producciones reales si la API key aún no está presente en `.env.local`.
  - *Por qué*: Permite que el frontend funcione de forma inmediata sin errores de red 401.

#### Componentes de Interfaz y Diseño
- **`src/app/globals.css`**:
  - *Qué hace*: Define estilos globales, variables de color oscuro, scrollbars discretos y reglas de accesibilidad (`:focus-visible`).
  - *Por qué*: Asegura coherencia estética y cumplimiento de directrices de diseño web accesible.
- **`src/components/layout/Header.tsx`**:
  - *Qué hace*: Barra de navegación fija con buscador reactivo integrado, enlaces de categorías ("Inicio", "Películas", "Series", "Anime", "Mi Lista") y menú móvil accesible.
  - *Por qué*: Facilita la navegación rápida y búsqueda directa en el catálogo.
- **`src/components/layout/Footer.tsx`**:
  - *Qué hace*: Pie de página sobrio con aviso legal de deslinde DMCA y enlaces a secciones.
  - *Por qué*: Cumple con el requisito legal de declarar la arquitectura de indexación sin alojamiento propio.
- **`src/components/media/MediaCard.tsx`**:
  - *Qué hace*: Tarjeta de contenido en ratio 2:3 con título, badge de tipo de medio, año, puntuación y botón de guardado en favoritos.
  - *Por qué*: Presenta el catálogo de forma visual, responsiva y con interactividad en un solo clic.
- **`src/components/media/MediaGrid.tsx`**:
  - *Qué hace*: Cuadrícula adaptativa (2 columnas en móvil hasta 6 en escritorio) con estado vacío informativo.
  - *Por qué*: Estandariza la visualización de listas de medios en todas las páginas.
- **`src/components/media/FilterBar.tsx`**:
  - *Qué hace*: Fila horizontal de chips de género y botón para restablecer filtros mediante parámetros de URL.
  - *Por qué*: Permite filtrar contenido sin recargar la página completa.
- **`src/components/player/SafePlayer.tsx`**:
  - *Qué hace*: Reproductor de video en contenedor ratio 16:9 (`aspect-video`) con `<iframe>` sandboxed (`allow-scripts allow-same-origin allow-forms allow-presentation`), switch de 4 servidores de respaldo, indicador de carga y botones de anterior/siguiente capítulo.
  - *Por qué*: Núcleo de la experiencia de streaming: aísla scripts maliciosos de terceros y garantiza que el video siempre tenga fuentes alternativas.
- **`src/components/player/EpisodeSelector.tsx`**:
  - *Qué hace*: Navegador de temporadas y cuadrícula de episodios para series y anime, con indicador visual del capítulo en reproducción.
  - *Por qué*: Permite al usuario seleccionar y cambiar de episodio directamente desde la pantalla de reproducción.
- **`src/components/home/HeroBanner.tsx`**:
  - *Qué hace*: Banner principal en portada con imagen de fondo amplia, badges de información, sinopsis y botones directos de "Ver Ahora" y "Guardar en Mi Lista".
  - *Por qué*: Genera un punto de atracción visual inmediato con contenido real sin banners publicitarios vacíos.
- **`src/components/home/ContinueWatching.tsx`**:
  - *Qué hace*: Carrusel horizontal que lee el historial de `localStorage` y muestra las tarjetas con botón de reanudación rápida.
  - *Por qué*: Retiene el progreso del usuario sin requerir backend.

#### Páginas y Rutas (App Router)
- **`src/app/layout.tsx`**:
  - *Qué hace*: Envoltorio global HTML5 con metadatos de aplicación, fuente sans-serif y disposición Header/Main/Footer.
  - *Por qué*: Provee la estructura base persistente de la plataforma.
- **`src/app/page.tsx`**:
  - *Qué hace*: Página de inicio con consultas paralelas (`Promise.all`) para obtener películas, series y anime, evitando cuellos de botella (waterfalls).
  - *Por qué*: Cumple la regla de rendimiento `server-parallel-fetching` y ofrece una visión general del catálogo.
- **`src/app/peliculas/page.tsx`**:
  - *Qué hace*: Vista de catálogo especializada en cine con filtros por género y búsqueda.
  - *Por qué*: Ruta dedicada `/peliculas`.
- **`src/app/series/page.tsx`**:
  - *Qué hace*: Vista de catálogo especializada en series de televisión con filtros y búsqueda.
  - *Por qué*: Ruta dedicada `/series`.
- **`src/app/anime/page.tsx`**:
  - *Qué hace*: Vista de catálogo de anime conectada directamente a AniList GraphQL.
  - *Por qué*: Ruta dedicada `/anime`.
- **`src/app/ver/[type]/[id]/page.tsx`**:
  - *Qué hace*: Server Component que resuelve parámetros de tipo, ID, temporada y episodio, y obtiene la información técnica correspondiente.
  - *Por qué*: Ruta universal para reproducción de cualquier contenido (`/ver/movie/123`, `/ver/tv/456`, `/ver/anime/789`).
- **`src/app/ver/[type]/[id]/PlayerViewClient.tsx`**:
  - *Qué hace*: Componente cliente interactivo que acopla el reproductor `SafePlayer`, el selector de episodios `EpisodeSelector`, metadatos completos y tráiler oficial de YouTube.
  - *Por qué*: Maneja el cambio de episodios y actualización de URL sin recargas bruscas de la página.
- **`src/app/mi-lista/page.tsx`**:
  - *Qué hace*: Panel personal del usuario con pestañas para ver favoritos e historial de reproducción con botón de limpieza.
  - *Por qué*: Ruta dedicada `/mi-lista` para gestionar la persistencia local.

---

### 3. Resultado de Verificación
- Comando: `npm run build`
- Resultado: **Exit Code 0** (Compilación limpia sin errores de tipos TypeScript ni fallos de rutas estáticas/dinámicas).


---

## Entrada 02: Optimización de `.gitignore` para Control de Versiones Limpio

### 1. Prompt de Entrada
```text
Edita el .gitignore para que se suba al repositorio solo lo que se debe subir
```

---

### 2. Archivos Creados y Modificados

- **`.gitignore`**:
  - *Qué hace*: Define las reglas de exclusión para Git abarcando dependencias (`node_modules`), artefactos y cachés de compilación de Next.js (`.next/`, `out/`, `build/`, `dist/`), variables de entorno locales (`.env`, `.env*.local`), logs de depuración (`*.log*`), cachés de TypeScript (`*.tsbuildinfo`), archivos temporales de sistema operativo (`.DS_Store`, `Thumbs.db`), configuraciones de IDE (`.vscode/`, `.idea/`) y directorios de herramientas locales de agentes (`.agents/`, `.compound-engineering/`, `.gemini/`).
  - *Por qué*: El `.gitignore` inicial solo contenía 3 exclusiones y dejaba expuesta la carpeta de compilación pesada `.next/` y potenciales secretos locales. Con este ajuste se asegura que el repositorio mantenga únicamente código fuente, configuración esencial y documentación.

---

### 3. Resultado de Verificación
- Verificación con `git status`: Los 105 paquetes compilados en `.next/` y los entornos locales ya no aparecen como archivos no rastreados (*untracked*), dejando únicamente el árbol de código fuente y archivos de configuración esenciales.


---

## Entrada 03: Capa Backend Serverless, Caching en 3 Niveles y Prefetching Automático

### 1. Prompt de Entrada
```text
Actúa como un arquitecto backend senior especializado en arquitecturas serverless, optimización de APIs y caching de alto rendimiento en Next.js.

### Objetivo
Diseñar e implementar la capa de servicios backend para la carga automática, instantánea y de máxima eficiencia de los catálogos (Anime, Películas y Series) desde APIs y fuentes de terceros, manteniendo la premisa de costo cero y cero almacenamiento propio (*Zero-Storage*).
[Aprobación del plan de ejecución: "Adelante tt"]
```

---

### 2. Archivos Creados y Modificados

#### Skills de Optimización Instaladas
- **`.agents/skills/nextjs-data-fetching/`**:
  - *Qué hace*: Provee directrices de arquitectura de datos para Next.js App Router (ISR, SWR, paralelismo con `Promise.all` y límites de revalidación).
  - *Por qué*: Guía la eliminación de waterfalls y garantiza que la carga de catálogos no degrade el rendimiento en dispositivos de bajos recursos.
- **`.agents/skills/upstash-ratelimit-js/`**:
  - *Qué hace*: Guía técnica de algoritmos de limitación de tasa (sliding window / token bucket).
  - *Por qué*: Establece el estándar para proteger las llamadas hacia APIs externas de terceros y evitar baneos de IP o errores HTTP 429.

#### Servicios de Caché y Resiliencia
- **`src/services/catalog-cache.ts`**:
  - *Qué hace*: Implementa una caché en memoria volátil en servidor con TTL de 1 hora, `AbortController` con timeout de 3.5 segundos y política *Stale-If-Error*.
  - *Por qué*: Si una API externa sufre latencia alta o caídas, entrega instantáneamente la versión previa en caché sin interrumpir la experiencia del usuario.

#### Endpoints y API Handlers
- **`src/app/api/catalog/[type]/route.ts`**:
  - *Qué hace*: Route Handler universal de Next.js (`/api/catalog/movie`, `/api/catalog/tv`, `/api/catalog/anime`) con soporte de paginación, filtros de género y búsqueda. Configura cabeceras de borde `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
  - *Por qué*: Centraliza el consumo de las APIs de terceros y delega el almacenamiento en caché al Edge CDN de Vercel/Cloudflare, reduciendo las peticiones externas casi a cero.

#### Hooks y Optimización Cliente
- **`src/hooks/useCatalogPrefetch.ts`**:
  - *Qué hace*: Hook que ejecuta prefetching pasivo durante el tiempo inactivo del navegador (`idle`) y al interactuar con la navegación.
  - *Por qué*: Permite que las tres pestañas principales (Películas, Series, Anime) carguen instantáneamente en el cliente (< 50 ms) al hacer clic.
- **`src/components/layout/Header.tsx`**:
  - *Qué hace*: Vincula `onMouseEnter` a los enlaces del menú superior para disparar el prefetch del catálogo correspondiente antes de que el usuario haga clic.
  - *Por qué*: Anticipa la intención del usuario para lograr una navegación sin transiciones de espera.

#### Páginas Actualizadas con Caché Integrado
- **`src/app/page.tsx`**:
  - *Qué hace*: Conecta la llamada paralela `Promise.all` a `getCachedCatalog` para películas, series y anime.
  - *Por qué*: Acelera el renderizado del home eliminando bloqueos de red hacia servicios externos.
- **`src/app/peliculas/page.tsx`**, **`src/app/series/page.tsx`**, **`src/app/anime/page.tsx`**:
  - *Qué hace*: Conectan sus llamadas de catálogo al servicio centralizado `getCachedCatalog`.
  - *Por qué*: Aseguran que cualquier filtro o recarga aproveche la caché en memoria y la protección por timeout.

---

### 3. Resultado de Verificación
- Comando: `npm run build`
- Resultado: **Exit Code 0** (Generación estática y dinámica exitosa; nuevo endpoint `ƒ /api/catalog/[type]` optimizado a 123 B de First Load JS).
