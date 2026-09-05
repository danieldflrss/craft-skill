# AGENTS.md — guía para contribuir a craftkit

Esta es la guía de contribución de este repositorio (el proyecto craftkit en sí, no el bloque
que craftkit instala en el `AGENTS.md` de quien lo use). No lleva marcadores
`<!-- craftkit:start/end -->`: no la toca ningún comando de craftkit, se edita a mano.

## Idioma y contenido de `skills/`

Todo el contenido bajo `skills/` (reglas y `SKILL.md` de los skills) se escribe **en inglés**,
sin excepción: lo leen agentes, no personas, y el resto del ecosistema de skills de este
proyecto también está en inglés. La única excepción de idioma en todo el repositorio es este
`AGENTS.md` y el `README.md` de la raíz, que están en español porque el README es para quien
instala el paquete y este proyecto lo mantiene en español.

Los ejemplos de código dentro de reglas y skills van **en TypeScript** (bloques ```ts), aunque la
regla en sí sea de propósito general — es el lenguaje común que cualquier agente puede leer sin
ambigüedad de sintaxis.

## Tamaño de una regla

Cada archivo en `skills/engineering-rules/rules/*.md` tiene como máximo **120 líneas**. Si una
regla no cabe, es una señal de que cubre más de una condición — divídela en dos reglas con
`applies-when` distintos en vez de alargarla.

## Las cinco secciones obligatorias

Toda regla (generada con `npx craftkit add-rule <nombre>` a partir de `templates/rule.md`) debe
conservar exactamente estas cinco secciones, en este orden:

1. **Why** — una o dos frases: qué se rompe si se ignora la regla.
2. **Checklist** — afirmaciones imperativas y verificables.
3. **Do / Don't** — un bloque de código TypeScript con el patrón incorrecto y el correcto.
4. **Smells** — señales observables de que la regla se está incumpliendo.
5. **When to ignore** — la válvula de escape explícita. **Nunca se deja vacía**: toda regla
   tiene un contexto legítimo en el que no aplica, y dejarlo sin decir invita a aplicarla como
   dogma.

## Regenerar el índice

Cualquier cambio dentro de `skills/engineering-rules/rules/` (crear, borrar o renombrar un
archivo, o cambiar su `applies-when`) exige regenerar la tabla de `engineering-rules/SKILL.md`.
No se edita esa tabla a mano — se regenera con:

```bash
npx craftkit add-rule <nombre>
```

si el cambio es alta de una regla nueva, o llamando a `syncIndex` (ver `src/index-gen.js`) para
cualquier otro cambio sobre reglas existentes. Un índice desincronizado del contenido real de
`rules/` es peor que no tener índice.

## Antes de commitear

`npm test` debe terminar en verde, sin skips añadidos por ti, antes de cualquier commit:

```bash
npm test
```

Ejecuta `node --test` sin argumentos — no se cambia ese script para apuntar a un subconjunto de
archivos.

## Directorios temporales en tests

Todo test que cree un directorio temporal (típicamente con `fs.mkdtemp(path.join(os.tmpdir(),
'craftkit-...'))`) debe **registrar esa ruta** y limpiarla con `fs.rm(root, { recursive: true,
force: true })` en un hook `after` — nunca depender de que el sistema operativo lo purgue. El
patrón ya usado en `test/add.test.js` (un array `roots` que acumula cada ruta creada y un único
`after` que las borra todas) es el que hay que seguir; no crear directorios temporales sueltos
sin ese seguimiento.

## Instalador real, no mocks

El instalador (`src/commands/install.js`, `src/link.js`, `src/resolve.js`) se ejerce contra
directorios temporales reales, no contra un sistema de archivos simulado — `src/link.js` decide
entre symlink, junction (Windows) y copia según lo que el sistema operativo permita, y esa
decisión solo se puede verificar ejecutándola de verdad.
