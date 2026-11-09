# ZeroStream

Plataforma web unificada de exploración y streaming de anime, películas y series de televisión bajo una arquitectura de **costo cero y cero almacenamiento propio (*Zero-Storage*)**.

---

## Características Principales

- **Arquitectura Zero-Storage**: 100% del contenido multimedia es reproducido mediante iframes externos protegidos con `sandbox`.
- **Cero Dependencia de Bases de Datos**: La lista de favoritos y el progreso de "Continuar Viendo" se sincronizan de forma privada en el `localStorage` del navegador.
- **Catálogo Unificado**:
  - **Anime**: Integración en vivo con la API GraphQL pública de AniList (sin clave de API requerida).
  - **Películas y Series**: Integración con The Movie Database (TMDB) con catálogo local de contingencia.
- **Búsqueda Global en Vivo**: Menú flotante con autocompletado en vivo con 300 ms de debounce y agrupado por tipo de medio.
- **Reproductor Protegido**: Alternador dinámico de 4 servidores de streaming de respaldo por cada título/capítulo.
- **Modo Cine / Teatro**: Experiencia inmersiva en pantalla completa con atajos de teclado (`T` para teatro, `F` para fullscreen, `N`/`P` para cambiar de capítulo).
- **SEO y Metadatos Dinámicos**: OpenGraph y Twitter Cards generados en el servidor para previsualizaciones en redes sociales.
- **Rendimiento Edge**: Caché multicapa con Next.js App Router y First Load JS de apenas ~103 kB.

---

## Tecnologías Utilizadas

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Librería UI**: [React 19](https://react.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Tipado**: [TypeScript](https://www.typescriptlang.org/)

---

## Puesta en Marcha en Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. *(Opcional)* Configurar variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

---

## Despliegue en Producción

El proyecto está listo para ser desplegado en [Vercel](https://vercel.com/) o [Cloudflare Pages](https://pages.cloudflare.com/) en un clic importando el repositorio de GitHub sin costo de infraestructura.

---

## Aviso Legal (DMCA Disclaimer)

ZeroStream es un proyecto de software demostrativo que opera únicamente como un indexador de metadatos. Esta plataforma no aloja, almacena ni transmite ningún archivo de video en sus servidores. Todo el material audiovisual es servido por proveedores de terceros independientes.
