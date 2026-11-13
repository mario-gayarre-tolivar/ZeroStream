# Antigravity Operating Rules: Autonomous TDD & Architectural Gating System

Este archivo define el protocolo permanente y obligatorio de desarrollo de software para este repositorio. Todas las herramientas y agentes de IA (Antigravity, Gemini, Claude, Cursor) deben obedecer estas reglas de forma determinista y sin excepciones no autorizadas.

---

## 0. Leyes de Hierro del Sistema (Iron Laws)

1. **PROHIBIDO EL CÓDIGO PREMATURO:** Ningún archivo de producción puede ser creado o modificado sin un plan aprobado previamente y una prueba unitaria fallando (`RED`) con evidencia en terminal.
2. **VERIFICACIÓN FÍSICA OBLIGATORIA:** No se asume el estado de un test. La IA debe ejecutar físicamente el test runner en la terminal (`run_command`) e inspeccionar el código de salida y stdout antes de continuar.
3. **STOP-AND-WAIT EN LAS PUERTAS:** Cuando el protocolo dicte una puerta de aprobación, la IA debe **detenerse inmediatamente** y esperar la confirmación del usuario. Prohibido ejecutar acciones de la siguiente fase en el mismo turno.
4. **TELEMETRÍA EN CADA MENSAJE:** Todo mensaje emitido por la IA debe comenzar con el encabezado de estado correspondiente: `📌 [FASE: ...]`.

---

## 1. Clasificación de Tareas (Protocolo de Vía Doble)

Antes de responder a cualquier petición, clasifica la intención en una de las dos vías:

### Vía Rápida (Fast-Track) — Exenta de Burocracia
- **Aplica únicamente a:** Consultas de sólo lectura, explicación de código, búsqueda en el repo, corrección de erratas/typos en documentación (`.md`), ajustes de formato o cambios de 1 línea puramente cosméticos sin impacto lógico.
- **Acción:** Responde o ejecuta directamente la herramienta sin pasar por las 4 fases.
- **Encabezado:** `📌 [VÍA RÁPIDA]`

### Vía Estándar (Protocolo Completo de 4 Fases)
- **Aplica obligatoriamente a:** Nuevas funcionalidades (features), modificación de lógica existente, refactorizaciones, corrección de bugs, creación de componentes o cambio en contratos de APIs/datos.
- **Acción:** Sigue rigurosamente las Fases 1 a 4 detalladas a continuación.

---

## 2. Fase 1 y 2: Reconocimiento y Convergencia por Hipótesis

**Encabezado obligatorio:** `📌 [FASE 2: CONVERGENCIA]`

Cuando el usuario plantee una necesidad, la IA tiene prohibido saltar a redactar código o planes genéricos. Debe ejecutar la convergencia en **una única ronda estructurada**:

1. **Reconocimiento Previo (Tool Recon):** Antes de generar el mensaje, la IA inspecciona el código existente con herramientas de lectura/búsqueda (`read_file`, `run_command` para listar directorios o revisar `package.json`, esquemas, rutas y dependencias).
2. **Mensaje Único Estructurado:**
   - **Resumen de Entendimiento:** Síntesis concisa de la necesidad y del estado actual del código.
   - **Alternativas Arquitectónicas:** Presenta 2 o 3 opciones técnicas viables con sus trade-offs (complejidad, rendimiento, deuda técnica), marcando explícitamente la **(Recomendada)** con su justificación técnica.
   - **Preguntas Críticas:** Un bloque conciso de máximo 3 o 4 preguntas indispensables sobre casos límite, modelo de datos o reglas de negocio ambiguas.
3. **Puerta de Parada:** La IA se detiene y espera la respuesta del usuario. No redacta el plan todavía.

---

## 3. Fase 3: Especificación del Plan y Anclaje Persistente

**Encabezado obligatorio:** `📌 [FASE 3: PLAN DE IMPLEMENTACIÓN]`

Una vez acordada la solución en la Fase 2, la IA formaliza el diseño en un archivo Markdown duradero.

### 3.1. Creación del Archivo de Plan
- Ruta obligatoria: `docs/plans/YYYY-MM-DD-<nombre-descriptivo-feature>.md` (ej. `docs/plans/2026-11-13-auth-session-provider.md`).
- El archivo debe crearse en disco utilizando las herramientas de escritura antes de pedir la aprobación.

### 3.2. Esquema Obligatorio del Plan
Todo plan debe incluir exactamente las siguientes secciones:
1. **Contexto y Objetivos:** Resumen de la solución técnica acordada.
2. **Contratos de Interfaces y Tipos:** Firmas TypeScript exactas, props de componentes, esquemas Zod o contratos de API a crear/modificar.
3. **Matriz Secuencial de Micro-TDD:** Tabla ordenada paso a paso:
   | Paso | Archivo de Test | Aserción Esperada (Fallo RED) | Archivo de Implementación | Comando de Terminal |
   | :--- | :--- | :--- | :--- | :--- |
   | 1 | `src/features/.../Component.test.tsx` | Falla: Renderiza estado inicial | `src/features/.../Component.tsx` | `npm test -- src/features/.../Component.test.tsx` |
   | 2 | `src/features/.../Component.test.tsx` | Falla: Dispara evento al click | `src/features/.../Component.tsx` | `npm test -- src/features/.../Component.test.tsx` |
4. **Casos Límite y Manejo de Errores:** Errores de red, validaciones vacías, datos corruptos.
5. **Criterios de Aceptación (Definition of Done - DoD):** Checklist con casillas `[ ]` de cada paso.

### 3.3. Puerta de Aprobación Estricta
En el chat, la IA publica únicamente:
- Un resumen ejecutivo de la arquitectura propuesta.
- La ruta al archivo creado (`docs/plans/...md`).
- La llamada explícita a la puerta: *"Por favor, revisa el plan. Responde 'Aprobado' o indica ajustes para iniciar la ejecución TDD."*
- **La IA se detiene en seco.** Queda terminantemente prohibido escribir código o tests antes de recibir la confirmación expresa del usuario.

---

## 4. Fase 4: Motor de Ejecución TDD Estricto (Red-Green-Refactor)

**Encabezado obligatorio:** `📌 [FASE 4: TDD - PASO X/N: <ESTADO>]`  
*(Donde `<ESTADO>` es `ROJO`, `VERDE` o `REFACTOR`)*

Una vez recibido el visto bueno del usuario, la IA ejecuta de forma continua y autónoma la matriz de TDD paso a paso bajo la siguiente disciplina:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. STUB TIPADO: Crear signatura mínima con 'Not implemented' │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. TEST ESPECÍFICO: Escribir el test que prueba la conducta │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. VERIFICAR ROJO: Ejecutar test en terminal (código != 0)   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. CÓDIGO MÍNIMO: Implementar solo lo necesario para pasar  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. VERIFICAR VERDE: Ejecutar test en terminal (código == 0) │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. REFACTOR & CHECK: Limpiar código + Marcar [x] en plan     │
└─────────────────────────────────────────────────────────────┘
```

### 4.1. El Protocolo de Rojo Semántico (No Fallos de Sintaxis)
1. **Creación del Stub:** Si el archivo de código no existe, crea primero el archivo con la firma de tipos exportada, pero con cuerpo vacío que arroje error semántico:
   ```typescript
   export function calculateDiscount(price: number): number {
     throw new Error("Not implemented");
   }
   ```
2. **Escribir el Test:** Redacta el caso de prueba unitario concreto en el archivo correspondiente (convención: `*.test.ts` o `*.test.tsx`).
3. **Evidencia Terminal OBLIGATORIA (ROJO):**
   - Ejecuta: `run_command` con `npm test -- <ruta-al-test>`.
   - Verifica que la salida reporte fallo legítimo de aserción (`AssertionError` o `Error: Not implemented`).
   - Si el test falla por error de compilación ajeno o error de sintaxis, corrígelo antes de proceder.

### 4.2. El Ciclo Verde (Green)
1. **Código Mínimo:** Escribe **estrictamente** el código de producción indispensable para satisfacer el test que acaba de fallar. Prohibido implementar lógica especulativa no cubierta por el test actual.
2. **Evidencia Terminal OBLIGATORIA (VERDE):**
   - Ejecuta: `run_command` con `npm test -- <ruta-al-test>`.
   - Confirma que la suite termina con salida de éxito (código de retorno 0).

### 4.3. Refactorización y Actualización de Estado
1. Tras alcanzar el verde, limpia duplicidades o mejora la legibilidad preservando 100% la conducta.
2. Los tests existentes no deben ser modificados durante el refactor.
3. Actualiza el archivo en `docs/plans/...md` marcando con `[x]` el paso completado.
4. Pasa de forma autónoma al siguiente paso de la matriz hasta completar todos los pasos.

---

## 5. Fronteras de Dominio y Excepciones

### 5.1. Componentes de UI (React / Next.js)
- **TDD Conductual y de Accesibilidad:** Se testea la conducta con `@testing-library/react` (eventos de usuario, renderizado condicional de loading/errores, roles accesibles como `getByRole('button', { name: /enviar/i })`).
- **PROHIBICIÓN ESTRICTA DE TESTEAR CSS:** Queda formalmente prohibido escribir aserciones sobre clases de Tailwind o estilos visuales cosméticos (ej. jamás testear `expect(el).toHaveClass('p-4 text-red-500')`).
- Los layouts visuales y ajustes cosméticos de CSS se validan visualmente en el navegador, no mediante tests unitarios frágiles.

### 5.2. Mocks en las Fronteras Externas
- Toda llamada a APIs de terceros, base de datos externa o servicios de red debe aislarse mediante adaptadores en memoria o MSW (Mock Service Worker).
- Los tests deben ser deterministas, ejecutarse en menos de 5 segundos y correr 100% offline.

### 5.3. Excepción Formal: Modo Spike / Prototipo
- Si el usuario incluye explícitamente en su mensaje las palabras `"Spike"` o `"Prototipo"`, la IA tiene autorización de explorar e implementar código sin tests previos.
- **Regla de Hierro del Spike:** Todo código resultante de un Spike se considera desechable y no puede fusionarse a ramas principales sin pasar posteriormente por el ciclo formal de TDD.
- Archivos estáticos (`.json`, `.md`, `tailwind.config.ts`, `vitest.config.mjs`) no requieren TDD.

---

## 6. Circuit-Breaker, Resiliencia y Continuidad de Sesión

### 6.1. Circuit-Breaker de 3 Intentos (Prevención de Bucles)
- Si un test falla y la IA no logra ponerlo en `GREEN` tras **3 modificaciones sucesivas**, la IA debe activar inmediatamente el Circuit-Breaker:
  1. Detener todas las operaciones de edición.
  2. Emitir un mensaje con el encabezado: `⚠️ [CIRCUIT-BREAKER ACTIVADO: BLOQUEO EN TEST]`.
  3. Explicar objetivamente: qué aserción falló, qué hipótesis se probaron en los 3 intentos y cuál es la duda arquitectónica.
  4. Solicitar la intervención y criterio del usuario antes de tocar más archivos.

### 6.2. Continuidad tras Pérdida de Contexto
Si una sesión se reinicia o se compacta el contexto en medio de un trabajo:
1. La IA debe leer el directorio `docs/plans/` y cargar el plan más reciente.
2. Identificar el primer paso con checkbox pendiente (`[ ]`).
3. Ejecutar el test runner en terminal sobre ese archivo para diagnosticar el estado actual y retomar el flujo TDD exactamente en el punto correcto.
