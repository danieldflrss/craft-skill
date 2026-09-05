import fs from 'node:fs/promises';
import path from 'node:path';
import { removeManifest } from '../manifest.js';
import { removeBlock } from '../agentsmd.js';
import { status } from './status.js';

// Misma forma de nombre que el resto del paquete (ver src/commands/add.js). skill.name
// viene de un manifiesto JSON en disco, no de una fuente que controlemos: una entrada
// "" o "." resuelve con path.join al propio directorio destino, y "../.." se escapa de
// el, asi que un manifiesto corrupto o editado a mano podia borrar recursivamente todo
// el directorio de skills -- incluidos los que el usuario escribio a mano -- o cosas
// fuera de el. Se descarta la entrada en vez de lanzar para que una fila mala no bloquee
// la limpieza de las demas.
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function uninstall(ctx, { scope } = {}) {
  const removed = [];
  const rows = await status(ctx);
  for (const row of rows) {
    if (scope && row.scope !== scope) continue;
    for (const skill of row.skills) {
      if (!NAME.test(skill.name)) continue;
      const target = path.join(row.path, skill.name);
      await fs.rm(target, { recursive: true, force: true });
      removed.push(target);
    }
    await removeManifest(row.path);
    await fs.rmdir(row.path).catch(() => {});
  }
  const file = path.join(ctx.cwd, 'AGENTS.md');
  const current = await fs.readFile(file, 'utf8').catch(() => null);
  if (current !== null) {
    const next = removeBlock(current);
    if (next === '') await fs.rm(file, { force: true });
    else await fs.writeFile(file, next, 'utf8');
  }
  return { removed };
}
