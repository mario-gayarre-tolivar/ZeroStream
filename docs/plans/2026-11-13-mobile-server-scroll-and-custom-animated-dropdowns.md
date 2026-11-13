# Plan de Implementación: Carril Táctil de Servidores en Móvil y Desplegables Cinemáticos Animados

**Fecha:** 2026-11-13  
**Estado:** Pendiente de Aprobación  
**Objetivo:** Rediseñar la barra de servidores de streaming para pantallas móviles dividiéndola en un carril horizontal táctil legible (sin textos cortados) con acceso directo, y crear un componente de menú desplegable personalizado y accesible con micro-animaciones rápidas (fade + scale + rotación de chevron) para temporadas y bloques de capítulos.

---

## 1. Contexto y Objetivos Técnicos

1. **Carril de Servidores en Móvil (Cero Textos Cortados):**
   - En `ServerSelector.tsx`, reestructurar el layout responsivo:
     - **En pantallas móviles (<640px):** Dos niveles ordenados. Nivel 1: Título "Servidores" y grupo de acciones rápidas (Compartir, Cine, Pantalla completa, Recargar). Nivel 2: Carril táctil horizontal (`overflow-x-auto no-scrollbar`) con píldoras de servidores que conservan su nombre legible íntegro (`whitespace-nowrap px-3.5 py-1.5`) y badge de calidad (`1080p`), permitiendo cambiar de servidor con un toque de pulgar.
     - **En desktop (≥640px):** Barra unificada horizontal con espacio holgado.
2. **Componente Desplegable Cinemático Animado (`CustomDropdown`):**
   - Crear un componente reutilizable, accesible y estilizado con la paleta cine (carbón profundo, borde ámbar sutil, desenfoque de fondo `backdrop-blur-md` y sombra profunda).
   - **Gatillo (Trigger):** Botón con icono, etiqueta activa y Chevron que rota 180° con transición fluida (`transition-transform duration-150`).
   - **Panel Flotante (Popover):** Animación de apertura rápida (150ms) con `opacity` y `scale` sutil (`origin-top`).
   - **Interacción y Accesibilidad:** Soporte de cierre al pulsar fuera (`click-outside`), soporte de tecla `Escape` y teclado, y roles accesibles `role="button"` con `aria-haspopup="listbox"` y `role="option"`.
3. **Integración en EpisodeSelector:**
   - Aplicar el desplegable cinemático animado tanto para la selección de **Temporadas** como para la selección de **Rangos de Capítulos (Eps 1-100)**.

---

## 2. Contratos de Interfaces y Componentes

### 2.1. Contrato de `CustomDropdown`
En `src/components/ui/CustomDropdown.tsx`:
```typescript
export interface DropdownOption {
  value: number | string;
  label: string;
  badge?: string;
}

export interface CustomDropdownProps {
  label: string;
  icon?: React.ReactNode;
  options: DropdownOption[];
  selectedValue: number | string;
  onSelect: (value: number | string) => void;
  className?: string;
  ariaLabel?: string;
}
```

### 2.2. DOM Estructurado en `ServerSelector.tsx`
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 sm:px-4 sm:py-2.5">
  {/* Fila 1 en móvil / Izquierda en desktop */}
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <Layers className="h-4 w-4 text-accent" />
      <span className="text-xs font-bold text-zinc-200">Servidores</span>
    </div>
    {/* Acciones en móvil agrupadas arriba a la derecha */}
    <div className="flex sm:hidden items-center gap-1">...</div>
  </div>

  {/* Carril táctil horizontal de servidores (Fila 2 en móvil) */}
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-0.5">
    {servers.map((server, idx) => (
      <button key={...} className="whitespace-nowrap shrink-0 px-3 py-1.5 ...">
        <span>{server.name}</span>
        <span className="text-[10px] px-1 py-0.2 rounded bg-surface border border-border/60">{server.quality}</span>
      </button>
    ))}
  </div>

  {/* Acciones en desktop */}
  <div className="hidden sm:flex items-center gap-1.5">...</div>
</div>
```

---

## 3. Matriz Secuencial de Micro-TDD

| Paso | Archivo de Test | Aserción Esperada (Fallo RED) | Archivo de Implementación | Comando de Terminal |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `src/__tests__/components/CustomDropdown.test.tsx` | Falla: Renderiza el gatillo con la opción activa y abre el menú flotante al hacer click | `src/components/ui/CustomDropdown.tsx` | `npm test -- src/__tests__/components/CustomDropdown.test.tsx` |
| **2** | `src/__tests__/components/CustomDropdown.test.tsx` | Falla: Llama a `onSelect` al seleccionar una opción y se cierra al presionar Escape | `src/components/ui/CustomDropdown.tsx` | `npm test -- src/__tests__/components/CustomDropdown.test.tsx` |
| **3** | `src/__tests__/components/EpisodeSelector.test.tsx` | Falla: Utiliza el componente `CustomDropdown` para temporadas y rangos de episodios | `src/components/player/EpisodeSelector.tsx` | `npm test -- src/__tests__/components/EpisodeSelector.test.tsx` |
| **4** | `src/__tests__/components/SafePlayer.test.tsx` | Falla: Cada botón de servidor muestra su nombre íntegro sin truncamiento de texto forzado | `src/components/player/ServerSelector.tsx` | `npm test -- src/__tests__/components/SafePlayer.test.tsx` |

---

## 4. Casos Límite y Manejo de Errores

1. **Cierre Automático al Hacer Clic Exterior:**
   - Si el menú de temporadas está abierto y el usuario hace clic en el video o fuera de la tarjeta, se debe cerrar de inmediato sin disparar eventos no deseados.
2. **Nombres de Servidores Largos en Móvil:**
   - La propiedad `whitespace-nowrap shrink-0` previene saltos de línea internos en los nombres ("VidLink", "Embed.su", "SmashyStream"), garantizando píldoras estables con ancho dinámico según el contenido.
3. **Múltiples Desplegables en Pantalla:**
   - Si el usuario abre el selector de rango de episodios mientras el de temporadas está abierto, el anterior se cierra para no superponer popovers en pantalla.

---

## 5. Criterios de Aceptación (Definition of Done - DoD)

- [x] Los servidores en móvil se despliegan en un carril horizontal táctil fluido donde cada nombre es 100% legible y visible.
- [x] `CustomDropdown.tsx` implementa animación micro-interactiva (150ms), chevron rotatorio y cierre con `click-outside`/`Escape`.
- [x] `EpisodeSelector.tsx` utiliza `CustomDropdown` para temporadas y rangos de episodios.
- [x] La suite de tests de Vitest pasa al 100% en verde (`npm test`).
- [x] `npm run build` compila con éxito sin errores de empaquetado ni SSR.
