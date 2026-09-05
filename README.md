# craftkit

`craftkit` es un paquete npm que instala skills y reglas de ingeniería en agentes de código
(Claude Code, OpenCode, Codex CLI, Cursor, Windsurf, Gemini CLI). Incluye cinco skills de flujo
de trabajo (`craft-architect`, `craft-code-review`, `craft-feature-implementation`,
`craft-quick-implementation`, `craft-spec-driven-development`) y un índice de 22 reglas de
ingeniería (`engineering-rules`) que cada skill consulta para decidir qué leer.

## Instalación

```bash
npx craftkit install
```

Sin flags, `install` es interactivo: pregunta qué agentes tienes, en qué ámbito instalar y con
qué skills, y muestra el plan antes de tocar el disco.

Para uso no interactivo (scripts, CI, o para saltarse las preguntas):

| Flag | Efecto |
| --- | --- |
| `--global` | Instala en el directorio global del agente (p. ej. `~/.claude/skills`). **El bloque gestionado de `AGENTS.md` se escribe igualmente en el directorio actual** — si lanzas `--global` desde un repositorio, ese repositorio (puede que no tenga nada que ver con lo que quieres cubrir) es quien recibe el bloque. |
| `--local` | Instala en el proyecto actual (p. ej. `.claude/skills`). |
| `--agents <lista>` | Agentes a cubrir, separados por comas (`claude-code,opencode`). Obligatorio si no hay TTY o si se pasa `--yes`. |
| `--skills <lista>` | Subconjunto de skills a instalar, separados por comas. Por defecto, todos. |
| `--dry-run` | Calcula y muestra el plan de instalación sin escribir nada. |
| `--copy` | Copia los archivos en vez de enlazarlos (symlink/junction). Útil cuando los enlaces no son viables. |
| `--force` | Sobrescribe un destino que ya existe y no está gestionado por craftkit. |
| `--yes` / `-y` | Omite las preguntas interactivas; exige que `--agents` (y normalmente `--local`/`--global`) ya vengan como flags. |

Ejemplo no interactivo:

```bash
npx craftkit install --agents claude-code,opencode --local --yes
```

craftkit calcula el **mínimo** de directorios de destino que cubren a todos los agentes pedidos:
si dos agentes comparten ruta de skills en el mismo ámbito (como `claude-code` y `opencode`, que
ambos leen `.claude/skills` en un proyecto), craftkit instala una sola vez ahí y lo señala como
"cubre: claude-code, opencode" en vez de duplicar los archivos.

## Agentes soportados

| Agente | Proyecto | Global |
| --- | --- | --- |
| Claude Code | `.claude/skills` | `~/.claude/skills` |
| OpenCode | `.agents/skills`, `.claude/skills` o `.opencode/skills` | equivalentes en `~` |
| Codex CLI | — (sin skills de proyecto) | `~/.agents/skills` o `~/.codex/skills` |
| Cursor | `.cursor/skills` | — (sin skills globales) |
| Windsurf | `.windsurf/skills` | — (sin skills globales) |
| Gemini CLI | `.agents/skills` o `.gemini/skills` | equivalentes en `~` |

**Advertencia sobre Codex CLI:** Codex no tiene directorio de skills a nivel de proyecto — solo
admite skills en su instalación global. Una instalación `--local` que incluya `codex` en
`--agents` no crea ningún destino de skills para él; lo cubre únicamente el bloque gestionado que
craftkit escribe en `AGENTS.md`, y ese mecanismo dispara con menos fiabilidad que el descubrimiento
nativo de skills. **Si usas Codex, instala con `--global`.**

## Cómo funciona la selección de reglas

Las reglas de `engineering-rules` **no se cargan todas de una vez**. Cada skill `craft-*` declara
un conjunto **core** (obligatorio) más un conjunto de reglas **condicionales**, cada una con su
disparador ("cuando aplica X"). Ningún skill carga más de ocho reglas para una misma tarea — si
el core más las condicionales activas superarían ese tope, la tarea no está suficientemente
acotada y hay que partirla antes de continuar.

El índice de `engineering-rules/SKILL.md` (la tabla `Rule | Read it when`) existe para **ajustar**
esa selección puntual — comprobar si una regla concreta aplica a la tarea que tienes delante —, no
para elegir reglas desde cero navegando la lista completa. Un agente que sigue un skill `craft-*`
ya sabe qué reglas leer sin abrir el índice.

## Extender: añadir reglas y skills

`add-rule` y `add-skill` escriben dentro de `packageRoot` (la raíz del paquete tal como lo ve
`craftkit`), así que solo tienen sentido sobre un **checkout clonado de craftkit**, no sobre una
invocación vía `npx`: bajo `npx`, `packageRoot` es un directorio de caché transitorio que
desaparece; como dependencia de proyecto sería `node_modules`, que la siguiente instalación
borra. Clona el repositorio y ejecuta los comandos ahí:

```bash
npx craftkit add-rule <nombre>
npx craftkit add-skill <nombre>
```

`add-rule` crea `skills/engineering-rules/rules/<nombre>.md` a partir de la plantilla y
**regenera automáticamente** la tabla del índice en `engineering-rules/SKILL.md`. `add-skill`
crea `skills/<nombre>/SKILL.md` a partir de su plantilla.

Tras añadir una regla o un skill, vuelve a ejecutar `craftkit install` para llevar el cambio a
donde lo lean tus agentes (si ya tienes una instalación enlazada por symlink al checkout, la
recoge automáticamente sin reinstalar).

El índice de reglas nunca se edita a mano: se regenera siempre a partir de los archivos en
`rules/` mediante `add-rule` (o `syncIndex`, ver `src/index-gen.js`). Eso mantiene el índice
alineado *si siempre pasa por ahí* — como cualquier archivo generado, puede desincronizarse si
alguien edita `engineering-rules/SKILL.md` a mano en vez de regenerarlo (ver `AGENTS.md`).

## Otros comandos

- `craftkit status` — lista qué hay instalado (destinos, agentes cubiertos, modo de cada skill).
- `craftkit update` — reinstala con la misma selección de agentes y ámbito ya registrada (o la
  que le pases por flag), útil tras actualizar la versión de craftkit.
- `craftkit uninstall` — elimina los skills instalados por craftkit y limpia el bloque gestionado
  de `AGENTS.md`.

## Desarrollo

Requiere Node >= 20. El paquete tiene **una sola dependencia de runtime** (`@clack/prompts`, usada
solo por el flujo interactivo).

```bash
npm test
```

ejecuta la suite completa con `node --test`, sin argumentos adicionales.
