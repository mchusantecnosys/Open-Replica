# Replica Skill Workbench (OpenCode + Google Antigravity)

Plataforma interactiva de ingeniería inversa clean-room y generador de skills para OpenCode y Google Antigravity que guía el ciclo completo de 11 etapas (`/replica-recon` a `/replica-deploy`), ejecuta en tiempo real los 5 motores deterministas de verificación y exporta el paquete completo de skills (`SKILL.md`), scripts en Python (`parity.py`, `imgdiff.py`, `reviews.py`, `listing.py`, `sweep.py`) e instalador (`install.sh`).

### User Review & Critical Decisions

> [!IMPORTANT]
> A continuación se resumen las decisiones confirmadas para la construcción de **Replica Skill Workbench** antes de pasar a la implementación de código.

- **Entregables Confirmados**: Aplicación web interactiva (Workbench) acompañada de un generador y exportador del paquete completo descargable (11 archivos `SKILL.md`, 5 scripts deterministas en Python e `install.sh` listos para OpenCode y Google Antigravity).
- **Alcance del Exportador de Skills**: Generación íntegra y detallada de los 11 skills del pipeline (`/replica-recon` a `/replica-deploy`), el código fuente real y ejecutable en Python 3 de los 5 verificadores (`parity.py`, `imgdiff.py`, `reviews.py`, `listing.py`, `sweep.py`) y el script `install.sh` con soporte `--global` y `--local`.
- **Targets y Presets Soportados**: Incluye los presets completos de **Calendly → ChronosFlow** y **Splitwise → FairShare**, además de un creador interactivo de **Target Personalizado** (nombre original, dominio, colores hex prohibidos, nombre del clon, dominio clean-room, paleta nueva y mejoras sobre quejas reales).

---

### 1. Overview & Core Concept

- **What It Does**: Permite simular, auditar y exportar el ecosistema **Replica Skill** para OpenCode y Google Antigravity. Cubre desde el reconocimiento de pantallas (`S01..S04`) y arquitectura segura (Row-Level Security, validación Zod), hasta la verificación determinista de paridad funcional, comparación estructural de bordes Sobel agnóstica al color, filtrado de reseñas reales sin alucinaciones, validación de metadatos de tiendas (iOS App Store / Google Play) y barrido pre-despliegue de marcas/colores prohibidos.
- **Target Audience / Persona**: Ingenieros de software, arquitectos de producto y creadores de agentes en OpenCode y Google Antigravity que reconstruyen aplicaciones existentes bajo principios *clean-room* superando los puntos de dolor del producto original.
- **Key Value**: Elimina la subjetividad del LLM mediante compuertas deterministas (`exit_code: 0 | 1`) antes de permitir el lanzamiento, y entrega todos los artefactos y definiciones `SKILL.md` listos para instalar en entornos locales o globales.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Selección o Creación de Target**: El usuario alterna entre *Calendly → ChronosFlow*, *Splitwise → FairShare* o abre el modal de *Custom Target* para definir su propio objetivo de reconstrucción clean-room, actualizando reactivamente todos los motores y artefactos.
  2. **11-Skill Pipeline Runner**: Línea de tiempo interactiva con las 11 etapas (`/replica-recon` a `/replica-deploy`), ejecución paso a paso o simulación automática, consola de logs OpenCode TUI / Antigravity Subagent y telemetría en vivo de las 4 compuertas críticas.
  3. **Deterministic Python Engines Lab**: Laboratorio con 5 sandboxes interactivos donde el usuario puede alterar prioridades/estados en `features.csv` y `bugs.md` (`parity.py`), simular deriva de layout o ausencia de sidebar sobre canvas HTML5 con mapa de bordes Sobel (`imgdiff.py`), romper o validar URLs de reseñas 1–3 estrellas (`reviews.py`), inyectar violaciones de caracteres o términos prohibidos en App Store/Play Store (`listing.py`) y ejecutar el sanitizador automático de código fuente (`sweep.py`).
  4. **Live Clone vs. Original UI Preview**: Comparativa lado a lado entre la interfaz original (con sus limitaciones y paywalls) y el clon clean-room con interruptor en vivo para activar/desactivar las mejoras de `/replica-entrepreneur`.
  5. **`replica/` State Explorer**: Explorador interactivo de todos los artefactos generados por el pipeline (`recon.md`, `features.csv`, `architecture.md`, `design-system.md`, `security-checklist.md`, `bugs.md`, `diff-report.md`, `entrepreneur.md`, `brand.md`, `store-listing.json`, `deploy-manifest.md`) con edición y copia directa.
  6. **Export `SKILL.md` & Repo Generator**: Visor de código y descargador de los 11 archivos `SKILL.md` (con frontmatter YAML y reglas para OpenCode y Antigravity), los 5 scripts en Python 3 listos para CLI, el script `install.sh` y descarga de paquete completo (bundle script auto-extraíble o archivos individuales).

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Consola de ingeniería de alta precisión (Developer Workbench & Verification Console), sobria, de alto contraste y densidad controlada.
  - *Color Palette & Mood*: Regla 60-30-10 sobre lienzo oscuro técnico:
    - 60% Dominante: Slate profundo (`#0F172A` / `bg-slate-950`) para el fondo principal y áreas de código.
    - 30% Estructural: Superficies de panel (`#1E293B` / `bg-slate-900`) con divisores finos de `1px` (`border-slate-800`) y texto secundario (`text-slate-400`).
    - 10% Acento Semántico: Esmeralda (`#10B981`) para compuertas aprobadas (`SHIPPABLE`, `exit_code: 0`), Ámbar (`#F59E0B`) para advertencias o evidencia delgada (`THIN_EVIDENCE`), y Carmesí (`#EF4444`) para bloqueos de lanzamiento (`BLOCKED_DIRTY_SWEEP`, bugs `S1/S2` abiertos o deriva estructural en `imgdiff.py`).
  - *Typography & Hierarchy*:
    - *Display & UI Structure*: `Plus Jakarta Sans` para encabezados y navegación.
    - *Body Prose*: `DM Sans` para descripciones y documentación de artefactos.
    - *Data, CLI & Telemetry*: `JetBrains Mono` con `font-variant-numeric: tabular-nums` obligatorio en porcentajes de paridad, conteos de caracteres, coordenadas de grilla `4x4`, códigos de salida y visores JSON/Python.
  - *Component Styling & Layout*: Diseño de 1440px de ancho máximo con barra superior limpia en 3 zonas, pestañas de navegación de una sola línea (`whitespace-nowrap shrink-0`), elevación de un único nivel con bordes sutiles de `1px` y metadatos en texto limpio separado por `·` (sin píldoras decorativas estáticas).

- **Interactive Feedback & Motion**: Transiciones de 150ms en cambios de pestaña y etapa, redibujado instantáneo en el comparador Sobel de doble `<canvas>`, confirmación visual al copiar comandos o descargar scripts, y estados vacíos/filtrados claros en todas las tablas.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Ejecución Determinista en Cliente + Exportación de Scripts Python 3 Reales**
  - *Chosen Approach*: Replicar exactamente los algoritmos matemáticos y reglas de negocio de `parity.py`, `imgdiff.py`, `reviews.py`, `listing.py` y `sweep.py` en servicios puros reactivos dentro del navegador (incluyendo el operador Sobel sobre píxeles reales en `<canvas>`), y al mismo tiempo empaquetar el código fuente completo en Python 3 estándar (sin dependencias pesadas externas) en el módulo de exportación.
  - *Why*: Permite experimentar y romper las compuertas en milisegundos desde la interfaz web sin latencia de red, garantizando que el usuario también obtenga los scripts CLI en Python exactos para usarlos con OpenCode y Antigravity en su máquina local.
  - *Alternatives Considered*: Ejecutar Python únicamente en backend para cada pulsación de tecla en el linter de App Store; descartado porque añade latencia innecesaria a una validación puramente determinista.

- **Decision 2: Creador de Target Personalizado Reactivo**
  - *Chosen Approach*: Además de los presets *Calendly* y *Splitwise*, proveer un formulario modal validado con Reactive Forms para registrar cualquier aplicación objetivo personalizada, propagando sus términos prohibidos (`originalName`, `originalDomain`, `originalHex`) y su identidad clean-room a los 5 motores, la vista previa y los artefactos exportados.
  - *Why*: Convierte el Workbench de una demostración fija a una herramienta de trabajo reutilizable para cualquier proyecto nuevo en OpenCode o Antigravity.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     Replica Skill Workbench (Angular 21)                     │
│  Top Bar: Brand Wordmark  ───  5 Single-Line Workspace Tabs  ───  New Target │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌───────────────────────┐  ┌────────────────────────┐  ┌───────────────────────┐
│  Reactive State Store │  │  Pure Verification     │  │  Skill & Script       │
│  (Angular Signals)    │  │  Engines (Pure Logic)  │  │  Bundle Generator     │
│  - Active Preset/Cust │  │  - ParityEngine        │  │  - 11 SKILL.md specs  │
│  - Pipeline Step 1..11│  │  - SobelImgDiffEngine  │  │  - 5 Python CLI tools │
│  - Features & Bugs    │  │  - ReviewsValidator    │  │  - install.sh script  │
│  - Reviews & Listing  │  │  - StoreListingLinter  │  │  - Full Shell Bundle  │
│  - Source Code Files  │  │  - CleanRoomSweep      │  └───────────┬───────────┘
└───────────┬───────────┘  └───────────┬────────────┘              │
            │                          │                           │
            ▼                          ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Interactive Workspace Views                          │
│  [1. Pipeline Runner] [2. Python Engines Lab] [3. Clone vs Original Preview] │
│  [4. replica/ State Explorer (11 Artifacts)]  [5. Export SKILL.md & Repo]    │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `TargetPreset`: Identificadores de la app original (`originalName`, `originalDomain`, `originalHex`, `originalSecondaryHex`) y del clon clean-room (`cloneName`, `cloneDomain`, `cloneHex`, `cloneSecondaryHex`, `category`, `sizing`, `painPointFixed`).
  - `FeatureRow` & `BugRow`: Filas de `replica/features.csv` (`priority: 'must' | 'should' | 'could'`, `clone: 'yes' | 'partial' | 'no' | 'skip'`) y `replica/bugs.md` (`severity: 'S1' | 'S2' | 'S3'`, `status: 'open' | 'fixed'`).
  - `ReviewRow`: Filas de `replica/reviews.csv` con validación de protocolo `http://` o `https://`, calificación y agrupación por tema.
  - `StoreListing`: Campos de iOS (`iosTitle`, `iosSubtitle`, `iosKeywords`, `iosDescription`) y Android (`androidTitle`, `androidShort`, `androidFull`).
  - `CodeFile`: Archivos simulados del repositorio escaneados en vivo por el motor `sweep.py`.

- **Interactive Component & State Mapping**:
  - **Pipeline Runner**: Al seleccionar cualquier etapa `1..11` o activar *Simulate Full Pipeline*, actualiza `currentSkillIdx`, registra comandos `$ opencode run /replica-*` en la consola TUI y sincroniza las tarjetas de telemetría con los valores calculados por los 5 motores.
  - **Engines Lab**:
    - *Parity*: Selectores por fila para prioridad y estado del clon + botones para alternar estado `OPEN/FIXED` de bugs `S1..S3` + botón para añadir nueva funcionalidad o bug.
    - *ImgDiff*: Renderizador dual `<canvas>` (`360x240`) que dibuja la pantalla `S01` original y el clon con su paleta respectiva, calcula la luminancia `0.299R + 0.587G + 0.114B`, aplica el filtro de bordes Sobel (`threshold = 24.0`), evalúa la similitud estructural en una grilla `4x4` y enmarca en rojo las celdas con similitud `< 70%` cuando se activan los controles *Simulate Calendar Grid Drift* o *Simulate Missing Sidebar*.
    - *Reviews*: Conmutador de validez de URL por reseña y formulario rápido para agregar nuevas reseñas reales y verificar el cambio de `THIN_EVIDENCE` a `VERIFIED_OPPORTUNITY`.
    - *Listing*: Inputs reactivos con contadores tabulares (`30`, `30`, `100`, `80` caracteres), botón *Inject Store Violations* y botón *Auto-Fix Metadata*.
    - *Sweep*: Editor de archivos de código en vivo y botón *Auto-Sanitize All Files* que reemplaza todas las referencias de marca, dominio y colores hex originales por los tokens clean-room.
  - **Export & Repo Generator**: Selector para inspeccionar individualmente cada uno de los 11 archivos `.agents/skills/replica-*/SKILL.md`, los 5 scripts `.py` y `install.sh`, con botones para copiar al portapapeles o descargar tanto archivos individuales como un script auto-instalador completo (`replica-skill-installer.sh`) que recrea toda la estructura de carpetas para OpenCode y Google Antigravity.
