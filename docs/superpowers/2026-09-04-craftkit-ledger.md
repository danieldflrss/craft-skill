# SDD ledger — plan: docs/superpowers/plans/2026-09-04-craftkit.md

Spec: docs/superpowers/specs/2026-09-04-craftkit-design.md (leído, autoridad vinculante)
Rama: feat/craftkit — repo C:/Users/daniel/Documents/skills
Baseline: sin tests previos (greenfield; package.json lo crea la Task 1)

## Escaneo previo — pares de tareas que comparten archivo o interfaz

| Productor | Consumidor | Interfaz | Resultado |
|---|---|---|---|
| T1 | T11, T12 | `parseFrontmatter(text) -> {data, body}` | OK — misma forma en los tres |
| T2 | T3 | `AGENTS` `{label, detect, paths:{project,global}}` | OK — la tabla sintética del test 7 de T3 usa esa forma exacta |
| T2 | T7 | `AGENTS.detect[]`, `resolveDest(p, ctx)` | OK |
| T2 | T8, T9 | `resolveDest`, `AGENTS.paths[scope]` | OK |
| T3 | T8, T10 | `{destinations:[{path,covers}], uncovered, duplicated}` | OK — T8 hace spread y conserva `path`/`covers`; `describe()` de T10 los usa |
| T4 | T8 | `materializeSkill() -> {mode, files}` | OK |
| T5 | T8, T9 | `readManifest/writeManifest/removeManifest`, `MANIFEST_NAME` | **F2** — T8 importa `MANIFEST_NAME` y solo lo reexporta; import muerto |
| T6 | T8, T9 | `upsertBlock`, `renderBlock`, `removeBlock` | **F1** — ver abajo |
| T8 | T9 | manifiestos escritos por install, leídos por status/uninstall | OK |
| T8 | T10 | `planInstall`, `install` | OK |
| T9 | T10 | `status(ctx)`, `uninstall(ctx)` | OK |
| T10 | T17 | `add.js` por importación diferida | OK — corregido en la revisión del plan |
| T11 | T12–T15 | `syncIndex`, `RULES_START/END`, `generateIndexTable` | OK |
| T11 | T17 | marcadores `RULE_NAME`/`RULE_TITLE`/`SKILL_NAME`/`SKILL_TITLE` | OK — `replaceAll` cubre las apariciones múltiples |
| T12 | T16 | test `.skip` reactivado por T16 | OK — señalado en ambos extremos |
| T12 | T13, T14, T15 | índice regenerado tras cada grupo | OK |
| T11, T16 | T12 | test de referencias `../engineering-rules/rules/X.md` | **F3** — ver abajo |

## Escaneo previo — coherencia interna de cada tarea

| Tarea | Comprobación | Resultado |
|---|---|---|
| T1 | 4 tests contra el parser especificado | OK |
| T2 | 6 tests contra la tabla; `pathsFor('codex','project') === []` coincide con §5 del spec | OK |
| T3 | Los 7 casos verificados a mano contra el algoritmo y su orden de desempate | OK — ver nota |
| T4 | `materializeSkill` hace `lstat` previo, así que el test EEXIST pasa | OK |
| T5 | JSON corrupto capturado por el `catch` que devuelve `null` | OK |
| T6 | `upsertBlock('')` produce solo el bloque; el test lo exige | OK |
| T7 | `isDir` distingue archivo de directorio; el test lo exige | OK |
| T8 | Conflictos detectados en `planInstall`, antes del `rm` de `install` | OK — el test del intruso depende de ese orden |
| T9 | `rmdir` sin `recursive` falla si queda algo ajeno; capturado | OK — es lo que hace pasar el test del intruso |
| T10 | Los 7 casos de `parseArgs` verificados contra el parser | OK |
| T11 | `syncIndex` exige marcadores; el test lo exige | OK |
| T12 | El test del prefijo `craft-` no puede pasar aún | OK — `.skip` previsto |
| T13–T15 | 6+6+5+5 = 22 rules | OK |
| T16 | 5 skills con prefijo; reactiva el `.skip` | OK |
| T17 | Regex de nombre y rechazo de sobrescritura | OK |
| T18 | `--yes` fuerza la rama no interactiva, que exige `--agents`: presente | OK |

Nota T3: verificados a mano `['claude-code','opencode']`→`.claude/skills`;
`['opencode','gemini-cli']`→`.agents/skills`; `['claude-code','opencode','gemini-cli']`→
`.claude`+`.gemini` (la neutral pierde porque duplicaría OpenCode, y `over` se compara
antes que el tamaño); `['codex','claude-code']` global → empate de tamaño resuelto a favor
de la neutral; los seis en proyecto → 4 destinos, codex sin cubrir.

## Rulings previos a la ejecución

Ruling F1: `writeAgentsMd` está DENTRO del bucle de destinos en T8, así que con dos o más
destinos `upsertBlock` sobrescribe el bloque y solo sobrevive el último. Decido sacar la
escritura fuera del bucle y que `renderBlock` acepte `string | string[]` como `relDir`,
normalizando internamente. Elijo esta forma en lugar de cambiar la firma porque el test de
T6 pasa un string y debe seguir siendo válido. — Coste si me equivoco: el bloque de
AGENTS.md listaría rutas de más o de menos; es un refuerzo, no el mecanismo principal de
descubrimiento, así que no rompe la instalación.

Ruling F2: T8 importa `MANIFEST_NAME` solo para reexportarlo, sin consumidor. Decido
eliminar el import y el reexport. — Coste si me equivoco: ninguno; si algún consumidor
futuro lo necesita, lo importa de `manifest.js`, que es su origen.

Ruling F3: la sección «Rule selection» de los craft-* skills nombra el índice pero no las
rutas de los rules, así que el test de referencias rotas de T12 no verificaría nada y el
agente tendría que inferir la ruta. Decido que T11 y T16 nombren cada rule del núcleo como
ruta relativa explícita `../engineering-rules/rules/<name>.md`. — Coste si me equivoco: los
SKILL.md quedan algo más verbosos.

## Progreso

Task 1: implementado (commit 0f94ff6, DONE_WITH_CONCERNS de facto: el implementador
cambio el script de test de `node --test test/` a `node --test test/**/*.test.js`).
Verificado por el controlador de forma independiente: `node --test test/` falla en
Node v24.19.0 en este checkout (`MODULE_NOT_FOUND`, `test at test:1:1`); con el script
del implementador pasan 4/4. Evidencia entregada al revisor sin veredicto.
Task 1: revision despachada (base 78d460c, head 0f94ff6, sonnet).

Task 1: revision -> spec ❌, 1 Important (plan-mandated), 2 Minor. Hallazgo: el
implementador cambio un valor mandado por el brief sin escalar, y su reemplazo
(`node --test test/**/*.test.js`, sin comillas) no esta verificado contra Node 20,
el suelo que declara `engines`.

Task 1: Ruling: acepto el hallazgo en ambos extremos. Medi las tres formas en Node
v24.19.0: `node --test test/` falla (resuelve `test/` como modulo, MODULE_NOT_FOUND);
el glob entrecomillado pasa; `node --test` sin argumentos pasa. El glob en argv solo se
expande desde Node 21, asi que ni la forma del brief ni la del implementador son validas
en todo el rango `>=20`. Decido `node --test` sin argumentos: usa el descubrimiento por
defecto de Node, presente en todo el rango, sin depender del shell ni del glob de argv.
Mantengo `engines >=20.0.0` para no desviarme del spec. Corolario que anado a Global
Constraints: ningun `.js` que no sea test puede vivir bajo `test/`, porque el patron por
defecto `**/test/**/*.?(c|m)js` lo ejecutaria como test — esto cierra ademas el Minor 2
del revisor. — Coste si me equivoco: si algun Node del rango no descubriera los tests por
defecto, `npm test` no correria nada y lo veriamos de inmediato como "0 tests" en la
siguiente tarea, no como un falso verde.

Task 1: Minor 1 (parser no ejercitado contra claves duplicadas, bloque sin cerrar y valor
con dos puntos) diferido: el brief mandaba exactamente 4 tests y el revisor verifico por
inspeccion que los tres casos degradan bien. Para triaje del revisor final.
Task 1: fix round 1/5 despachado al implementador original.
Task 1: correccion aplicada (db3631b package.json -> `node --test`; 9bfad0a enmienda
del plan). Re-revision acotada despachada (0f94ff6..9bfad0a, haiku).
Autorizacion del usuario: ejecutar las 18 tareas de corrido, sin pausas de checkpoint.
Task 1: fix round 1/5 (1 addressed, 0 open; commits 0f94ff6..9bfad0a)
Task 1: complete (commits 78d460c..9bfad0a, review clean, 1 minor diferido)
Task 2: implementado (commit e8020bb, DONE, 10/10 tests). Revision despachada
(base 9bfad0a, head e8020bb, sonnet). Puntos senalados al revisor sin veredicto:
codex.paths.project vacio y el solapamiento .agents/skills entre opencode y gemini-cli.
Task 2: revision -> spec OK, quality Approved, 1 Important (plan-mandated), 2 Minor.
Hallazgo verificado por el revisor ejecutando la funcion aislada: resolveDest corrompe
en silencio un `~` suelto (-> cwd/~) y toda ruta absoluta (path.join no re-enraiza, asi
que /etc/foo -> cwd/etc/foo). Latente: ninguna entrada de AGENTS es absoluta hoy.

Task 2: Ruling: endurecer resolveDest en vez de aparcarlo. No es generalidad
especulativa (no anade funcionalidad): corrige una funcion de resolucion de rutas que
corrompe en silencio, que es el peor modo de fallo, y es la unica resolucion de rutas
del paquete, llamada por T8 y T9. Guardas: `~` suelto -> home; path.isAbsolute ->
normalize. Plan enmendado para que su codigo de referencia no siga propagando el fallo.
En la misma ronda cierro el Minor 1: los tests de la tabla usaban .includes(), que
pasaria aunque a la tabla le faltara una ruta; se sustituye por deepEqual sobre las
listas completas, ya que esta tabla es la fuente de verdad de T3, T7, T8 y T9.
— Coste si me equivoco: tres guardas de una linea y tres asserts de mas.

Task 2: Minor 2 (sin test de resolveDest con ~ suelto/absoluto) queda cerrado por el
mismo ruling.
Task 2: fix round 1/5 despachado (fresh implementer; SendMessage deshabilitado).
Task 2: correccion aplicada (1cf1297; incluye .gitignore para .claude/settings.local.json
y la enmienda del plan, arrastrados del stage del controlador). 12/12 tests.
Re-revision acotada despachada (e8020bb..1cf1297, haiku).
Task 2: fix round 1/5 (3 addressed, 0 open; commits e8020bb..1cf1297)
Task 2: complete (commits 9bfad0a..1cf1297, review clean)
Task 3: dispatch (base 1cf1297, haiku) — resolvedor de cobertura exacta.
Task 3: implementado (commit bd65613, DONE, 19/19 tests). Revision despachada
(base 1cf1297, head bd65613, sonnet).
Task 3: revision -> spec OK, quality Approved, 1 Important (plan-mandated), 2 Minor.
Hallazgo excepcional: el revisor implemento AMBOS ordenes de isBetter y los probo por
fuerza bruta contra todos los subconjuntos de la tabla real en ambos ambitos. Resultado:
los 7 tests del brief dan resultados IDENTICOS con `over` primero o con `size` primero,
o sea que no pinnean la invariante que la tarea existe para proteger. El unico caso que
diverge es ['claude-code','opencode','codex','gemini-cli'] en global.

Task 3: verificado por el controlador antes de actuar: ese caso devuelve 3 destinos
(~/.claude, ~/.codex, ~/.gemini) con duplicated=[]. Con size primero devolveria 2
(~/.agents + ~/.claude) duplicando opencode.

Task 3: Ruling: anadir ese caso como test. El codigo es correcto; lo que falla es mi
suite, que no detectaria una regresion del orden. Anado tambien un assert sobre el campo
`covers`, que es superficie de spec consumida por describe() en T10 y que ningun test
tocaba. Aplazo el Minor del guardado `> 20` candidatos: es una red de seguridad contra
una tabla inyectada maliciosa, no una invariante del dominio. Plan enmendado.
— Coste si me equivoco: dos tests de mas.
Task 3: fix round 1/5 despachado.
Task 3: correccion aplicada (6ee3ce3 tests; ff7b7bc enmienda del plan). 21/21.
Comprobacion de transposicion ejecutada por el implementador: con las comparaciones
invertidas el test nuevo FALLA y devuelve 2 destinos duplicando opencode; restaurado y
verificado byte a byte con git diff. El test queda demostrado, no solo pasando.
Re-revision acotada despachada (bd65613..ff7b7bc, haiku).
Task 3: fix round 1/5 (2 addressed, 0 open; commits bd65613..ff7b7bc). Integridad de
src/resolve.js confirmada por el re-revisor con git diff acotado: sin cambios.
Task 3: complete (commits 1cf1297..ff7b7bc, review clean, 1 minor diferido: guardado >20)
Task 4: dispatch (base ff7b7bc, haiku) — materializacion por enlace con caida a copia.
Task 4: implementado (commit 12e8fc6, DONE, 25/25). Dato de entorno: en esta maquina
Windows el modo auto usa JUNCTION sin caer a copia. La estrategia de enlaces es viable.
Revision despachada (base ff7b7bc, head 12e8fc6, sonnet).
Task 4: revision -> spec OK, quality Approved, 1 Important, 3 Minor.
Important: copyDir deja el destino a medias si falla; sin rollback.

Task 4: Ruling: implementar la limpieza en materializeSkill (try/catch -> rm destDir ->
relanzar el error original). Contexto que el revisor no podia ver: el detector de
conflictos de T8 compara disco contra manifiesto, y el manifiesto se escribe AL FINAL
del bucle de skills. Una instalacion que reviente a mitad no deja manifiesto, asi que
en el reintento el directorio parcial cuenta como ajeno y install aborta exigiendo
--force. El usuario quedaria obligado a usar una bandera destructiva para recuperarse
de un fallo que no provoco. Arreglarlo en link.js da la propiedad util: o el destino
existe completo, o no existe. Es ademas el sitio correcto: quien crea el estado parcial
lo limpia. — Coste si me equivoco: cuatro lineas y un test de mas.

Task 4: el test de la limpieza se provoca con un origen inexistente, porque copyDir hace
mkdir del destino ANTES de leer el origen. Es el unico fallo portable y determinista que
encontre; la inyeccion de fallos real costaria mas que el arreglo.
Task 4: Minor 1 (los tests no limpian sus tmpdir) se cierra en la misma ronda con after().
Task 4: Minor 2 (la rama de caida a copia tras fallo de symlink no tiene cobertura) y
Minor 3 (copyDir no trata symlinks en el origen) aplazados para el revisor final.
Task 4: fix round 1/5 despachado.
Task 4: correccion aplicada (c845f51, incluye la enmienda del plan). 26/26.
Verificacion ejecutada: con el rm comentado el test nuevo FALLA (queda directorio vacio);
con el rm, pasa. El controlador vio el archivo comentado en disco a mitad de la
verificacion y NO commiteo en ese estado. Linea fs.rm confirmada viva en HEAD.
Re-revision acotada despachada (12e8fc6..c845f51, haiku).
Task 4: fix round 1/5 (2 addressed, 0 open; commits 12e8fc6..c845f51). Linea fs.rm
confirmada viva; roots.push confirmado dentro de fixture().
Task 4: complete (commits ff7b7bc..c845f51, review clean, 2 minor diferidos:
sin cobertura de la caida a copia tras fallo de symlink; copyDir no trata symlinks
en el origen)
Task 5: dispatch (base c845f51, haiku) — manifiesto de instalacion.
Task 5: implementado (commit e1cb878, DONE, 30/30). Revision despachada
(base c845f51, head e1cb878, sonnet). Riesgo senalado sin veredicto: readManifest
captura TODO error y devuelve null, asi que un EACCES se leeria como "no instalado".

Controlador: la convencion de limpieza de tmpdirs nacio del Minor 1 de la Task 4, o sea
DESPUES de escribir el plan y de pre-generar los 18 briefs. Los briefs de T7, T8, T9, T11
y T17 crean tmpdirs y no la incluyen. Fijada ahora en Global Constraints, con la
advertencia del modo de fallo silencioso (olvidar el push deja el after() iterando vacio,
en verde y sin limpiar). Se seguira reforzando en cada dispatch, porque los briefs ya
generados no se re-leen del plan.
Task 5: revision -> Needs fixes. 2 Important (ambos plan-mandated), 2 Minor.
I1: readManifest confunde "no hay manifiesto" con "no pude leerlo" (EACCES/EISDIR -> null).
I2: writeManifest no es atomico; un corte deja el manifiesto truncado.

Task 5: Ruling: implementar los dos. Lo decisivo es que SE COMPONEN: escritura
interrumpida -> manifiesto truncado -> readManifest lo ve como JSON corrupto -> null ->
uninstall concluye "aqui no hay nada" -> REPORTA EXITO dejando huerfanos todos los skills
en disco, sin error en ninguna parte. Con install el fallo al menos es ruidoso (aborta
pidiendo --force); con uninstall es silencioso, que es el modo peligroso.
I1: capturar ENOENT y SyntaxError -> null; relanzar el resto. Mantiene el test del
manifiesto corrupto que el brief exige.
I2: escritura a temporal + rename, atomico dentro del mismo directorio, con limpieza del
temporal si falla.
Coherencia: este paquete predica un rule de error-handling que dice literalmente
"distingue errores esperados de bugs" y "nunca captures sin manejar". Su propio modulo de
seguridad no puede tragarse un EACCES.
— Coste si me equivoco: ocho lineas y dos tests de mas en el modulo cuyo trabajo es
precisamente hacer seguras las operaciones destructivas.

Task 5: Minor 1 (rama mkdir recursive de writeManifest sin cubrir) y Minor 2 (el ayudante
se llama tmp() y en link.test.js fixture()) aplazados para el revisor final.
Task 5: fix round 1/5 despachado.
Task 5: correccion aplicada (0fd2514 plan; e8c9655 codigo). 32/32.
Verificacion 1: con el catch desnudo el test del manifiesto ilegible FALLA. Pinneado.
Verificacion 2 (resultado negativo, reportado honestamente): con la escritura directa
restaurada los tests SIGUEN PASANDO. El test de "no deja temporales" prueba limpieza, no
atomicidad. El arreglo 2 queda correcto por inspeccion pero SIN test que lo respalde;
probarlo exigiria matar el proceso a mitad de un write. Aceptado a conciencia.
Re-revision acotada despachada (e1cb878..e8c9655, haiku).
Task 5: fix round 1/5 (2 addressed, 0 open; commits e1cb878..e8c9655). Estado comprometido
verificado: sin restos de las reversiones. instanceof SyntaxError correcto (JSON.parse no
lleva .code). Temporal confirmado en el mismo directorio que el destino (rename entre
sistemas de ficheros no seria atomico).
Task 5: complete (commits c845f51..e8c9655, review clean, 2 minor diferidos + la brecha
de cobertura aceptada del arreglo 2)
Task 6: dispatch (base e8c9655, haiku) — bloque gestionado de AGENTS.md.
Task 6: implementado (commit 93617db, DONE, 39/39). Revision despachada
(base e8c9655, head 93617db, sonnet). Riesgo senalado sin veredicto: el replace
/\n{3,}/g de removeBlock actua sobre TODO el archivo, no solo alrededor del bloque
borrado, asi que reformatearia contenido del usuario lejos del bloque.
Task 6: revision -> Needs fixes. 3 Important (todos plan-mandated), 2 Minor.
El revisor EJECUTO las funciones y trajo las cadenas exactas. Tres escenarios de borrado
silencioso de documentacion del usuario: (a) la prosa del usuario menciona el marcador ->
indexOf lo empareja con el END real y upsertBlock borra el parrafo intermedio;
(b) START huerfano + bloque real posterior -> el segundo upsert borra todo lo de en medio;
(c) END antes que START -> corrupcion por duplicacion de segmentos.
Ademas confirmo el replace /\n{3,}/g sobre TODO el archivo: colapsa lineas en blanco que
el usuario puso a proposito lejos del bloque.

Task 6: Ruling: causa raiz unica -- localizar el bloque con indexOf sin validar que el
par este emparejado. Introduzco findBlock() que usa lastIndexOf(END) y luego
lastIndexOf(START, end): el par mas cercano y valido. Ante un archivo malformado devuelve
null, y entonces upsert ANADE un bloque nuevo en vez de cortar por donde no es. Prefiero
duplicar un bloque inerte antes que borrar prosa del usuario: lo primero se ve y se
arregla a mano, lo segundo es perdida silenciosa.
La normalizacion de saltos pasa a aplicarse solo a la juntura (before/after), no al
archivo entero. Verificado a mano que la ida y vuelta queda byte a byte exacta.
Anado tres tests que cubren precisamente los tres escenarios; los siete existentes pasan
igual con la version ingenua, que es por que el defecto llego hasta aqui.
— Coste si me equivoco: una funcion auxiliar de seis lineas y tres tests.

Task 6: Minor 1 (renderBlock no deduplica relDir) y Minor 2 (la autorrevision del
implementador sobrevaloraba su cobertura de casos limite) aplazados.
Task 6: fix round 1/5 despachado.

INCIDENTE (Task 6): el subagente de la ronda 1 restauro el arbol durante su verificacion
y se llevo por delante mis enmiendas SIN COMMITEAR al plan. El codigo y los tests SI
tienen el arreglo (e1351cb), pero el plan volvio a documentar la version rota con
indexOf. Re-aplicadas. Leccion operativa: commitear mis enmiendas al plan ANTES de
despachar la ronda que pide reversiones temporales, no despues.

Task 6: fix round 1/5 (3 addressed, 0 open; commit e1351cb). Contraste bajo el codigo
viejo reportado por el implementador: fallaron 2 de 3 tests nuevos, PASO el de la mencion
del marcador.
Task 6: Ruling: ese test mio no probaba nada. Mi fixture tenia la mencion en prosa pero
NINGUN bloque real, asi que no habia END; la version ingenua comprobaba
`s !== -1 && e !== -1`, no encontraba END y caia por la rama de anadir, preservando el
contenido por accidente. El escenario que el revisor demostro necesita mencion EN PROSA
mas bloque REAL instalado. Refuerzo el fixture y anado asserts de que el bloque viejo se
sustituye. Ronda 2. — Coste si me equivoco: un test mas estricto de lo necesario.
Task 6: fix round 2/5 despachado.
Task 6: fix round 2/5 (commit 4fa2a1d). Contraste bajo el codigo viejo: FALLAN los 3
tests nuevos; PASAN los 5 originales que ejercitan la logica del bloque (los 2 de
renderBlock no la tocan). El fixture reforzado ya tiene dientes. 42/42.
Re-revision acotada despachada (93617db..4fa2a1d, haiku).
Task 6: fix round 2/5 (3 addressed, 0 open; commits 93617db..4fa2a1d). lastIndexOf(START,
end) confirmado con su fromIndex. Estado comprometido sin restos de la reversion.
Task 6: complete (commits e8c9655..4fa2a1d, review clean, 2 minor diferidos)
Task 7: dispatch (base 4fa2a1d, haiku) — deteccion de agentes instalados.
Task 7: implementado (commit 321f054, DONE, 45/45, convencion de tmpdirs aplicada).
Revision despachada (base 4fa2a1d, head 321f054, sonnet).
Task 7: complete (commits 4fa2a1d..321f054, review clean, SIN hallazgos Important —
la primera. 2 minor diferidos: evidencia RED redactada en vez de capturada; escaneo
secuencial por agente, inmaterial con 6).
Task 8: dispatch (base 321f054, sonnet — la tarea mas densa, integra 5 modulos).
Task 8: implementado (commit a915238, DONE, 51/51, convencion de tmpdirs aplicada).
Revision despachada (base 321f054, head a915238, sonnet). Es la tarea que escribe en el
disco del usuario; revision reforzada sobre orden destructivo y rutas de fallo parcial.
Task 8: revision -> Approved. 2 Important (plan-mandated), 2 Minor. Las 4 propiedades
estructurales verificadas por TRAZA del flujo, no por el reporte: ningun fs.rm corre
antes de terminar la deteccion de conflictos; AGENTS.md una sola vez tras el bucle;
idempotencia derivada del manifiesto y no del disco; codex en uncovered. --force
confirmado: solo salta la comprobacion, NO ensancha el borrado.

Task 8: Ruling I1: fallo parcial en el bucle de skills deja huerfanos sin manifiesto y
obliga a --force en el reintento. Es el MISMO anti-patron que corregi dentro de
materializeSkill en la Task 4; no lo extendi un nivel arriba. Escribo el manifiesto en
finally con las entradas que si se materializaron. Criterio ya establecido en T4, aplicado
con coherencia. — Coste si me equivoco: un manifiesto que refleja una instalacion parcial,
que es exactamente lo que ocurrio.
Task 8: Ruling I2: AGENTS.md pasa tambien a finally, con los destinos que llegaron a tener
manifiesto. Gratis dentro del mismo try/finally y deja el archivo coherente con el disco.
Task 8: Ruling Minor 2 (real, del flujo --global): path.relative(cwd, ~/.claude/skills)
produce ../.. sin sentido en un AGENTS.md que vive en cwd. Si el token empieza por ~/, se
conserva tal cual. Lo arreglo pese a ser Minor porque --global es un flujo de primera clase
y ningun test lo cubre end-to-end.
Task 8: Minor 1 (applied colapsa los modos por destino) APARCADO: nada consume `applied`
hoy; cambiar su forma sin consumidor es churn. Para el revisor final.
Task 8: fix round 1/5 despachado.
Task 8: correccion aplicada (bb3a725 plan; a45c44f codigo). 53/53.
Verificacion: sacando writeManifest del finally, el test de fallo parcial FALLA con
readManifest devolviendo null (no se escribia manifiesto). Los otros 7 pasan. Pinneado.
ERROR DEL CONTROLADOR: omiti el paso de anexar reporte de correccion en el prompt de esta
ronda, asi que no existe fix report para T8. La evidencia va directa en el prompt del
re-revisor. Reincorporar ese paso en las rondas siguientes.
Re-revision acotada despachada (a915238..a45c44f, haiku).
Task 8: fix round 1/5 (3 addressed, 0 open; commits a915238..a45c44f). Las 5
comprobaciones de try/finally PASS: puerta de conflictos fuera del try; sin return/throw
en ningun finally; writeManifest guardado por entries.length>0; materialized solo recibe
destinos con manifiesto; rama ~/ conserva el token.
Task 8: complete (commits 321f054..a45c44f, review clean, 1 minor aparcado: applied
colapsa los modos por destino)
Task 9: dispatch (base a45c44f, haiku) — status y uninstall.
Task 9: implementado (commit dfbd151, DONE, 57/57, convencion de tmpdirs aplicada).
Concern reportado: readManifest ahora relanza EACCES/EISDIR, asi que status/uninstall
propagan en vez de saltarse el directorio. Consecuencia del endurecimiento de la Task 5.
Revision despachada (base a45c44f, head dfbd151, sonnet).
Task 9: revision -> Approved. SIN Critical ni Important. 2 Minor + 1 ⚠️ para el controlador.
Las 3 salvaguardas destructivas verificadas intactas. El revisor confirmo que el test del
archivo ajeno SI distingue: fallaria con rm recursivo. El rethrow de readManifest lo juzgo
aceptable y correcto para un comando destructivo (fallar ruidoso es mejor que saltarse en
silencio una instalacion real), con la salvedad del radio de impacto.

Task 9: Ruling ⚠️ (defecto de plan, consecuencia en T10): el plan dice que `update` es
uninstall + install "con los mismos agentes leidos del manifiesto", y el manifiesto NO
guarda los agentes. Deducirlos de la ruta es ambiguo: .claude/skills sirve a la vez a
claude-code y a opencode. Anado `agents: string[]` al manifiesto (T5), lo escribe install
(T8), lo expone status (T9) y lo consume update (T10). Elegido frente a exigir --agents en
update porque el spec dice que update "re-aplica la version actual", o sea la misma
seleccion. Un flag explicito mantiene prioridad para poder cambiarla.
Corregido tambien un TDZ que introduje al enmendar: el bloque de update asignaba agents y
scope antes de su declaracion. La declaracion pasa arriba.
Se pliega en el dispatch de la T10 en vez de abrir rondas sobre T5/T8/T9 ya cerradas: es
donde vive el requisito y evita churn en tareas cerradas.
— Coste si me equivoco: un campo mas en el manifiesto y tres lineas.

Task 9: Minor 1 (la rama que borra AGENTS.md entero se ejecuta pero no se asserta) y
Minor 2 (sin cobertura de ambito global end-to-end) aplazados para el revisor final.
Task 9: complete (commits a45c44f..dfbd151, review clean)
Task 10: brief REGENERADO desde el plan enmendado (el pre-generado no traia agents en el
manifiesto ni el bloque de update). Dispatch (base b94fc43, sonnet).
Task 10: revision -> Approved. SIN Critical ni Important. 3 Minor.
Task 10: Ruling Minor 2 (lo arreglo pese a ser Minor): `--agents` sin valor daba [] en
silencio; un array vacio es truthy, la guarda no saltaba, el resolvedor daba cero destinos
y el comando reportaba exito sin instalar nada. Es el mismo modo de fallo silencioso que
persigo desde la Task 1, ahora en el parser. requireValue() lanza.
Task 10: Ruling Minor 3: el mensaje "Sin TTY" miente cuando se llega con --yes en una
terminal real. Pasa a "Modo no interactivo".
Task 10: Minor 1 (describe() sin cobertura, ademas no exportada) APARCADO: exportar una
funcion solo para testear su formato es peor negocio que el riesgo que cubre.
Task 10: ENOENT de skills/ juzgado por el revisor como no-defecto de esta tarea; se
revisara cuando skills/ exista y la ruta sea alcanzable de verdad. Aparcado.
Task 10: fix round 1/5 despachado.
Task 10: correccion aplicada (32b4b7d plan; 4bc556a codigo). 65/65.
Verificacion: revirtiendo Edit 2 el test nuevo FALLA con "Missing expected exception".
CLI real: `install --agents` -> "--agents necesita un valor."; `install --yes` ->
"Modo no interactivo: --agents es obligatorio."
Re-revision acotada despachada (3159920..4bc556a, haiku).
Task 10: fix round 1/5 (2 addressed, 0 open; commits 3159920..4bc556a). Regresiones
verificadas: --skills sigue opcional (omitirlo deja undefined y no entra en la rama);
indice de argumentos correcto; TDZ y los dos await import() dinamicos intactos.
Task 10: complete (commits b94fc43..4bc556a, review clean, 2 minor aparcados: describe()
sin cobertura y no exportada; ENOENT crudo de skills/)
=== BLOQUE DE CODIGO COMPLETO: 10/10 tareas, 65 tests ===
Task 11: dispatch (base 4bc556a, haiku) — plantillas y generador del indice de rules.
Task 11: revision -> Needs fixes. 2 Important, 2 Minor.
I1: templates/skill.md usa RULE_NAME donde el plan dice <name>. El revisor lo argumento
mejor que yo: en ambas plantillas los <corchetes> significan "rellena a mano" y las
MAYUSCULAS significan "una herramienta sustituye". RULE_NAME en un hueco que addSkill
nunca toca rompe esa convencion y colisiona con el token que addRule SI sustituye; si
alguien unifica la sustitucion, se reemplazaria donde no debe. Desviacion del
implementador: el plan ya decia <name>.
I2: generateIndexTable no escapa la barra vertical. Un applies-when con | produce tabla
markdown malformada SIN error, en el modulo cuyo trabajo es que el indice sea confiable.
Ese si es defecto de mi plan.

Task 11: Ruling: arreglo los dos. Escape de | por \| en la generacion de filas, y la
plantilla vuelve a <name>. Pliego el Minor 1 (la rama de mismatch de nombre no tenia test
pese a ser load-bearing) porque es una validacion de la que depende la confianza en el
indice. Aplazo el Minor 2 (mensaje con "undefined" si falta name): cosmetico.
— Coste si me equivoco: un replaceAll y dos tests.
Task 11: fix round 1/5 despachado.
Task 11: fix round 1 -> BLOCKED por el implementador, y TENIA RAZON. Mi asercion
`row.split('|').length === 4` medía mal: un `\|` escapado sigue siendo un pipe para
String.split(), la barra invertida solo significa algo al RENDERIZAR markdown. La fila
escapada da 5 cortes ingenuos. La implementacion estaba bien; el test estaba mal.
Verificado por el controlador contra el codigo real: fila = "| `pipes` | A \| B |",
split ingenuo 5, split por pipes no escapados 4.
Task 11: Ruling: corregir MI test, no la implementacion. Asercion doble: que la fila
contenga el escape, y que al separar por pipes NO escapados haya 4 segmentos.
INCIDENTE DEL CONTROLADOR: mis ediciones al plan por heredoc corrompieron backslashes en
TRES sitios, incluido replaceAll('|','\|') -- que en JS es un no-op, o sea que el plan
documentaba un escapado que no escapa. Corregido con la herramienta de edicion.
Leccion: no editar codigo con backslashes via heredoc de shell.
Task 11: fix round 2/5 despachado.
Task 11: fix round 2/5 (3 addressed, 0 open; commits ab7dda8..1b94378). Escape verificado
como '\|' (no el no-op '\|'). Las dos aserciones confirmadas complementarias.
Task 11: complete (commits 4bc556a..1b94378, review clean, 1 minor aplazado: mensaje con
"undefined" si falta name en el frontmatter)
Task 12: dispatch (base 1b94378, SONNET — es autoria de contenido en ingles, no
transcripcion). Indice de rules + linter de contenido + 6 rules del grupo Codigo.
Task 12: revision -> Approved. SIN Critical ni Important. 2 Minor.
Verificado: cero deriva de redaccion (applies-when y checklists coinciden caracter a
caracter con el brief en los 6 rules). El test saltado verificado independientemente como
honesto. Indice byte a byte igual a lo que genera generateIndexTable.
Task 12: Ruling Minor: varios items de simplicity-and-yagni y refactoring son guia de
proceso, no tests mecanicos. APARCADO a conciencia: forzar precision falsa ahi seria peor.
Son los items donde hace falta juicio, no una comprobacion. Un catalogo 100% mecanico
seria un linter, no un criterio de ingenieria. Para triaje del revisor final.
Task 12: complete (commits 1b94378..7a9eec4, review clean, 2 minor aparcados)
Task 13: dispatch (base 7a9eec4, sonnet) — 6 rules del grupo Diseno.
Task 13: revision -> Approved. SIN Critical ni Important. 4 Minor cosmeticos.
Cero deriva en 6 archivos y 40 items. Las tres reglas de fronteras NO colapsan: se
estratifican por la pregunta que responden (partir el sistema / proteger reglas de
frameworks / testear sin infraestructura). La carga selectiva funciona como se diseno.
Task 13: Ruling: el Minor del formato de architecture.md (dos fences en vez de uno) se
PLIEGA en el dispatch de la Task 14, no merece ronda propia. Los otros tres Minor
(identificadores sin definir en el ejemplo; smells no observables desde el codigo a esa
altitud) se aplazan para el revisor final.
Task 13: complete (commits 7a9eec4..281e4ab, review clean)
Task 14: dispatch (base 281e4ab, sonnet) — 5 rules del grupo Robustez + normalizar el
fence de architecture.md.
Task 14: PRIMER INTENTO ABORTADO por limite de sesion de la API (rate_limit 429), no por
un fallo del trabajo. Estado al morir: error-handling.md escrito y COMPLETO (59 lineas,
5 secciones, frontmatter correcto); los otros 4 rules sin empezar; indice sin regenerar.
El content-lint detecta correctamente la desincronizacion del indice: prueba de que el
diseno de regeneracion funciona.
Task 14: re-dispatch con los 4 rules restantes (concurrency, security, observability,
performance) + normalizacion del fence de architecture.md + regeneracion del indice.
error-handling.md se conserva tal cual.
Task 14: revision -> Approved. SIN Critical ni Important. 2 Minor.
Cero deriva en 5 archivos y 39 items. El When to ignore de security verificado como
honesto y acotado dos veces (solo local sin red, y solo validacion de entrada): no
concede permiso para saltarse consultas parametrizadas, authz, secretos ni hashing.
concurrency y performance aterrizaron mayormente en lo concreto.
Task 14: Ruling sobre el ⚠️: la afirmacion "error-handling.md intacto" no es verificable
desde el diff porque ambos intentos cayeron en un commit sin estado intermedio. RESUELTO,
no pendiente: el revisor SI verifico lo que importa, que el contenido coincide verbatim
con el brief y es coherente. Quien de los dos subagentes lo escribio es irrelevante.
Task 14: 2 Minor aplazados (items de proceso en performance; "prefer" en concurrency).
Task 14: complete (commits 281e4ab..93a8f50, review clean)
Task 15: dispatch (base 93a8f50, sonnet) — los 5 rules de Proceso, cierra 22/22.
Task 15: revision -> Needs fixes. 1 Important, 2 Minor. CATALOGO COMPLETO 22/22.
Cero deriva en 5 archivos y 40 items, verificada linea a linea contra el brief.
I1: el Do/Don't de quality-gates lleva fence ```ts con un fragmento suelto de
package.json que NO parsea. Unico de los 22. ERROR DEL CONTROLADOR: lo autorice
explicitamente en el dispatch ("un fragmento de scripts en un fence ts es aceptable").
El revisor tiene razon: la restriccion dice ejemplos en TypeScript, y un fragmento que no
compila invita a reutilizarlo tal cual. Se arregla con const scripts = {...}.

Task 15: Ruling sobre la discriminacion del catalogo: el revisor observa que testing
("cualquier cambio de comportamiento"), quality-gates ("decidir si algo esta hecho") y
engineering-workflow rozan el territorio siempre-activo de clean-code, con lo que 3-4 de
las 8 ranuras quedan pre-ocupadas. NO las estrecho. Esas condiciones son HONESTAS: esos
rules SI aplican con esa frecuencia, y redactarlas mas estrechas haria que el catalogo
mienta sobre cuando aplican para preservar un presupuesto de ranuras. La mitigacion real
es otra y ya esta en el diseno: los craft-* skills de la Task 16 declaran conjuntos NUCLEO
explicitos por flujo, asi que la seleccion no depende de escanear el indice. El indice es
para ajustar, no para elegir desde cero. Anotado para el revisor final.
Task 15: Minor 2 (testing.md usa globals de Jest en un repo que corre node:test) se
pliega en la ronda de correccion: es barato y el catalogo no deberia atarse a un framework.
Task 15: fix round 1/5 despachado.
Task 15: fix round 1 (f29bf52) arreglo el fence pero MI texto dictado introdujo una
redeclaracion: const scripts dos veces en el mismo bloque. Segunda vez en dos tareas que
mi correccion dictada tiene un defecto de mecanica (T11: asercion que medía mal).
Task 15: fix round 2 (9f66aa3). Identificadores verificados sin duplicados:
quality-gates {swallowed, enforced}; testing {calls, audit, err}. 75 pass / 1 skip.
Re-revision acotada despachada (3f0726a..9f66aa3, haiku).
Task 15: fix round 2/5 (2 addressed, 0 open; commits 3f0726a..9f66aa3). Identificadores
auditados de forma independiente por el re-revisor. Contraste de testing.md verificado:
el Don't pasa con comportamiento incorrecto, el Do falla.
Task 15: complete (commits 93a8f50..9f66aa3, review clean) — CATALOGO 22/22 RULES.
Task 16: dispatch (base 9f66aa3, sonnet) — los 5 skills craft-* + reactivar el test
saltado desde la Task 12.
Task 16: implementado (commit 6ae337d, DONE_WITH_CONCERNS, 76 pass / 0 skip). El test
saltado desde la Task 12 REACTIVADO: la unica dependencia hacia atras del plan, cerrada.
34 referencias a rules verificadas; tabla de enrutado byte-identica en los cinco (md5).
CONCERN REAL Y ES MIO: craft-architect tiene nucleo 6 + condicionales 4 = 10, por encima
del tope de ocho que el propio skill declara. En el escaneo previo verifique que ningun
nucleo pasara de 6, pero NO que nucleo+condicionales cupiera en 8. Recuento de los cinco:
architect 10, code-review 8, feature-implementation 8, quick-implementation 6,
spec-driven-development 6. Solo architect se pasa.
Task 16: Ruling: no recorto el conjunto. Anado al texto compartido de Rule selection una
instruccion accionable: si nucleo + condicionales disparados pasaria de ocho, la tarea
abarca mas de una pasada de diseno; hay que acotarla a un componente y repetir el skill.
Es coherente con la filosofia del trinquete y convierte una violacion de presupuesto en
una senal de triaje, que es lo que el tope significa desde el principio. Va tambien en
templates/skill.md para que lo hereden los skills creados con add-skill.
— Coste si me equivoco: una frase de mas en cinco archivos y una plantilla.
Task 16: fix round 1/5 despachado.
Task 16: fix round 1/5 (1 addressed, 0 open; commits 9f66aa3..6bb61a0). Frase en los 6
archivos incluido templates/skill.md; conjuntos de rules intactos (nadie recorto los
condicionales de architect para cuadrar); 0 skips confirmados.
Task 16: complete (commits 9f66aa3..6bb61a0, review clean) — 5 SKILLS, 76 TESTS, 0 SKIPS.
Task 17: dispatch (base 6bb61a0, haiku) — comandos add-rule y add-skill.
Task 17: implementado (commit 95b61cd, DONE, 80 pass / 0 skip, convencion de tmpdirs).
VERIFICACION E2E DEL CONTROLADOR con el CLI real: `add-rule caching` creo el archivo desde
la plantilla, sustituyo RULE_NAME/RULE_TITLE, y REGENERO el indice solo. Nombre invalido ->
"invalid name: Mi Regla". Segundo intento -> "already exists: ...". Limpiado, indice
regenerado, arbol limpio, 22 rules. La promesa de extensibilidad funciona de verdad.
Revision despachada (base 6bb61a0, head 95b61cd, sonnet).
Task 17: revision -> Approved. SIN Critical ni Important. 2 Minor.
Las 5 propiedades verificadas, incluida la que ningun test atrapa (nombres exportados vs.
el await import() dinamico de la T10), corroborada por la ejecucion real del CLI.
title() verificado seguro para todo nombre que la validacion admite.
Task 17: Ruling Minor 2: no hay test de que addSkill se niegue a sobrescribir.
refuseIfExists esta cubierta via addRule, pero que addSkill LA LLAME no lo esta: un
refactor podria quitarsela y la suite seguiria verde. Es el patron que llevo toda la
sesion corrigiendo. Se PLIEGA en la Task 18 en vez de abrir ronda propia.
Task 17: Minor 1 (sin rollback si syncIndex falla tras escribir el rule) aplazado con la
razon del revisor: reproduce el brief, la precondicion es estado corrupto previo, y
fallar ruidoso es defendible. Se anade un comentario explicando el tradeoff.
Task 17: complete (commits 6bb61a0..95b61cd, review clean)
Task 18: dispatch (base 95b61cd, sonnet) — docs, AGENTS.md del repo, CI, y los 2 minors
plegados de la T17.
Task 18: revision -> Approved. SIN Critical ni Important. 1 Minor.
README verificado comando por comando y bandera por bandera contra el codigo real: 6
comandos, 8 banderas, tabla de agentes verbatim con targets.js. Caveat de Codex prominente
y honesto. CI pasaria; el cambio npm ci -> npm install bien razonado y comentado inline.
AGENTS.md sin marcadores funcionales de craftkit.
Task 18: minor (deferred): el README afirma que el indice "no puede desincronizarse",
y AGENTS.md advierte que si puede con ediciones manuales fuera de add-rule. Para el
publico del README se sostiene, pero el absoluto no es literalmente cierto. Al triaje
del revisor final.
Task 18: complete (commits 95b61cd..1c51c43, review clean)
=== LAS 18 TAREAS COMPLETAS: 81 tests, 0 skips, 22 rules, 5 skills ===

=== REVISION FINAL DE RAMA (opus, c1d5515..1c51c43, 45 commits) ===
Veredicto: Ready with fixes. 1 Critical, 5 Important, 7 Minor.
CRITICAL: cli.js:131 la guarda de modulo principal es falsa bajo bin enlazado en POSIX,
asi que `npx craftkit install` no hace NADA y sale 0 en macOS/Linux. Sobrevivio 18
revisiones porque TODAS mis verificaciones manuales corrieron en Windows, donde el shim
.cmd de npm hace verdadera la segunda rama por accidente. Ningun test ejecuta el bin.
IMPORTANT: (1) update con agents vacio desinstala y reinstala nada -- mismo defecto que
requireValue arreglo en la rama de flags, en el otro extremo del tubo; (2) update con
instalacion global Y de proyecto pierde una; (3) uninstall usa skill.name del manifiesto
como segmento de ruta sin validar: "" o "." borra el directorio entero, ".." se escapa;
(4) el aviso de agente sin cubrir miente en ambito global (cursor/windsurf); (5) add-rule
bajo npx escribe en un directorio transitorio.
Triaje de los 13 minors aplazados: 11 ACCEPT, 1 FIX (describe(), como consecuencia del
Critical), 1 ACCEPT-con-matiz (README).
EL RULING DEL CATALOGO CONFIRMADO: el revisor final, viendo ambas mitades, da la razon al
controlador -- el indice no es el mecanismo de seleccion; cada craft-* entrega una lista
explicita de rutas. Estrechar las condiciones haria mentir al catalogo para proteger una
ficcion contable.
Fix wave unica despachada (Critical + 5 Important + 5 minors baratos).
Fix wave: re-revision acotada -> All findings addressed. Merge readiness: READY.
El re-revisor verifico el arreglo critico creando un symlink real y ejecutando a traves
de el: el escenario exacto que estaba roto. Guarda confirmada sin poder lanzar al cargar.
uninstall salta entradas invalidas (continue, no throw). update valida ANTES de destruir.
El test de humo lanza un proceso real via execFileSync.
=== PROYECTO COMPLETO: 46 commits, 86 tests, 0 skips, 22 rules, 5 skills ===
