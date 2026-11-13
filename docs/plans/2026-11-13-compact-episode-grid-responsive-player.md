# Plan de Implementación: Selector de Temporadas en Desplegable, Grid Numérico Compacto de Capítulos y Diseño Responsive Integral

**Fecha:** 2026-11-13  
**Estado:** Pendiente de Aprobación  
**Objetivo:** Eliminar el desbordamiento horizontal de temporadas sustituyendo las pestañas por un menú desplegable contenido, transformar el listado de capítulos en una cuadrícula numérica densa y adaptable (solo con el número de episodio) con un banner del capítulo activo, y optimizar la responsividad de la vista de reproducción para móviles, tablets y monitores de escritorio.

---

## 1. Contexto y Objetivos Técnicos

1. **Selector de Temporadas en Menú Desplegable:**
   - En `EpisodeSelector.tsx`, reemplazar el contenedor con botones que se expande hacia la derecha por un `<select aria-label="Seleccionar temporada">` estilizado y perfectamente contenido en el ancho del encabezado de la tarjeta.
   - En series con múltiples temporadas, se muestra junto al selector de bloques de episodios (1-100), garantizando cero desbordamiento horizontal (`overflow-x: hidden`).
2. **Banner Informativo del Capítulo Seleccionado:**
   - Encima de la cuadrícula numérica, renderizar un indicador limpio y prominente:
     `Reproduciendo Capítulo {currentEpisode}: {activeEpisodeTitle}`.
   - Mantiene al usuario informado sobre el nombre y estado del episodio sin saturar cada botón individual.
3. **Cuadrícula Numérica Compacta y Adaptable:**
   - Cada botón de episodio mostrará **únicamente su número** (`1`, `2`, `3` ... `713`), sin títulos ni iconos internos.
   - Distribución mediante Grid responsivo con columnas fluidas: `grid-cols-5` en móviles (<640px), `sm:grid-cols-8` en tablets, y `md:grid-cols-10` / `lg:grid-cols-12` en desktop.
   - Tamaño de celda cuadrado y parametrizado con clases reutilizables (36-40px) para facilitar cualquier ajuste futuro.
4. **Responsividad Integral en la Página de Reproducción:**
   - En `ServerSelector.tsx`, compactar los botones de servidores en móviles mediante abreviaturas o flex-wrap controlado para no desplazar ni recortar los botones de pantalla completa, cine y compartir.
   - En `PlayerViewClient.tsx`, afinar espaciados y breakpoints para garantizar visualización perfecta desde 320px hasta pantallas ultraanchas.

---

## 2. Contratos de Interfaces y Componentes

### 2.1. Props de EpisodeSelector
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

### 2.2. Estructura del DOM de EpisodeSelector
```tsx
<div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
  {/* Header: Título y Controles Desplegables (Temporadas + Rango de Capítulos) */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/80 pb-3">
    ...
    <select aria-label="Seleccionar temporada">...</select>
    <select aria-label="Seleccionar rango de episodios">...</select>
  </div>

  {/* Active Episode Banner */}
  <div className="flex items-center gap-2 rounded-lg bg-surface-active px-3 py-2 text-xs">
    <span className="font-bold text-accent">Capítulo {currentEpisode}:</span>
    <span className="truncate text-zinc-200">{activeEpisodeTitle}</span>
  </div>

  {/* Dense Numeric Grid */}
  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 max-h-[300px] overflow-y-auto">
    {displayedEpisodes.map(ep => (
      <button key={...} aria-label={`Capítulo ${ep.episodeNumber}`}>
        {ep.episodeNumber}
      </button>
    ))}
  </div>
</div>
```

---

## 3. Matriz Secuencial de Micro-TDD

| Paso | Archivo de Test | Aserción Esperada (Fallo RED) | Archivo de Implementación | Comando de Terminal |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `src/__tests__/components/EpisodeSelector.test.tsx` | Falla: Renderiza un `<select>` para temporadas cuando hay más de una temporada | `src/components/player/EpisodeSelector.tsx` | `npm test -- src/__tests__/components/EpisodeSelector.test.tsx` |
| **2** | `src/__tests__/components/EpisodeSelector.test.tsx` | Falla: Los botones de episodios muestran únicamente el número `{ep.episodeNumber}` como texto | `src/components/player/EpisodeSelector.tsx` | `npm test -- src/__tests__/components/EpisodeSelector.test.tsx` |
| **3** | `src/__tests__/components/EpisodeSelector.test.tsx` | Falla: Renderiza banner con el título del episodio activo encima del grid numérico | `src/components/player/EpisodeSelector.tsx` | `npm test -- src/__tests__/components/EpisodeSelector.test.tsx` |
| **4** | `src/__tests__/components/SafePlayer.test.tsx` | Falla: La barra de control no desborda botones en pantallas estrechas | `src/components/player/ServerSelector.tsx` | `npm test -- src/__tests__/components/SafePlayer.test.tsx` |

---

## 4. Casos Límite y Manejo de Errores

1. **Episodio Activo sin Título:**
   - Si la API no provee `ep.title` o es una cadena vacía, el banner mostrará `"Capítulo {currentEpisode}"` como texto por defecto sin quedar en blanco.
2. **Temporadas Únicas (Películas o Anime de 1 Temporada):**
   - Si `seasons.length === 1`, no se renderiza el desplegable de temporadas para no añadir elementos innecesarios al encabezado.
3. **Cambio de Temporada y Reinicio de Rango:**
   - Al seleccionar una nueva temporada desde el desplegable, la página de episodios se reinicia automáticamente al rango 1 (`1-100`).

---

## 5. Criterios de Aceptación (Definition of Done - DoD)

- [x] Las temporadas se seleccionan mediante un desplegable `<select>` contenido en el ancho del componente.
- [x] Los botones de capítulos muestran exclusivamente el número del episodio en un grid denso y responsive.
- [x] Se muestra un banner con el nombre del capítulo activo sobre la cuadrícula numérica.
- [x] La barra de controles y el reproductor se adaptan fluidamente a pantallas móviles (320px+), tablets y desktop sin scroll horizontal no deseado.
- [x] La suite completa de tests de Vitest pasa al 100% en verde (`npm test`).
- [x] `npm run build` compila con éxito sin errores de tipado ni fallos de renderizado.
