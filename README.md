# ZeroStream

Plataforma web moderna y unificada para la exploración y reproducción de **Anime, Películas y Series de Televisión**, construida bajo una arquitectura de **coste cero y cero almacenamiento propio (*Zero-Storage*)**.

---

## Características Principales

- **Arquitectura Zero-Storage**: Todo el contenido multimedia se reproduce mediante embeds de terceros en entornos protegidos, sin coste de almacenamiento de video ni servidores de streaming propios.
- **Autoselección Inteligente de Servidores**: Sistema de verificación de salud en tiempo real en el backend con descarte automático de servidores caídos y memoria de fallos de sesión en el cliente.
- **Catálogo Dual en Vivo**:
  - **Anime**: Integración directa con la API GraphQL pública de [AniList](https://anilist.co/) (¡funciona de inmediato sin necesidad de ninguna clave de API!).
  - **Películas y Series**: Integración con [The Movie Database (TMDB)](https://www.themoviedb.org/) con catálogo local de contingencia resiliente ante caídas.
- **Sin Base de Datos**: Favoritos y progreso de "Continuar Viendo" guardados 100% de forma privada en el `localStorage` del navegador.
- **Búsqueda Global en Vivo**: Autocompletado reactivo con debounce de 300 ms agrupado por categoría.
- **Reproductor Adaptativo**: Modo Cine/Teatro, pantalla completa y atajos de teclado (`T` para teatro, `F` para fullscreen, `N` siguiente episodio, `P` episodio anterior).
- **Arquitectura Modular por Capas**: Separación estricta entre código de servidor (`src/server/`), cliente (`src/client/`), lógica isomórfica (`src/shared/`) y componentes UI (`src/components/`).
- **Rendimiento Edge**: Caché LRU multicapa con Next.js App Router, streaming de Suspense y First Load JS optimizado (~103 kB).

---

## Tecnologías Utilizadas

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Librería UI**: [React 19](https://react.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Validación de Datos**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) + React Testing Library (27 suites, 209 tests)
- **Tipado**: [TypeScript](https://www.typescriptlang.org/)

---

## Requisitos Previos

- [Node.js](https://nodejs.org/) versión **18.18.0** o superior (recomendado **Node 20+** LTS).
- Gestor de paquetes `npm` (incluido con Node), `pnpm` o `yarn`.

---

## Puesta en Marcha en Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/mario-gayarre-tolivar/proyectoPersonal_01.git
cd proyectoPersonal_01
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla `.env.example` para crear tu archivo `.env.local`:
```bash
cp .env.example .env.local
```

Abre `.env.local` en tu editor. Verás las siguientes variables:
```env
# 1. Clave de API de TMDB (Requerida para Películas y Series)
TMDB_API_KEY=tu_clave_de_api_tmdb_aqui

# 2. URL base del proyecto (para metadatos OpenGraph y SEO)
SITE_URL=http://localhost:3000

# 3. CDN de carátulas (Opcional, por defecto usa la oficial de TMDB)
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p/
```

---

## Cómo Obtener tu API Key Gratuita de TMDB

Para que la sección de **Películas** y **Series** cargue los metadatos completos y carátulas actualizadas, necesitas una clave de API gratuita de TMDB:

1. **Crear una cuenta**: Regístrate gratis en [The Movie Database (TMDB)](https://www.themoviedb.org/signup).
2. **Verificar correo**: Confirma tu dirección de correo electrónico para activar la cuenta.
3. **Acceder a Ajustes de API**:
   - Inicia sesión y ve a tu perfil (arriba a la derecha) > **Configuración** > pestaña **[API](https://www.themoviedb.org/settings/api)**.
4. **Solicitar Clave**:
   - Pulsa en **"Crear"** o **"Solicitar una nueva clave de API"**.
   - Elige la opción **"Developer"** (Desarrollador para uso personal/educativo).
   - Rellena el formulario con tus datos (en tipo de aplicación puedes indicar *"Personal / Educational project"*).
5. **Copiar la clave**:
   - Una vez aprobada de forma instantánea, copia el valor de **"Clave de API (v3 auth)"**.
6. **Pegar en tu `.env.local`**:
   ```env
   TMDB_API_KEY=a1b2c3d4e5f6...tu_clave_aqui...
   ```

> **Nota sobre Anime:** La sección de Anime utiliza la API pública de **AniList GraphQL**, la cual **no requiere registro ni clave de API**. Estará operativa inmediatamente incluso sin configurar TMDB.

---

## Comandos Disponibles

| Comando | Acción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:3000` con recarga rápida. |
| `npm test` | Ejecuta la suite de pruebas unitarias y de integración con Vitest. |
| `npm run build` | Compila y optimiza la aplicación para producción en Next.js. |
| `npm start` | Inicia el servidor en modo producción (requiere `npm run build` previo). |
| `npx tsc --noEmit` | Verifica el tipado estático de TypeScript en todo el proyecto sin generar archivos. |

---

## Despliegue en Producción (Vercel)

El proyecto está preparado para desplegarse en [Vercel](https://vercel.com/) de forma gratuita:

1. Haz un fork o sube este repositorio a tu cuenta de GitHub.
2. Inicia sesión en [Vercel](https://vercel.com/) y pulsa en **"Add New Project"**.
3. Importa este repositorio.
4. En la sección **Environment Variables**, añade:
   - `TMDB_API_KEY`: Tu clave de API de TMDB.
   - `SITE_URL`: La URL pública que te asigne Vercel (ej: `https://mi-proyecto.vercel.app`).
5. Haz clic en **Deploy**. ¡Tu plataforma estará lista en menos de 2 minutos!

---

## Estructura del Código

```text
src/
├── server/       # Upstream clients (TMDB, AniList), caché de servidor y health checks
├── client/       # Persistencia en localStorage/sessionStorage y hooks React
├── shared/       # Lógica pura isomórfica (embeds, autoselección de servidores, Zod schemas)
├── components/   # Componentes modulares UI (player, catalog, layout, home)
├── app/          # Rutas y API Route Handlers de Next.js App Router
└── types/        # Modelos TypeScript organizados por dominio
```

---

## Aviso Legal (DMCA Disclaimer)

ZeroStream es un proyecto de software demostrativo de código abierto que opera únicamente como un indexador de metadatos de acceso público. Esta plataforma **no aloja, no almacena ni transmite ningún archivo de video o contenido multimedia** en sus servidores. Todo el material audiovisual es enlazado y servido por proveedores de terceros externos e independientes.
