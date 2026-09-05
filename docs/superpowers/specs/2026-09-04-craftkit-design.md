# craftkit — Diseño

**Fecha:** 2026-09-04
**Estado:** aprobado, pendiente de plan de implementación

## 1. Problema

Los agentes de codificación (Claude Code, Codex, OpenCode, Cursor, Windsurf, Gemini CLI)
producen código funcional pero inconsistente en calidad: la disciplina de ingeniería
depende de que el humano la recuerde y la pida en cada sesión.

`craftkit` es un paquete instalable que aporta esa disciplina de forma persistente:
cinco **skills** de flujo de trabajo (qué proceso seguir según el tipo de tarea) y un
catálogo de veintidós **rules** de ingeniería (qué estándares aplicar), cargados de
forma selectiva según el problema.

## 2. Objetivos

- Un único formato canónico que funcione en los seis agentes sin modificación.
- Rules **opcionales**: se cargan solo los que aplican a la tarea en curso.
- Instalación local (proyecto) o global (usuario), con selección de agentes.
- Extensible: añadir un rule o un skill es un archivo más, sin tocar el resto.
- Contenido verificable, no ensayístico.

## 3. No objetivos

- No es un linter ni un motor de reglas: no ejecuta nada, instruye al agente.
- No sustituye a `superpowers`; compone con él cuando está presente.
- No soporta agentes fuera del estándar Agent Skills en la v1.

## 4. Decisiones tomadas

| # | Decisión | Razón |
|---|---|---|
| D1 | Distribución vía npm + CLI `npx craftkit` | Multiplataforma real (Windows incluido), versionado semántico, actualización trivial |
| D2 | Soporte v1 de los seis agentes | Todos implementan el estándar Agent Skills; el coste marginal por agente es una fila en una tabla |
| D3 | Formato canónico `SKILL.md` con frontmatter `name` + `description` | Estándar abierto verificado en la documentación de OpenCode, Cursor, Gemini CLI y Codex |
| D4 | Rules como catálogo con carga selectiva | Progressive disclosure: el índice cuesta poco, los archivos completos solo se leen si aplican |
| D5 | Contenido de skills y rules en inglés | Mayor fiabilidad de seguimiento de instrucciones; terminología nativa; publicable |
| D6 | Topología: conjunto mínimo de cobertura + enlaces | Único enfoque con descubrimiento nativo en los seis agentes y sin doble carga |
| D7 | Prefijo `craft-` en los nombres de skill | Evita colisión con `/code-review` nativo de Claude Code y con `software-architect` ya instalado |
| D8 | Componer con `superpowers`, no duplicarlo | Dos fuentes de verdad en conflicto es peor que una dependencia opcional |
| D9 | Ejemplos de código en TypeScript | Legible para quien no lo usa; Python puntual donde ilustre mejor |
| D10 | `@clack/prompts` como única dependencia | Menos código propio de terminal que mantener |
| D11 | Node >= 20 | Test runner `node:test` estable incorporado |

## 5. Rutas de descubrimiento por agente

Verificadas en la documentación oficial de cada proyecto.

| Agente | Rutas de proyecto | Rutas globales |
|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| OpenCode | `.opencode/skills/`, `.claude/skills/`, `.agents/skills/` | `~/.config/opencode/skills/`, `~/.claude/skills/`, `~/.agents/skills/` |
| Codex CLI | — (sin skills de proyecto; solo `AGENTS.md`) | `~/.codex/skills/`, `~/.agents/skills/` |
| Cursor | `.cursor/skills/` | — |
| Windsurf | `.windsurf/skills/` | — |
| Gemini CLI | `.gemini/skills/`, `.agents/skills/` | `~/.gemini/skills/`, `~/.agents/skills/` |

**Consecuencia importante:** Codex CLI no admite skills a nivel de proyecto. En una
instalación local, Codex se cubre únicamente mediante el bloque gestionado de
`AGENTS.md`, y el instalador debe advertirlo explícitamente y recomendar `--global`.

## 6. Estructura del paquete

```
craftkit/
├── package.json                 bin: craftkit · engines.node >=20 · dep: @clack/prompts
├── skills/                      contenido canónico
│   ├── craft-architect/SKILL.md
│   ├── craft-spec-driven-development/SKILL.md
│   ├── craft-feature-implementation/SKILL.md
│   ├── craft-quick-implementation/SKILL.md
│   ├── craft-code-review/SKILL.md
│   └── engineering-rules/
│       ├── SKILL.md             índice: tabla rule -> applies-when
│       └── rules/               22 archivos .md
├── src/
│   ├── cli.js                   parseo de argumentos y despacho
│   ├── targets.js               tabla de la sección 5
│   ├── resolve.js               resolvedor de cobertura exacta
│   ├── link.js                  junction / symlink / copy
│   ├── manifest.js              lectura y escritura de .craftkit-manifest.json
│   ├── agentsmd.js              bloque gestionado en AGENTS.md
│   └── prompts.js               capa interactiva (@clack/prompts)
├── test/
├── templates/                   plantillas para add-rule y add-skill
└── docs/
```

## 7. Diseño de los skills

### 7.1 Anatomía común

Los cinco comparten la misma estructura:

1. **When to use / When NOT to use** — tabla de enrutado a los otros skills.
2. **Rule selection** — paso explícito de carga selectiva.
3. **Workflow** — checklist numerado; el agente crea un todo por ítem.
4. **Quality gates** — qué debe pasar antes de declarar la tarea hecha.
5. **Red flags** — tabla "pensamiento → realidad" contra la racionalización.

El bloque 5 es funcional, no decorativo: impide que el agente se salte pasos
convenciéndose de que la tarea es demasiado simple.

### 7.2 Enrutado entre skills

Los tres skills de implementación son un espectro de ceremonia. Cada uno declara
dónde termina su territorio.

| La tarea es… | Skill |
|---|---|
| Diseñar un sistema o servicio, elegir entre tecnologías, escribir un ADR | `craft-architect` |
| Cambio acotado sobre código que ya existe: un flag, un endpoint, un bugfix | `craft-quick-implementation` |
| Feature completa que atraviesa varias capas de un repo existente | `craft-feature-implementation` |
| Requisitos ambiguos, o subsistema/proyecto nuevo | `craft-spec-driven-development` |
| Revisar un diff, un PR o código ya escrito | `craft-code-review` |

**Regla del trinquete:** si a mitad de camino aparece complejidad oculta, se sube de
nivel de ceremonia. Nunca se baja.

### 7.3 Selección de rules

Cada skill declara un **núcleo** que se carga siempre y un conjunto de **condicionales**
que solo se añaden si se cumple su disparador. El núcleo nunca supera seis rules, de
modo que la suma jamás rebasa el tope.

| Skill | Núcleo (siempre) | Condicionales (si aplica el disparador) |
|---|---|---|
| `craft-quick-implementation` | simplicity-and-yagni, clean-code, error-handling, language-idioms, testing | refactoring |
| `craft-architect` | architecture, clean-architecture, ddd, api-design, security, performance | hexagonal-architecture (el dominio debe probarse sin infraestructura), design-patterns, concurrency, observability |
| `craft-feature-implementation` | solid, clean-code, testing, error-handling, api-design, security | dependency-management (se añade una librería), observability (el código corre en producción) |
| `craft-code-review` | code-review, anti-patterns, clean-code, solid, security, testing | performance, quality-gates |
| `craft-spec-driven-development` | engineering-workflow, quality-gates, testing, ddd, api-design | architecture |

**Tope:** ocho rules cargados como máximo. Si la selección lo supera, la tarea no se ha
triado y hay que dividirla. El skill lo dice explícitamente.

**Resolución de ruta:** los rules se leen en `../engineering-rules/rules/<nombre>.md`,
relativo al directorio del propio skill; funciona porque el instalador coloca todos
los skills como hermanos bajo una misma raíz. Si esa ruta no existe, el skill instruye
buscar `**/engineering-rules/rules/`.

### 7.4 Composición con superpowers

`craft-spec-driven-development` y `craft-feature-implementation` delegan en
`superpowers:writing-plans`, `superpowers:test-driven-development` y
`superpowers:systematic-debugging` **si están presentes**, y traen un flujo mínimo
propio si no. El paquete es autónomo sin superpowers y no lo contradice con él.

## 8. Catálogo de rules

### 8.1 Formato de cada archivo

Entre 60 y 120 líneas, para permitir cargar de cinco a ocho sin saturar el contexto.

```
---
name: error-handling
applies-when: El código cruza una frontera de I/O, red, parseo o entrada de usuario
---
# Error Handling
## Why                 1–2 líneas: qué rompe cuando se ignora
## Checklist           5–9 ítems imperativos y comprobables
## Do / Don't          pares mínimos de TypeScript, lado a lado
## Smells              señales observables de violación
## When to ignore      vía de escape explícita
```

El bloque **When to ignore** es obligatorio en todos los rules. Sin él, el agente los
aplica como dogma y produce sobreingeniería en tareas triviales.

### 8.2 Los veintidós rules

**Código** — `clean-code`, `solid`, `simplicity-and-yagni`, `language-idioms`,
`anti-patterns`, `refactoring`.
Umbrales concretos de nombrado, tamaño de función, número de parámetros y anidamiento;
heurísticas de detección para cada principio SOLID; regla de tres y generalidad
especulativa; catálogo de olores (objeto dios, modelo anémico, obsesión por primitivos,
cirugía con escopeta, envidia de funcionalidad, tipado por cadenas); movimientos de
refactor seguros bajo tests en verde y patrón de higuera estranguladora.

`language-idioms` contiene el método para descubrir el grano de cualquier lenguaje
(leer su stdlib, el linter configurado y el código existente) más una tabla compacta
para TypeScript, Python, Go, Java/Kotlin, C# y Rust. Se podrá extender a
`rules/lang/<lenguaje>.md` sin tocar el resto.

**Diseño** — `architecture`, `clean-architecture`, `hexagonal-architecture`, `ddd`,
`design-patterns`, `api-design`.
Acoplamiento y cohesión, dirección de dependencias, ADRs y funciones de aptitud; qué
vive en cada capa y la regla de dependencia; puertos y adaptadores conductores frente
a conducidos, y pruebas sin infraestructura; lenguaje ubicuo, contextos delimitados,
agregados como frontera de invariantes, objetos de valor y eventos de dominio, con la
condición explícita de cuándo DDD es excesivo; patrones indexados **por problema**, no
por nombre, y la advertencia de que un patrón elegido antes que el problema es un
antipatrón; semántica HTTP, idempotencia, versionado, paginación, compatibilidad hacia
atrás y formato de error `application/problem+json` (RFC 9457).

**Robustez** — `error-handling`, `concurrency`, `security`, `observability`,
`performance`.
Taxonomía de errores esperados frente a bugs, prohibición de capturas vacías, timeouts
obligatorios en todo I/O, reintentos solo sobre operaciones idempotentes con backoff
exponencial y jitter, separación entre mensaje al usuario y detalle al log; estado
mutable compartido, inmutabilidad, idempotencia, orden de adquisición de cerrojos,
contrapresión, cancelación y semántica de entrega al-menos-una-vez; OWASP aplicado con
validación en la frontera, consultas parametrizadas, distinción autenticación frente a
autorización, gestión de secretos, mínimo privilegio y CVEs de dependencias; logs
estructurados, identificadores de correlación, las tres señales, métricas RED y USE,
OpenTelemetry, qué **no** loguear (PII y secretos) y alertas sobre SLOs; medir antes de
optimizar, coste algorítmico, N+1, caché e invalidación, presupuestos de latencia.

**Proceso** — `testing`, `dependency-management`, `code-review`, `quality-gates`,
`engineering-workflow`.
Pirámide de pruebas, patrón AAA, un comportamiento por test, taxonomía de dobles,
determinismo, tests de contrato, cobertura como señal y nunca como objetivo, y qué no
merece test; evaluar antes de añadir una dependencia, lockfiles, semver, envolver
librerías de terceros en la frontera y auditoría de vulnerabilidades; revisión
priorizada (corrección, luego diseño, luego legibilidad, luego estilo), tamaño máximo
de PR y automatización del estilo para que la revisión humana no lo discuta;
definición de hecho, puertas de CI (build, lint, tipos, tests, auditoría) y prohibición
de saltárselas; desarrollo troncal, PRs pequeños, commits convencionales, feature flags
y entrega incremental.

### 8.3 El índice

`engineering-rules/SKILL.md` es únicamente una tabla `rule -> applies-when`, generada
entre marcadores para que nunca se desincronice del directorio `rules/`.

## 9. Instalador

### 9.1 Superficie del CLI

```
npx craftkit install     interactivo: detecta -> selecciona -> previsualiza -> aplica
npx craftkit status      qué hay instalado, dónde, y si es enlace o copia
npx craftkit update      re-aplica la versión actual sin tocar lo ajeno
npx craftkit uninstall   revierte usando el manifiesto
npx craftkit add-rule <nombre>
npx craftkit add-skill <nombre>
```

Flags para uso no interactivo: `--agents`, `--global`, `--local`, `--skills`,
`--dry-run`, `--copy`, `--force`, `--yes`. Sin TTY, los prompts no se muestran y los
flags son obligatorios.

### 9.2 Flujo interactivo

Tres preguntas: ámbito (proyecto o global), agentes (checkbox, con los detectados
premarcados) y skills (todos por defecto). Después imprime el plan —destino, modo y
qué agentes cubre cada ruta— y pide confirmación.

Detección: existencia de `~/.claude`, `~/.codex`, `~/.config/opencode`, `~/.gemini`,
`.cursor`, `.windsurf`.

### 9.3 Resolvedor de cobertura

Dado el conjunto de agentes seleccionados y el ámbito, busca un conjunto de rutas
destino donde **cada agente quede cubierto exactamente una vez**. El espacio de
búsqueda es diminuto (seis agentes; seis rutas candidatas en ámbito de proyecto, cinco
en ámbito global, según la tabla de la sección 5), así que se resuelve por enumeración
exhaustiva de subconjuntos: determinista, óptimo y explicable, lo que permite imprimir
por qué se eligió cada ruta.

Criterio de desempate entre soluciones válidas del mismo tamaño: preferir la ruta
neutral `.agents/skills/`, luego la de mayor cobertura, luego orden alfabético.

Si no existe cobertura exacta, se elige la de menor solapamiento y se advierte de los
agentes que cargarían por duplicado.

### 9.4 Seguridad de la escritura

- Cada destino lleva un `.craftkit-manifest.json` con versión, modo y archivos
  escritos. `update` y `uninstall` operan **solo** sobre lo registrado ahí.
- Si un destino existe y no está en el manifiesto, se aborta con mensaje claro.
  Sobrescribir exige `--force`.
- `AGENTS.md` se modifica solo entre `<!-- craftkit:start -->` y `<!-- craftkit:end -->`,
  preservando el resto del archivo. Si el archivo no existe, se crea.
- Enlaces: `symlink` en POSIX, *junction* de directorio en Windows (no requiere
  privilegios de administrador). Si falla, cae a copia con aviso y lo registra en el
  manifiesto; la instalación no aborta.
- Instalar dos veces deja el mismo estado.

## 10. Extensibilidad

Añadir un rule son dos pasos que `add-rule` automatiza: crear `rules/<nombre>.md` desde
`templates/rule.md` y regenerar la tabla del índice entre sus marcadores. `add-skill` es
análogo con `templates/skill.md`, e incluye el skill nuevo en la tabla de enrutado.

Como la tabla del índice se **regenera** en lugar de editarse, el catálogo no puede
desincronizarse del directorio.

## 11. Verificación

Con `node:test`, sin dependencias de prueba.

- **Resolvedor**: casos tabulados `conjunto de agentes + ámbito -> destinos esperados`,
  afirmando que ningún agente queda cubierto dos veces. Incluye el caso de Codex en
  ámbito local (sin ruta de proyecto).
- **Instalación**: contra directorios temporales que simulan los `home` de cada agente.
  Comprueba el árbol resultante, la idempotencia de instalar dos veces, que `uninstall`
  deja el disco limpio, que un destino ajeno aborta sin `--force`, y que el fallo de
  enlace cae a copia.
- **`AGENTS.md`**: contenido previo preservado; segunda ejecución reemplaza el bloque en
  lugar de añadir uno nuevo.
- **Lint de contenido**: todo `SKILL.md` tiene frontmatter válido, `name` que casa con su
  directorio y con `^[a-z0-9]+(-[a-z0-9]+)*$`, y `description` de 1 a 1024 caracteres;
  todo rule del índice existe en disco y todo archivo del directorio figura en el
  índice; todo rule tiene las cinco secciones obligatorias, incluida **When to ignore**;
  ningún enlace relativo roto.

## 12. Fuentes

- OpenCode — Agent Skills: https://opencode.ai/docs/skills/
- Cursor — Agent Skills: https://cursor.com/docs/skills
- Gemini CLI — Agent Skills: https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/using-agent-skills.md
- Codex CLI — AGENTS.md y skills: https://www.agensi.io/learn/codex-cli-agents-md-complete-guide
- Windsurf — configuración de skills: https://github.com/addyosmani/agent-skills/blob/main/docs/windsurf-setup.md
