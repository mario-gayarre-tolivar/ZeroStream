# Plan de Implementación: Compatibilidad de Servidores (Sin Sandbox) y Paginación de Episodios Masivos (1-100)

**Fecha:** 2026-11-13  
**Estado:** Pendiente de Aprobación  
**Objetivo:** Eliminar bloqueos de iframe en servidores de streaming externos removiendo el atributo `sandbox` y resolver la limitación de 12 episodios en animes continuos (como One Piece) implementando detección dinámica en AniList y paginación por rangos de 100 episodios con selector directo en `EpisodeSelector`.

---

## 1. Contexto y Objetivos Técnicos

1. **Desbloqueo de Servidores de Streaming:**
   - En `SafePlayer.tsx`, retirar el atributo `sandbox` del `<iframe>`. Mantener `allow="autoplay; fullscreen; encrypted-media; picture-in-picture"` y `referrerPolicy="no-referrer-when-downgrade"`.
   - Incorporar un nuevo servidor alternativo de alta disponibilidad (`SmashyStream` / `VidSrc.pro`) en `src/services/embeds.ts`.
2. **Episodios Dinámicos de Animes Continuos:**
   - En `src/services/anilist.ts`, actualizar la query GraphQL para solicitar `nextAiringEpisode { episode }`.
   - Si `episodes` es `null`, calcular `totalEpisodes = nextAiringEpisode.episode - 1` (para One Piece ~1.124 episodios).
   - Para casos sin `nextAiringEpisode` o fallback local, usar el conteo real asociado al anime o TMDB en lugar del tope fijo de 12.
3. **Paginador por Rangos de 100 Episodios en la UI:**
   - En `EpisodeSelector.tsx`, si una temporada o anime tiene más de 100 capítulos:
     - Agrupar automáticamente en páginas de 100: `1 - 100`, `101 - 200`, ..., `701 - 800`, etc.
     - Añadir selector de rango/página que calcule automáticamente la página donde reside el `currentEpisode` activo.
     - Permitir saltar directamente a cualquier página (ej. Página 8 para acceder al capítulo 713).
     - Renderizar únicamente los episodios de la página activa para rendimiento óptimo del DOM.

---

## 2. Contratos de Interfaces y Tipos

### 2.1. AniList GraphQL Response Schema
En `src/services/schemas.ts`:
```typescript
export const AniListMediaSchema = z.object({
  id: z.number(),
  idMal: z.number().nullable().optional(),
  title: z.object({
    romaji: z.string().nullable().optional(),
    english: z.string().nullable().optional(),
    native: z.string().nullable().optional(),
  }),
  description: z.string().nullable().optional(),
  coverImage: z.object({
    extraLarge: z.string().nullable().optional(),
    large: z.string().nullable().optional(),
  }),
  bannerImage: z.string().nullable().optional(),
  averageScore: z.number().nullable().optional(),
  episodes: z.number().nullable().optional(),
  status: z.string().nullable().optional(),
  seasonYear: z.number().nullable().optional(),
  genres: z.array(z.string()).default([]),
  duration: z.number().nullable().optional(),
  nextAiringEpisode: z.object({
    episode: z.number(),
  }).nullable().optional(),
  trailer: z.object({
    id: z.string().nullable().optional(),
    site: z.string().nullable().optional(),
  }).nullable().optional(),
});
```

### 2.2. EpisodeSelector Paging Contract
En `src/components/player/EpisodeSelector.tsx`:
```typescript
interface EpisodeSelectorProps {
  seasons: Season[];
  currentSeason: number;
  currentEpisode: number;
  onSelectEpisode: (season: number, episode: number) => void;
  onSelectSeason: (season: number) => void;
  episodesPerPage?: number; // Default: 100
}
```

---

## 3. Matriz Secuencial de Micro-TDD

| Paso | Archivo de Test | Aserción Esperada (Fallo RED) | Archivo de Implementación | Comando de Terminal |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `src/__tests__/components/SafePlayer.test.tsx` | Falla: El iframe no debe poseer atributo `sandbox` | `src/components/player/SafePlayer.tsx` | `npm test -- src/__tests__/components/SafePlayer.test.tsx` |
| **2** | `src/__tests__/services/embeds.test.ts` | Falla: Servidor adicional SmashyStream presente en lista | `src/services/embeds.ts` | `npm test -- src/__tests__/services/embeds.test.ts` |
| **3** | `src/__tests__/services/anilist.test.ts` | Falla: Si `episodes` es null y `nextAiringEpisode` es 1125, calcula `totalEpisodes = 1124` | `src/services/anilist.ts` | `npm test -- src/__tests__/services/anilist.test.ts` |
| **4** | `src/__tests__/components/EpisodeSelector.test.tsx` | Falla: Agrupa 1.100 episodios en páginas de 100 y renderiza selector de página | `src/components/player/EpisodeSelector.tsx` | `npm test -- src/__tests__/components/EpisodeSelector.test.tsx` |
| **5** | `src/__tests__/components/EpisodeSelector.test.tsx` | Falla: Al cambiar al rango de página 8 (701-800), muestra el botón del episodio 713 | `src/components/player/EpisodeSelector.tsx` | `npm test -- src/__tests__/components/EpisodeSelector.test.tsx` |

---

## 4. Casos Límite y Manejo de Errores

1. **Animes Finalizados sin `episodes` ni `nextAiringEpisode`:**
   - Si una serie está finalizada pero la API no reporta episodios, consultar el total de temporadas en el mapa de TMDB o un valor mínimo seguro de 24 en vez de 12.
2. **Salto de Temporadas en Series Convencionales (TV):**
   - La paginación de 100 aplica transparentemente a cualquier temporada de serie con más de 100 capítulos (ej. telenovelas o anime estilo Naruto). Series estándar con 10-24 episodios muestran su lista directa sin paginador innecesario.
3. **Persistencia del Capítulo Activo al Cambiar de Rango:**
   - Si el usuario está viendo el capítulo 713 y abre el selector, la UI debe preseleccionar por defecto la página "Eps 701 - 800" para mantener visibilidad del capítulo activo.

---

## 5. Criterios de Aceptación (Definition of Done - DoD)

- [x] `SafePlayer.tsx` renderiza el iframe sin atributo `sandbox` con permisos `allow` intactos.
- [x] `embeds.ts` ofrece servidor adicional de streaming de alta disponibilidad.
- [x] `anilist.ts` extrae correctamente capítulos de animes en emisión continua (One Piece >1.000 capítulos).
- [x] `EpisodeSelector.tsx` pagina listas de >100 episodios en bloques de 100 con selector de página.
- [x] Todos los tests de la suite (`npm test`) pasan al 100% en verde.
- [x] `npm run build` compila limpiamente sin errores de tipos o SSR.
