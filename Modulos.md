 ### 1. Paginación y Carga Infinita (Catálogos) — [COMPLETADO]

• Estado: Implementado con sistema dual (Botón interactivo "Cargar más" sin recarga + Paginación numérica SEO mediante parámetros de URL `?page=X`).
• Integrado en: `/peliculas`, `/series` y `/anime`. Componentes: `Pagination.tsx` y `LoadMoreCatalog.tsx`.

  ### 2. Búsqueda Global en Vivo (Live Search Dropdown)

  • Estado actual: Buscar redirige a la página de catálogo con filtro de texto.
  • Falta: Menú flotante bajo el buscador con resultados instantáneos (póster, título, categoría y año) mientras el
  usuario escribe, con debounce de 300 ms.

  ### 3. Estados de Carga y Límites de Error (App Router)

  • Estado actual: El navegador espera en blanco mientras se resuelve el SSR.
  • Falta:
      • src/app/loading.tsx: Esqueletos de carga (skeletons) con pulso gris mientras llega la data.
      • src/app/error.tsx: Pantalla de error con botón "Reintentar" si la conexión falla.


  ### 4. Modo Teatro y Mejoras del Reproductor

  • Estado actual: Reproductor embebido estándar 16:9 con cambio de servidor.
  • Falta:
      • Botón "Modo Cine / Teatro": expande el reproductor al 100% del ancho de pantalla oscureciendo el fondo.
      • Botón "Copiar enlace directo" al capítulo actual (/ver/anime/16498?s=1&e=5).
      • Atajos de teclado: tecla F (pantalla completa), teclas N/P (siguiente/anterior capítulo).


  ### 5. SEO Dinámico y Configuración de Despliegue

  • Estado actual: Título estático en todas las rutas.
  • Falta:
      • generateMetadata() en /ver/[type]/[id]: OpenGraph dinámico para que al compartir el enlace por
      WhatsApp/Discord/Telegram se muestre el póster, sinopsis y título real.
      • .env.example: plantilla con la variable NEXT_PUBLIC_TMDB_API_KEY.