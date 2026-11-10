# Checklist de Validación y Pruebas — ZeroStream

Este documento enumera todas las funcionalidades que ZeroStream debe cumplir y el procedimiento exacto paso a paso para comprobar si cada una funciona correctamente o presenta fallos.

---

## 1. Navegación y Vistas de Catálogo

### 1.1 Home (`/`)
- **Qué debe cumplir:**
  - Cargar Hero Banner con contenido destacado aleatorio y botón "Ver Ahora".
  - Mostrar carruseles o cuadrículas de películas, series y anime populares.
  - Mostrar la sección "Continuar Viendo" únicamente si el usuario ha reproducido contenido previo.
- **Cómo comprobarlo:**
  1. Entrar a `http://localhost:3000/`.
  2. Verificar que el Hero Banner muestre título, sinopsis y botón funcional que redirija a `/ver/...`.
  3. Comprobar que "Continuar Viendo" NO aparezca en una sesión limpia.
  4. Reproducir un video durante unos segundos, volver al Home y recargar: la sección debe aparecer con el item y progreso guardado.

### 1.2 Catálogos con Filtros (`/peliculas`, `/series`, `/anime`)
- **Qué debe cumplir:**
  - Filtrado reactivo por Género, Año y Orden (popularidad, fecha, valoración).
  - Paginación dual: Botón "Cargar Más" dinámico (añade items sin recargar la página) + soporte de URL paramétrica (`?page=2&genre=Acción`).
- **Cómo comprobarlo:**
  1. Entrar a `/peliculas`. Seleccionar género "Acción": el catálogo debe actualizarse mostrando solo películas de acción.
  2. Pulsar botón "Cargar Más": deben agregarse 20 items adicionales al final sin parpadeo ni reseteo del scroll.
  3. Modificar la URL a `http://localhost:3000/peliculas?page=2`: debe cargar directamente la página 2 con el estado sincronizado.
  4. Repetir en `/series` y `/anime` (comprobando que AniList responda con anime real).

### 1.3 Mi Lista / Favoritos (`/mi-lista`)
- **Qué debe cumplir:**
  - Persistencia de favoritos en el cliente (`localStorage`).
  - Capacidad de agregar, consultar y eliminar items.
- **Cómo comprobarlo:**
  1. Entrar a `/mi-lista` en incógnito: debe mostrar estado vacío ("No tienes favoritos aún").
  2. Ir a cualquier película o anime y pulsar el botón con icono de marcador/corazón ("Añadir a Mi Lista").
  3. Volver a `/mi-lista`: el elemento debe figurar en la cuadrícula.
  4. Pulsar el botón de papelera/eliminar en la tarjeta: el elemento debe desaparecer de inmediato y de `localStorage`.

---

## 2. Buscador en Vivo (`LiveSearch`)

- **Qué debe cumplir:**
  - Búsqueda en tiempo real desde la barra de navegación con debounce de 300 ms.
  - Consulta unificada y paralela en Películas, Series y Anime (`/api/search`).
  - Menú desplegable con póster, título, año, etiqueta de tipo y rating.
  - Cierre accesible con tecla `Escape` o clic fuera del menú.
- **Cómo comprobarlo:**
  1. Escribir "Spider" en el buscador del Header.
  2. Verificar que no se dispare una petición por cada letra, sino tras detener la escritura (300 ms).
  3. Comprobar que en los resultados aparezcan películas (TMDB) y/o anime relacionados.
  4. Presionar `Escape`: el menú debe cerrarse inmediatamente.
  5. Escribir un texto sin resultados (ej. "xyzxyzxyz999"): debe indicar "No se encontraron resultados".

---

## 3. Ficha Técnica y Reproductor Embebido (`/ver/[type]/[id]`)

### 3.1 Carga de Ficha y Metadatos
- **Qué debe cumplir:**
  - Presentar carátula en alta definición, sinopsis limpia (sin etiquetas HTML), año, duración, rating y géneros.
  - Para Series y Anime: Selector interactivo de Temporadas y Episodios.
- **Cómo comprobarlo:**
  1. Entrar a una serie (ej. `/ver/serie/1399` - Game of Thrones).
  2. Cambiar de Temporada 1 a Temporada 2: la lista de episodios debe actualizarse.
  3. Seleccionar Episodio 3: el reproductor debe actualizar su iframe para cargar dicho capítulo.

### 3.2 Reproductor Seguro (`SafePlayer`)
- **Qué debe cumplir:**
  - Contenedor en ratio 16:9 (`aspect-video`) adaptable a móvil y escritorio.
  - Sandbox de seguridad estricto en el `<iframe>`: `allow-scripts allow-same-origin allow-forms` bloqueando redirecciones de ventana completa (`allow-top-navigation`) y popups publicitarios (`allow-popups`).
  - Selector de servidores de respaldo (Server 1, Server 2, Server 3) para alternar si una fuente no carga.
- **Cómo comprobarlo:**
  1. Inspeccionar el `<iframe>` con DevTools del navegador (F12) y verificar el atributo `sandbox`.
  2. Cambiar entre "Servidor 1", "Servidor 2" y "Servidor 3": la URL del iframe debe cambiar al proveedor correspondiente sin recargar la web.

### 3.3 Controles Avanzados y Atajos de Teclado
- **Qué debe cumplir:**
  - **Tecla `T`:** Activar/desactivar Modo Teatro (oculta barra lateral y detalles, expande el reproductor al 100% de la ventana).
  - **Tecla `F`:** Activar/desactivar Pantalla Completa.
  - **Teclas `N` / `P`:** Pasar al Episodio Siguiente (`N`) o Anterior (`P`) en series y anime.
  - **Copiar Enlace:** Botón para copiar la URL exacta con el episodio seleccionado al portapapeles.
- **Cómo comprobarlo:**
  1. En la página de reproducción, presionar tecla `T`: la interfaz debe cambiar a modo cine inmediatamente. Presionar `T` de nuevo para salir.
  2. Presionar `F`: la ventana debe entrar a pantalla completa nativa.
  3. En una serie, presionar `N`: debe avanzar al siguiente episodio. Presionar `P`: debe regresar al anterior.
  4. Pulsar el botón "Copiar Enlace": debe aparecer notificación "Enlace copiado" y al pegar la URL en otra pestaña debe abrir el mismo episodio.

---

## 4. Resiliencia, Fallbacks y Estados de Carga

### 4.1 Catálogo de Respaldo Offline/Sin API Key
- **Qué debe cumplir:**
  - Si no hay `TMDB_API_KEY` configurada o la API de TMDB/AniList se cae, la web debe seguir funcionando sin errores 500, mostrando datos de respaldo predefinidos.
- **Cómo comprobarlo:**
  1. Vaciar temporalmente la variable en `.env.local` o cortar conexión a internet de las APIs.
  2. Recargar `/peliculas`: la página debe cargar el listado de películas de respaldo sin crashear.

### 4.2 Loading Skeletons y CLS
- **Qué debe cumplir:**
  - Al navegar entre rutas, deben mostrarse skeletons animados con la silueta de las tarjetas antes de pintar el contenido real, evitando saltos de página (Cumulative Layout Shift).
- **Cómo comprobarlo:**
  1. En DevTools (F12) -> Pestaña Red (Network), activar throttling "Fast 3G".
  2. Navegar a `/peliculas` o `/ver/pelicula/...`: deben verse rectángulos grises pulsantes en el lugar de los pósters y texto antes de que carguen las imágenes.

### 4.3 Error Boundary y 404
- **Qué debe cumplir:**
  - Errores globales capturados por `error.tsx` con botón "Intentar de nuevo".
  - Rutas inexistentes capturadas por `not-found.tsx` estilizado en modo oscuro.
- **Cómo comprobarlo:**
  1. Navegar a una ruta inexistente: `http://localhost:3000/ruta-inexistente-12345`.
  2. Verificar que se muestre la página 404 de ZeroStream con botón "Volver al inicio", sin pantalla de error por defecto de Next.js ni pantalla en blanco.

---

## 5. SEO, Metadatos y Despliegue en Servidor

### 5.1 OpenGraph Dinámico
- **Qué debe cumplir:**
  - Generación de metaetiquetas `og:title`, `og:description`, `og:image` y canonicals personalizadas por cada título.
- **Cómo comprobarlo:**
  1. Entrar a `/ver/pelicula/550`.
  2. Inspeccionar el código fuente HTML (`Ctrl + U` o DevTools -> `<head>`).
  3. Verificar que existan las etiquetas `<meta property="og:title" ...>` con el nombre de la película y `<meta property="og:image" ...>` con la URL de la carátula.

### 5.2 Rastreo (`robots.txt` y `sitemap.xml`)
- **Qué debe cumplir:**
  - Generación dinámica de `robots.txt` y `sitemap.xml` respetando `SITE_URL`.
- **Cómo comprobarlo:**
  1. Abrir `http://localhost:3000/robots.txt` en el navegador: debe devolver `User-agent: *` y la URL del sitemap.
  2. Abrir `http://localhost:3000/sitemap.xml`: debe devolver el XML con las rutas indexables (`/`, `/peliculas`, `/series`, `/anime`).

### 5.3 Variables de Entorno Seguras
- **Qué debe cumplir:**
  - Soportar `TMDB_API_KEY` y `SITE_URL` en el servidor sin exponer secretos al navegador.
- **Cómo comprobarlo:**
  1. Ejecutar `npm run build`: debe compilar con Exit Code 0 sin advertencias de variables `NEXT_PUBLIC_` inseguras.
  2. Buscar en las fuentes cliente de DevTools (F12 -> Sources -> Chunks JS): la clave `TMDB_API_KEY` no debe estar presente en texto plano en el cliente.
