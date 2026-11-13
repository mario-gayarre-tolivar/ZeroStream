# Plan de Ejecución: Refactorización, Optimización y Arquitectura Modular

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactorizar y optimizar de forma integral la aplicación streaming-zero capa por capa (Servicios, Componentes, Rutas App Router) para reducir el consumo de memoria RAM, garantizar modularidad desacoplada, reparar servidores de video y dotar a la interfaz de un diseño minimalista y distintivo no genérico.

**Architecture:** Enfoque por capas con verificación estricta TDD/Safe-Refactor. Cada micro-paso está respaldado por tests unitarios en Vitest y validación de `npm run build`. La capa de datos sustituye la caché no acotada por una caché LRU con tope de memoria; la capa de componentes aplica patrones de composición de React 19 desacoplando estado y presentación; y las rutas de Next.js 15 optimizan los límites de Server Components y streaming con Suspense.

**Tech Stack:** Next.js 15.1 (App Router), React 19, TypeScript 5.7, Tailwind CSS 3.4, Vitest, Lucide React.
**Propuesta de librerías a incorporar:**
- `zod` (^3.24.0): Validación estricta en tiempo de ejecución de las respuestas de APIs externas (TMDB, AniList), evitando caídas silenciosas o propiedades nulas imprevistas.

---

## Global Constraints

- **Invariante de Tests:** Cada tarea debe finalizar con `npm test` y `npm run build` pasando al 100% sin advertencias ni errores.
- **TDD / Safe-Refactor:** Ningún servicio existente se modificará sin antes tener pruebas unitarias que fijen su comportamiento esperado.
- **Diseño Visual Distintivo:** Seguir la skill `frontend-design`. Prohibido el uso de estéticas genéricas de IA (como tarjetas idénticas con sombras borrosas grises, acentos de color neón cliché, o etiquetas en mayúsculas espaciadas innecesarias). Debe tener carácter cinematográfico, tipografía intencional y sobriedad minimalista.
- **Eficiencia de Memoria:** Eliminar colecciones no acotadas en memoria (`Map` infinitos) para prevenir fugas de RAM en Node.js.
- **Zero-Storage:** Mantener la filosofía del proyecto sin almacenar archivos multimedia directamente, empleando sandboxing seguro en los reproductores de terceros.

## Review Focus

1. **Memory Leaks en Node:** Mapas o cachés en memoria que acumulan entradas sin política de desalojo (LRU) o sin TTL estricto.
2. **Caída en cascada de Fallbacks:** Reintentos recursivos o síncronos contra servicios caídos en bloques catch que cuelguen la petición del usuario.
3. **Fallo de proveedores de Streaming:** Parámetros inválidos (IDs de AniList pasados como TMDB IDs) o URLs caídas en `embeds.ts`.
4. **Desincronización de Estado en el Reproductor:** Manejo de selección de servidores, temporadas y episodios en `SafePlayer` que genere bucles de re-renderizado o bloqueos de iframe.
5. **Fugas de `"use client"`:** Componentes cliente sobredimensionados que arrastren lógica del servidor al bundle del navegador, aumentando el uso de memoria en el cliente.

---

## Fase 1: Capa de Servicios y Datos (`src/services/` y `src/app/api/`)

### Task 1.1: Cobertura de Tests para Servicios no cubiertos (TDD Baseline)
**Files:**
- Create: `src/__tests__/services/anilist.test.ts`
- Create: `src/__tests__/api/catalog.test.ts`
- Modify: `src/__tests__/services/catalog-cache.test.ts`

- [x] **Paso 1:** Escribir tests unitarios para `src/services/anilist.ts` que validen consultas normales, paginación, filtros de género y manejo de respuestas fallidas de la API GraphQL.
- [x] **Paso 2:** Escribir tests para el endpoint de catálogo `/api/catalog/[type]` validando códigos HTTP (200, 400 por tipo inválido) y cabeceras de respuesta.
- [x] **Paso 3:** Ejecutar `npm test` y verificar que los tests pasen con mocks controlados.
- [x] **Paso 4:** Commit de la suite de pruebas base.

### Task 1.2: Optimización de Memoria y Resiliencia en Caché (`src/services/catalog-cache.ts`)
**Files:**
- Create: `src/services/lru-cache.ts`
- Modify: `src/services/catalog-cache.ts`
- Test: `src/__tests__/services/catalog-cache.test.ts`

- [x] **Paso 1:** Escribir tests en `catalog-cache.test.ts` comprobando el desalojo automático de entradas antiguas cuando se excede la capacidad máxima de memoria (LRU) y expiración por TTL.
- [x] **Paso 2:** Implementar una estructura ligera `BoundedMemoryCache` en `src/services/lru-cache.ts` con límite máximo de entradas (ej. 150 claves) y desalojo automático O(1) para erradicar fugas de memoria.
- [x] **Paso 3:** Refactorizar `catalog-cache.ts` para usar `BoundedMemoryCache` y corregir el bug del bloque catch donde se reintentaba la misma petición fallida sin timeout.
- [x] **Paso 4:** Ejecutar `npm test` y `npm run build` para confirmar estabilidad.
- [x] **Paso 5:** Commit del cambio.

### Task 1.3: Auditoría, Reparación y Tipado de Servidores de Streaming (`src/services/embeds.ts`)
**Files:**
- Modify: `src/services/embeds.ts`
- Modify: `src/types/index.ts`
- Test: `src/__tests__/services/embeds.test.ts`

- [x] **Paso 1:** Actualizar tests en `embeds.test.ts` para verificar la generación de URLs de servidores activos y la diferenciación correcta de IDs para Anime vs Movies/Series.
- [x] **Paso 2:** Auditar proveedores de streaming en `embeds.ts`:
  - Actualizar endpoints y dominios funcionales (VidLink, Embed.su, SuperEmbed/Multiembed, 2Embed/AutoEmbed).
  - Solucionar el problema de anime: añadir soporte para mapeo o proveedores directos de anime que admitan título/temporada cuando el ID no coincida con TMDB.
  - Añadir metadatos de servidor (estado de salud, soporte de subtítulos en español y sandbox recomendado).
- [x] **Paso 3:** Ejecutar `npm test` y verificar que todas las opciones de servidores devuelven URLs bien formadas.
- [x] **Paso 4:** Commit del cambio.

### Task 1.4: Contratos de Datos y Tipado Seguro (`src/services/tmdb.ts` y `src/services/anilist.ts`)
**Files:**
- Modify: `src/services/tmdb.ts`
- Modify: `src/services/anilist.ts`
- Modify: `src/types/index.ts`
- Test: `src/__tests__/services/tmdb.test.ts`
- Test: `src/__tests__/services/anilist.test.ts`

- [x] **Paso 1:** Integrar validadores de esquema seguros (`zod` o funciones de guardia de tipos puras) para sanear respuestas externas antes de transformarlas a `MediaItem`.
- [x] **Paso 2:** Eliminar transformaciones duplicadas y asignaciones de memoria redundantes en bucles de mapeo.
- [x] **Paso 3:** Comprobar con `npm test` y `npm run build`.
- [ ] **Paso 4:** Commit del cambio.

---

## Fase 2: Capa de Componentes y UI (`src/components/`)

### Task 2.1: Sistema de Diseño Visual Distintivo y Minimalista
**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Paso 1:** Definir la identidad visual en `tailwind.config.ts` y `globals.css`:
  - Paleta sobria y cinematográfica (tonos carbón profundo, grafito y acentos intencionales de alto contraste sin caer en luces de neón genéricas).
  - Escala tipográfica refinada con ritmo vertical claro y espaciado generoso.
- [ ] **Paso 2:** Rediseñar `Header.tsx` y `Footer.tsx` eliminando bordes innecesarios, aplicando navegación minimalista con enlaces claros y accesibilidad de teclado (`focus-visible`).
- [ ] **Paso 3:** Ejecutar `npm test` y `npm run build`.
- [x] **Paso 4:** Commit del cambio.

### Task 2.2: Desacoplamiento y Composición del Reproductor (`src/components/player/`)
**Files:**
- Modify: `src/components/player/SafePlayer.tsx`
- Modify: `src/components/player/EpisodeSelector.tsx`
- Create: `src/components/player/ServerSelector.tsx`
- Test: `src/__tests__/components/SafePlayer.test.tsx`
- Test: `src/__tests__/components/EpisodeSelector.test.tsx`

- [ ] **Paso 1:** Aplicar la skill `vercel-composition-patterns`:
  - Extraer la barra de servidores de `SafePlayer.tsx` hacia un subcomponente modular `ServerSelector.tsx`.
  - Desacoplar el estado de advertencia de sandbox y el iframe en bloques independientes.
- [ ] **Paso 2:** Optimizar `EpisodeSelector.tsx`: memorización de lista de episodios, renderizado eficiente con paginación por temporadas sin re-renderizar todo el árbol.
- [ ] **Paso 3:** Ejecutar tests unitarios existentes y añadir pruebas de cambio de servidor sin recarga completa.
- [x] **Paso 4:** Commit del cambio.

### Task 2.3: Refactorización de Catálogo, Tarjetas y Búsqueda (`src/components/media/` y `layout/`)
**Files:**
- Modify: `src/components/media/MediaCard.tsx`
- Modify: `src/components/media/MediaGrid.tsx`
- Modify: `src/components/media/FilterBar.tsx`
- Modify: `src/components/layout/LiveSearch.tsx`
- Test: `src/__tests__/components/MediaCard.test.tsx`
- Test: `src/__tests__/components/LiveSearch.test.tsx`

- [ ] **Paso 1:** Rediseñar `MediaCard.tsx`: imagen con aspecto cinematográfico, tipografía limpia, sin efectos de hover estridentes o etiquetas repetitivas.
- [ ] **Paso 2:** Optimizar `LiveSearch.tsx`: simplificar el hook de debounce, limpiar gestión de foco con teclado (flechas arriba/abajo y Escape) y destruir suscripciones al desmontar para no retener memoria.
- [ ] **Paso 3:** Comprobar con `npm test` (tests de debounce y Escape) y `npm run build`.
- [x] **Paso 4:** Commit del cambio.

---

## Fase 3: Capa de Rutas y Arquitectura Next.js (`src/app/`)

### Task 3.1: Optimización de Server Components y Streaming con Suspense
**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/peliculas/page.tsx`
- Modify: `src/app/series/page.tsx`
- Modify: `src/app/anime/page.tsx`
- Modify: `src/app/ver/[type]/[id]/page.tsx`

- [ ] **Paso 1:** Convertir las vistas de catálogo en Server Components puros donde la carga inicial de datos ocurra en el servidor sin serializaciones redundantes.
- [ ] **Paso 2:** Implementar límites `<Suspense fallback={<CatalogSkeleton />}>` granulares para que la interfaz responda al instante en la primera carga.
- [ ] **Paso 3:** Reducir la huella de `PlayerViewClient.tsx` para enviar al cliente únicamente los componentes que requieren interacción (reproductor, selector de episodios, botón de lista).
- [ ] **Paso 4:** Ejecutar `npm run build` y verificar que el tamaño de los chunks JS ("First Load JS") se mantenga óptimo o disminuya.
- [x] **Paso 5:** Commit del cambio.

### Task 3.2: Estados de Error, Carga y Limpieza Final (`src/app/`)
**Files:**
- Modify: `src/app/error.tsx`
- Modify: `src/app/loading.tsx`
- Modify: `src/app/not-found.tsx`

- [ ] **Paso 1:** Diseñar pantallas de error (`error.tsx`) y 404 (`not-found.tsx`) con un estilo minimalista y accionable (indicando qué ocurrió y cómo volver a navegar sin frustración).
- [ ] **Paso 2:** Ejecutar la skill `ce-simplify-code` para podar variables, importaciones huérfanas y comentarios redundantes en todo el código.
- [ ] **Paso 3:** Verificación final con suite completa: `npm test` y `npm run build`.
- [ ] **Paso 4:** Commit final de la fase.
