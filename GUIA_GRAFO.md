# Guía de Uso del Grafo de Conocimiento (`graphify`)

Esta guía explica cómo aprovechar el grafo de conocimiento generado en `graphify-out/` para reducir drásticamente el consumo de tokens con modelos de IA, cómo mantenerlo actualizado y cómo inspeccionarlo.

---

## 1. ¿Por qué usar este grafo?

En un proyecto estándar, cuando le pides a una IA entender una funcionalidad, la IA debe leer decenas de archivos fuente completos (consumiendo entre 20,000 y 80,000 tokens de contexto por pregunta).

Con el grafo de conocimiento local:
- El código se analiza previamente con **Tree-sitter (AST)** determinista y sin coste.
- Las dependencias, tipos, componentes y flujos se indexan en un grafo estructurado (`graph.json`).
- Los modelos pueden consultar únicamente las rutas y relaciones relevantes (`graphify query`), reduciendo la lectura a **500 - 1,500 tokens** (un ahorro de hasta **71x**).

---

## 2. Cómo lo utiliza un Modelo de IA o Agente

### A. Uso automático en Antigravity / Cursor / Claude Code
Si el asistente cuenta con la skill `graphify` (instalada en `.agents/skills/graphify`):
- El agente detecta automáticamente `graphify-out/graph.json`.
- En lugar de inspeccionar carpetas enteras con herramientas de lectura masiva, ejecuta internamente consultas dirigidas:
  ```bash
  graphify query "¿Cómo gestiona SafePlayer los servidores de respaldo?"
  ```
- Recibe un subgrafo conciso y responde de forma precisa y barata.

### B. Uso manual en prompts (con cualquier LLM)
Puedes indicar explícitamente a cualquier modelo en el chat que se apoye en el grafo:
> *"Usa el archivo `graphify-out/GRAPH_REPORT.md` para entender los módulos principales y consulta `graphify-out/graph.json` si necesitas rastrear las dependencias antes de sugerir cambios en el código."*

### C. Conexión mediante MCP (Model Context Protocol)
Si utilizas clientes que soportan servidores MCP (como Claude Desktop, editores con MCP o agentes avanzados):
```bash
python -m graphify --mcp
```
Expone las herramientas `query`, `path` y `explain` directamente como funciones invocables por el modelo.

---

## 3. Comandos de Consulta en Terminal

Puedes ejecutar consultas directamente en tu terminal de comandos (PowerShell o Bash) para explorar la arquitectura:

### 1. Consultar arquitectura o flujos (BFS amplio)
```bash
graphify query "cómo funciona el sistema de caché de catálogos"
```

### 2. Trazado en profundidad (DFS específico)
Rastrea la cadena de llamadas directa de un flujo concreto:
```bash
graphify query "flujo de datos desde getCatalog hasta MediaCard" --dfs
```

### 3. Limitar presupuesto de tokens
Asegura que el contexto extraído no supere un límite estricto:
```bash
graphify query "¿qué dependencias tiene AnimePage?" --budget 1000
```

### 4. Ruta más corta entre dos componentes (`path`)
Muestra cómo se conectan dos símbolos o módulos distantes:
```bash
graphify path "SafePlayer" "getCachedCatalog"
```

### 5. Explicación de un componente o nodo (`explain`)
Obtiene un resumen en lenguaje natural del propósito y conexiones de un nodo:
```bash
graphify explain "getCachedCatalog"
graphify explain "SafePlayer"
```

---

## 4. Cómo Mantener el Grafo Actualizado

Cuando agregues nuevas páginas, componentes o servicios al proyecto:

### Actualización Incremental (Recomendada)
Revisa únicamente los archivos que han cambiado desde la última ejecución gracias a `graphify-out/manifest.json`. Tarda apenas 1 a 2 segundos:
```bash
graphify --update
```

### Modo Vigilante Continuo (Watch Mode)
Si estás programando activamente y quieres que el grafo se actualice solo al guardar archivos:
```bash
graphify --watch
```
*No consume tokens de LLM para cambios de código; el análisis AST se ejecuta en milisegundos en tu máquina local.*

### Reconstrucción Completa (Full Rebuild)
Si borraste archivos, cambiaste ramas de Git drásticamente o quieres recalcular todo desde cero:
```bash
graphify --force
```

---

## 5. Inspección Visual Humana

Para ver el mapa completo de tu aplicación de forma interactiva:
1. Abre el archivo local en tu navegador (doble clic o arrastrar a Chrome/Edge):
   ```text
   graphify-out/graph.html
   ```
2. **Características del visor interactivo:**
   - Nodos coloreados por comunidad temática (12 comunidades).
   - Nodos más grandes representan **God Nodes** (abstracciones centrales).
   - Clic en cualquier nodo para resaltar sus dependientes y dependencias.
   - Búsqueda en tiempo real por nombre de componente o archivo.
