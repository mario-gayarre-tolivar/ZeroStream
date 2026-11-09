# Especificación de Requisitos de Software (SRS)
## Plataforma Agregadora Multimedia: Anime, Películas y Series (Zero-Storage Architecture)

---

## 1. Introducción y Objetivos

### 1.1 Propósito
Definir los requisitos técnicos, funcionales y de despliegue para una plataforma web unificada que permita explorar y visualizar anime, películas y series de televisión sin requerir almacenamiento local o servidores de video propios, manteniendo los costos de infraestructura en **$0 USD/mes** o cercanos a cero mediante capas gratuitas (*Free Tier*).

### 1.2 Principio Arquitectónico Central: *Zero-Storage*
El sistema opera exclusivamente como un **agregador e indexador de metadatos y reproductores embebidos**. 
- **0 GB de video alojado**: La totalidad de los streams se delega a proveedores externos mediante `<iframe>`.
- **0 GB de bases de datos pesadas**: Los pósters, descripciones y sinopsis se consumen en tiempo real o en caché edge desde APIs públicas gratuitas.

---

## 2. Stack Tecnológico de Costo Cero ($0 USD/mes)

| Componente | Proveedor / Tecnología | Nivel de Costo | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14+ (App Router) o Astro | Gratuito (Open Source) | Soporte de Server Components (RSC), SSR e ISR para indexar rápido sin saturar memoria. |
| **Alojamiento Web & Edge** | Vercel / Cloudflare Pages | $0 (Free Tier) | 100 GB ancho de banda/mes, SSL automático, despliegue continuo desde GitHub. |
| **API Metadatos (Cine/Series)** | TMDB API (The Movie Database) | $0 (Clave de desarrollador) | Catálogo universal con sinopsis, temporadas, episodios, IDs de IMDb y posters vía CDN propia. |
| **API Metadatos (Anime)** | AniList GraphQL API / Jikan (MAL) | $0 (Pública sin clave) | Esquema GraphQL exhaustivo para temporadas de emisión, episodios y metadatos de anime. |
| **Proveedores de Embed (Video)** | Embed Providers / Vidsrc / Superembed | $0 (Basado en terceros) | APIs HTTP que devuelven reproductores listos vía parámetros `id_tmdb` o `id_imdb`. |
| **Persistencia de Usuario** | `localStorage` + `IndexedDB` (Cliente) | $0 (Navegador) | Historial de visualización y lista de favoritos sin necesidad de backend con base de datos. |
| **DNS y Seguridad de Red** | Cloudflare Free DNS | $0 (Free Tier) | Mitigación DDoS, caché estática de assets JS/CSS y enmascaramiento de IPs de origen. |

---

## 3. Requisitos Funcionales (RF)

### RF-01: Catálogo Unificado y Exploración
- El sistema debe presentar tres secciones maestras: `/anime`, `/peliculas` y `/series`.
- El sistema debe permitir filtrar por género, año de estreno, popularidad y estado de emisión (en emisión / finalizado).
- El sistema debe incluir un buscador universal con debounce (300 ms) que consulte simultáneamente los endpoints de búsqueda de TMDB y AniList.

### RF-02: Ficha Técnica Detallada
- Para cada título, el sistema mostrará: título original, título localizado, puntuación, sinopsis, géneros, reparto y tráiler oficial (consumido vía iframe de YouTube sin coste).
- Para Series y Anime: selector dinámico de Temporadas y lista de Episodios con miniatura y título.

### RF-03: Sistema de Reproducción Multi-Servidor (Fallback Cascade)
- El reproductor no dependerá de un único proveedor de video.
- La interfaz del reproductor dispondrá de pestañas ("Servidor 1", "Servidor 2", "Servidor 3", "Subtitulado", "Doblado").
- Si el reproductor activo genera un error de red o timeout (> 8 segundos), el sistema debe ofrecer un botón de cambio rápido al siguiente servidor disponible.

### RF-04: Sandboxing de Reproductores Externos
- Para mitigar popups maliciosos y descargas involuntarias generadas por los hosts de video, el `<iframe>` debe implementar atributos de seguridad estrictos:
  ```html
  <iframe
    src="URL_DEL_PROVEEDOR"
    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
    loading="lazy"
    class="w-full aspect-video border-0 rounded-lg"
  ></iframe>
  ```

### RF-05: Historial y Progreso sin Base de Datos
- Al reproducir un video, el sistema guardará localmente en el navegador (`localStorage`):
  - ID del contenido (`tmdb_id` o `anilist_id`).
  - Tipo de medio (`movie`, `tv`, `anime`).
  - Último episodio y temporada reproducidos.
  - Marca de tiempo del último acceso.
- La pantalla de inicio mostrará la fila "Continuar Viendo" construida a partir de este almacenamiento local.

---

## 4. Requisitos No Funcionales (RNF)

- **RNF-01 (Cero Costo Operativo)**: La solución debe operar íntegramente dentro de los límites de las capas gratuitas (Vercel, Cloudflare, APIs públicas).
- **RNF-02 (Cero Almacenamiento Multimedia)**: El servidor no debe procesar, almacenar ni realizar proxy de streams binarios de video.
- **RNF-03 (Rendimiento Web Vitals)**:
  - *Largest Contentful Paint (LCP)* < 2.0 segundos mediante el uso de imágenes optimizadas (`next/image`) servidas desde la CDN de TMDB (`image.tmdb.org`).
  - *Cumulative Layout Shift (CLS)* < 0.1 reservando el contenedor con ratio `aspect-video` (16:9) antes de cargar el iframe del reproductor.
- **RNF-04 (Diseño Adaptativo)**: Interfaz responsiva compatible con smartphones (iOS Safari, Android Chrome), tablets, PC y Smart TVs vía navegador web.

---

## 5. Arquitectura de Integración de Proveedores de Video

```mermaid
flowchart TD
    User([Navegador del Usuario]) --> NextApp[Frontend Next.js en Vercel]
    
    subgraph Capa de Metadatos (Gratis)
        NextApp -->|TMDB API (HTTP GET)| TMDB[(TMDB: Películas/Series)]
        NextApp -->|AniList GraphQL| AL[(AniList: Anime)]
    end
    
    subgraph Capa de Reproducción Embebida (Zero-Storage)
        User -->|Carga Iframe Sandboxed| P1[Proveedor Embed A: vidsrc/superembed]
        User -->|Fallback Iframe| P2[Proveedor Embed B: embed.su/videasy]
        User -->|Fallback Anime Embed| P3[Proveedor Embed Anime: Consumet/2embed]
    end

    subgraph Persistencia del Cliente
        User <-->|Lectura/Escritura| LS[(LocalStorage / IndexedDB)]
    end
```

### URLs de Integración Estándar (Zero-Cost):
1. **Películas**:
   - `https://vidsrc.me/embed/movie?tmdb={tmdb_id}`
   - `https://embed.su/embed/movie/{tmdb_id}`
2. **Series**:
   - `https://vidsrc.me/embed/tv?tmdb={tmdb_id}&season={s}&episode={e}`
   - `https://embed.su/embed/tv/{tmdb_id}/{s}/{e}`
3. **Anime**:
   - Enlace cruzado mapeando el `anilist_id` o consumiendo instancias públicas de APIs de streaming de anime (ej. Consumet API autoalojada en Vercel Serverless Functions).

---

## 6. Flujo de Montaje e Implementación Paso a Paso

### Paso 1: Obtención de Credenciales Gratuitas
1. Crear cuenta gratuita en [TheMovieDatabase (TMDB)](https://www.themoviedb.org/).
2. Ir a *Ajustes -> API* y solicitar una clave de desarrollador (Developer API Key v3).
3. Obtener el token de acceso de lectura de la API v4.
4. *(Opcional)* Para anime, no se requiere clave: la API GraphQL de AniList (`https://graphql.anilist.co`) y Jikan (`https://api.jikan.moe/v4`) son abiertas.

### Paso 2: Inicialización del Repositorio y Dependencias
Ejecutar en la terminal local:
```bash
npx create-next-app@latest streaming-zero --typescript --tailwind --eslint --app --src-dir
cd streaming-zero
npm install lucide-react clsx tailwind-merge swr
```

### Paso 3: Configuración de Variables de Entorno (`.env.local`)
```env
NEXT_PUBLIC_TMDB_API_KEY=tu_clave_tmdb_aqui
NEXT_PUBLIC_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Paso 4: Creación de Capas de Servicio de Datos
- **Módulo TMDB (`src/services/tmdb.ts`)**: Funciones para obtener populares, tendencias, detalles de película, episodios de series y búsqueda.
- **Módulo Anime (`src/services/anime.ts`)**: Consultas GraphQL a AniList para listar animes en emisión, mejores valorados y búsqueda por texto.
- **Módulo Resolvers (`src/services/embeds.ts`)**: Mapeador de plantillas de URLs para alternar entre proveedores de streaming según el ID y tipo de medio.

### Paso 5: Implementación de Páginas Clave
1. `src/app/page.tsx`: Landing con carrusel de estrenos y filas de categorías ("Tendencias Hoy", "Top Anime", "Películas Populares").
2. `src/app/pelicula/[id]/page.tsx`: Ficha de película con botón de reproducción directa.
3. `src/app/serie/[id]/page.tsx`: Selector interactivo de temporada y cuadrícula de episodios.
4. `src/app/anime/[id]/page.tsx`: Listado paginado de episodios con soporte de búsqueda de capítulos.
5. `src/components/PlayerModal.tsx`: Contenedor responsivo del `<iframe>` con switch de servidores y protección sandbox.

### Paso 6: Despliegue Continuo (CI/CD) en Vercel
1. Subir el proyecto a un repositorio privado o público en GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: setup zero-storage streaming web"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/streaming-zero.git
   git push -u origin main
   ```
2. Entrar a [Vercel](https://vercel.com/) -> *Add New Project* -> Importar repositorio.
3. Configurar la variable de entorno `NEXT_PUBLIC_TMDB_API_KEY` en el panel de Vercel.
4. Presionar **Deploy**. Vercel generará una URL pública segura (`https://streaming-zero.vercel.app`).

### Paso 7: Configuración de Dominio y CDN con Cloudflare
1. Adquirir un dominio económico (o usar el subdominio gratuito `.vercel.app`).
2. Vincular los Nameservers en Cloudflare.
3. Activar en Cloudflare:
   - SSL/TLS en modo *Full (Strict)*.
   - *Automatic HTTPS Rewrites* para evitar errores de contenido mixto (Mixed Content).
   - Reglas de caché para páginas estáticas para minimizar las llamadas a la API de TMDB.

---

## 7. Deslinde de Responsabilidad y Mitigación de Riesgos

1. **Aviso Legal (DMCA Disclaimer)**:
   - Incluir en el pie de página un deslinde explícito: *"Este portal no aloja ni almacena ningún archivo de video en sus servidores. Todo el contenido multimedia es proporcionado por servicios de terceros totalmente ajenos e independientes a este sitio."*
2. **Mitigación de Enlaces Caídos**:
   - Mantener una lista de al menos 3 a 5 proveedores de embed alternativos por cada tipo de contenido.
   - En caso de que un proveedor retire un dominio o embed, el cambio se realiza en el archivo de configuración central (`src/services/embeds.ts`) sin requerir re-indexar la base de datos.
