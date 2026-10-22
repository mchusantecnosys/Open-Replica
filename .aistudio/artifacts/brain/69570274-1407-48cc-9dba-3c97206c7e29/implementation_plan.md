# Open Replica Skill — Paquete de 11 Habilidades para OpenCode y Google Antigravity

Transformación integral del proyecto para eliminar el simulador *Workbench* y convertirlo en un paquete real, universal e instalable de **11 habilidades (`SKILL.md`)** y **5 motores deterministas en Python** (inspirado en `Jakeschincariol/replica-skill`), diseñado nativamente para **OpenCode** y **Google Antigravity IDE / CLI**, acompañado de un portal de documentación e instalación estilo repositorio open-source.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas por el usuario en la Fase 1:**
> - **Entornos de Agentes Soportados**: **OpenCode** (`.opencode/skills/` y `~/.config/opencode/skills/`) y **Google Antigravity IDE/CLI** (`.agents/skills/` y `~/.gemini/config/skills/`).
> - **Contenido de los 11 `SKILL.md`**: **Genéricos y universales** para analizar, reconstruir en sala limpia (*clean-room*), probar, mejorar y desplegar **cualquier aplicación desde cero**, eliminando datos preconfigurados de ejemplos como Calendly o Splitwise.
> - **Transformación de la Interfaz Web (Puerto 3000)**: Reemplazar por completo el *Workbench* de simulación por una **página de documentación e instalador interactivo estilo repositorio open-source**.

---

## 1. Overview & Core Concept

- **Qué hace**: Entrega el conjunto completo de 11 habilidades agénticas (`/replica-recon` hasta `/replica-deploy`) junto con sus 5 scripts verificadores en Python estándar (`parity.py`, `imgdiff.py`, `reviews.py`, `listing.py`, `sweep.py`) y su script de instalación (`install.sh`) directamente en el árbol del proyecto y accesibles vía HTTP para instalación en una sola línea (`curl ... | bash`) o descarga directa.
- **Audiencia Objetivo**: Desarrolladores e ingenieros de software que utilizan **OpenCode** o **Google Antigravity IDE / CLI** y desean instalar las 11 habilidades en su entorno local o global para clonar, auditar y superar aplicaciones existentes sin depender de API keys externas ni librerías pesadas (`pip`).
- **Valor Principal**: En lugar de simular un flujo ficticio en el navegador, el proyecto **es** la colección real de skills lista para instalarse en el agente de IA, con una interfaz web limpia que actúa como documentación oficial, generador de comandos de instalación personalizados e inspector de cada `SKILL.md` y script Python.

---

## 2. User Experience & Visual Design

### Flujos Principales del Usuario
1. **Instalación Rápida (Quick Install Builder)**:
   - Al entrar, el usuario ve la propuesta clara del paquete de 11 habilidades y un selector interactivo de instalación:
     - **Agente destino**: `OpenCode + Antigravity (Dual)`, `Solo OpenCode`, o `Solo Google Antigravity`.
     - **Alcance**: `Global (~/.config/opencode/skills & ~/.gemini/config/skills)` o `Local en proyecto (./.opencode/skills & ./.agents/skills)`.
     - **Método**:
       - Prompt directo para pegar en el agente (`Instala las 11 skills de replica-skill desde ...`).
       - Comando `curl -fsSL <APP_URL>/install.sh | bash -s -- --global` (servido directamente por el backend Express del proyecto).
       - Clonado o descarga del script auto-extraíble (`replica-skill-bundle.sh`).
2. **Catálogo de las 11 Habilidades (`/replica-recon` → `/replica-deploy`)**:
   - Flujo visual de las 11 etapas ordenadas editorialmente (`01. /replica-recon` a `11. /replica-deploy`).
   - Al seleccionar cualquier habilidad, el lector de código lateral muestra el archivo `SKILL.md` real, universal y completo (con frontmatter YAML, reglas de sala limpia, formato de artefactos en `replica/`, y compuertas de salida), con botones para copiar el contenido o descargar el archivo individual.
3. **Referencia de los 5 Verificadores Deterministas en Python (Zero-Dependency)**:
   - Sección dedicada a los 5 scripts en Python 3.8+ (`parity.py`, `imgdiff.py`, `reviews.py`, `listing.py`, `sweep.py`) que evitan que el LLM alucine porcentajes de paridad, comparaciones visuales o conteos de caracteres.
   - Muestra el uso por CLI, códigos de salida (`0` = aprobado, `1` = bloqueado), banderas soportadas y el código fuente Python real listo para copiar o descargar.
4. **Arquitectura de Artefactos (`replica/`)**:
   - Guía clara de cómo las 11 habilidades se comunican a través del sistema de archivos en la carpeta `replica/` del proyecto donde se ejecuten (`recon.md`, `features.csv`, `architecture.md`, `design-system.md`, `security-checklist.md`, `bugs.md`, `diff-report.md`, `reviews.csv`, `entrepreneur.md`, `brand.md`, `store-listing.json`, `deploy-manifest.md`), incluyendo plantillas vacías limpias listas para usar.

### Identidad Visual y Tema
- **Dirección Estética**: Portal de documentación técnica open-source y registro de paquetes CLI (inspirado en documentación de herramientas de ingeniería limpias y sobrias).
- **Paleta de Colores (Regla 60-30-10)**:
  - **60% Lienzo Neutro Dominante**: Pizarra profunda (`#020617` / `bg-slate-950`) para lectura prolongada sin fatiga visual.
  - **30% Superficies Estructurales**: Paneles de documentación y visores de código en tono `bg-slate-900` con bordes sutiles de `1px` (`border-slate-800`). Un único nivel de elevación sin tarjetas anidadas ni bordes laterales gruesos.
  - **10% Acento Funcional**: Esmeralda (`#10B981` / `emerald-500`) reservado exclusivamente para acciones primarias (copiar comando, descargar paquete, pestaña activa).
- **Tipografía y Jerarquía (Regla 2+1)**:
  - *Display / Títulos*: `Plus Jakarta Sans` (`600`/`700`, `tracking-tight`, `text-wrap: balance`).
  - *Prosa / Documentación*: `DM Sans` (`400`/`500`, medida de lectura cómoda de `65ch–75ch`).
  - *Código / Comandos CLI / Rutas*: `JetBrains Mono` con `tabular-nums`.
- **Disciplina Anti-Slop y Top Bar Contract**:
  - **Top Bar Contract estricto**: Una sola fila con 3 zonas separadas por `gap-8`:
    1. Marca tipográfica limpia en una línea (`replica-skill`).
    2. 4 enlaces de navegación concisos en una línea (`Install`, `11 Skills`, `Python Verifiers`, `Artifact Spec`).
    3. 1 botón de acción primaria (`Download Bundle`).
  - **Cero píldoras estáticas**: Los metadatos de cada skill (etapa, artefacto que genera, script asociado) se presentan como texto limpio separado por puntos medios (`·`), sin cajas tipo cápsula ni puntos verdes parpadeantes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Materializar los archivos físicos de las 11 Skills y 5 Scripts en el proyecto y servirlos también por HTTP**
  - *Enfoque Elegido*: Crear los archivos reales de las 11 habilidades (`SKILL.md`), los 5 scripts Python (`*.py`) y `install.sh` dentro del repositorio, además de exponer rutas en el servidor Express (`/install.sh`, `/bundle.sh`, `/skills/:skillId/SKILL.md`, `/scripts/:scriptName`) que devuelven texto plano (`text/plain`).
  - *Por qué*: Permite que un usuario instale las habilidades tanto clonando el repositorio y ejecutando `./install.sh`, como ejecutando `curl -fsSL <URL>/install.sh | bash` desde su terminal o pasándole la URL directamente a su agente OpenCode / Antigravity.
  - *Alternativas Descartadas*: Mantener los archivos solo como strings dentro de componentes de Angular, lo cual impedía que el repositorio funcionara como un paquete de skills real al clonarse.
- **Decisión 2: Redacción 100% Universal en los 11 `SKILL.md`**
  - *Enfoque Elegido*: Eliminar cualquier referencia fija a *Calendly*, *ChronosFlow* o *Splitwise* dentro de los `SKILL.md`. Cada habilidad recibe como entrada dinámica la app objetivo que el usuario indique al agente (por URL, capturas o nombre) y lee/escribe el estado real en `replica/`.
  - *Por qué*: Cumple fielmente el diseño de `Jakeschincariol/replica-skill`, donde las habilidades son herramientas universales reutilizables en cualquier proyecto.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Diagrama de Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   PROYECTO & SERVIDOR EXPRESS (SSR / API)                   │
│                                                                             │
│  ┌────────────────────────────────────┐   ┌──────────────────────────────┐  │
│  │ Archivos Físicos del Paquete       │   │ Endpoints de Distribución    │  │
│  │ - install.sh                       │   │ - GET /install.sh            │  │
│  │ - .agents/skills/replica-*/SKILL.md│──▶│ - GET /bundle.sh             │  │
│  │ - .opencode/skills/replica-*/...   │   │ - GET /skills/:id/SKILL.md   │  │
│  │ - scripts/*.py (5 motores)         │   │ - GET /scripts/:name.py      │  │
│  └────────────────────────────────────┘   └──────────────────────────────┘  │
└───────────────────────────────────────────────────────────┬─────────────────┘
                                                            │
                                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│             PORTAL WEB DE DOCUMENTACIÓN E INSTALACIÓN (ANGULAR)             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Top Bar: [replica-skill] ── [Install | 11 Skills | Verifiers | Spec]  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ 1. Interactive Install Config     │  │ 2. 11-Skill Reference Explorer │  │
│  │ - Selector: OpenCode / Antigravity│  │ - Lista 01..11 (/replica-*)    │  │
│  │ - Alcance: Global vs Local        │  │ - Visor SKILL.md universal     │  │
│  │ - Comandos listos (Prompt, CLI,   │  │ - Filtro por fase y búsqueda   │  │
│  │   curl, git clone) + Copy/Download│  │ - Copy & Download individual   │  │
│  └───────────────────────────────────┘  └────────────────────────────────┘  │
│                                                                             │
│  ┌───────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ 3. Deterministic Python Verifiers │  │ 4. replica/ Artifact Spec      │  │
│  │ - parity.py, imgdiff.py,          │  │ - Esquema de archivos que      │  │
│  │   reviews.py, listing.py, sweep.py│  │   conectan las 11 etapas       │  │
│  │ - Documentación de flags y JSON   │  │ - Plantillas base limpias      │  │
│  │   de salida + Código fuente real  │  │   (features.csv, reviews.csv)  │  │
│  └───────────────────────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Modelo de Datos y Contenido Universal de las 11 Skills
Cada una de las 11 habilidades tendrá su definición completa, exhaustiva y universal:
1. **`/replica-recon`**: Mapeo de pantallas públicas (`S01..SNN`) en resoluciones desktop (`1440x900`) y móvil (`390x844`), extracción de flujos de usuario, modelo de datos inferido, registro de tokens de marca prohibidos del original y creación de `replica/recon.md` + `replica/features.csv`.
2. **`/replica-architect`**: Diseño de arquitectura probada y segura (esquema SQL con Row-Level Security obligatorio, contratos de validación en servidor, manejo de zonas horarias en UTC, pagos en modo prueba) en `replica/architecture.md`.
3. **`/replica-design`**: Sistema de diseño *clean-room* en `replica/design-system.md` que preserva la ergonomía estructural pero reemplaza al 100% la paleta de colores, tipografía y micro-copy del competidor.
4. **`/replica-build`**: Construcción sistemática pantalla por pantalla (`S01..SNN`) con los 4 estados obligatorios (vacío, cargando, error, poblado) y actualización honesta de `replica/features.csv`.
5. **`/replica-backend`**: Implementación de migraciones, aislamiento multi-usuario (verificando que el Usuario B no pueda leer ni mutar datos del Usuario A), rate-limiting, `.env.example` y `replica/security-checklist.md`.
6. **`/replica-test`**: Pruebas E2E automatizadas en navegador headless, captura de pantallas del clon en `replica/clone-screens/` y registro clasificado de defectos (`S1`, `S2`, `S3`) en `replica/bugs.md`.
7. **`/replica-diff`**: Auditoría determinista ejecutando `parity.py` (100% *must-haves*, $\ge 80\%$ puntaje ponderado, $0$ bugs `S1`/`S2` abiertos) e `imgdiff.py` (comparación estructural de bordes Sobel en cuadrícula $4\times 4$ agnóstica al color), generando `replica/diff-report.md`.
8. **`/replica-entrepreneur`**: Investigación de quejas reales de usuarios ($1\text{–}3\star$) con URLs verificables en `replica/reviews.csv`, filtrado determinista con `reviews.py` ($\ge 3$ reseñas de $\ge 2$ fuentes por tema) e implementación de mejoras reales documentadas en `replica/entrepreneur.md`.
9. **`/replica-brand`**: Creación de identidad de marca original, verificación de cero colisión fonética o de marca registrada, activos SVG propios y `replica/brand.md`.
10. **`/replica-launch`**: Preparación de metadatos para App Store y Google Play en `replica/store-listing.json`, validados con `listing.py` (límites exactos de caracteres, sin términos superlativos prohibidos ni menciones a la marca original).
11. **`/replica-deploy`**: Barrido final del código fuente con `sweep.py` para bloquear el despliegue si persiste cualquier rastro del nombre, dominio o código hexadecimal de la aplicación original, emitiendo `replica/deploy-manifest.md`.

### Mapeo de Interacciones y Estado
- **Configurador de Instalación**: Cambia reactivamente las rutas y banderas de los comandos (`--global`, `--local`, `--agent opencode|antigravity|both`) y actualiza el comando `curl` con el origen actual de la aplicación.
- **Explorador de Skills y Scripts**: Búsqueda en tiempo real por comando o palabra clave, filtrado por etapa del flujo (`Recon & Design`, `Build & Test`, `Improve & Ship`), copiado al portapapeles con confirmación visual y descarga directa tanto de archivos individuales (`SKILL.md`, `.py`, `install.sh`) como del paquete auto-extraíble completo (`replica-skill-bundle.sh`).
