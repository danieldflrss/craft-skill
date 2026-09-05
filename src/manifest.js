import fs from 'node:fs/promises';
import path from 'node:path';

export const MANIFEST_NAME = '.craftkit-manifest.json';

export async function readManifest(destRoot) {
  try {
    return JSON.parse(await fs.readFile(path.join(destRoot, MANIFEST_NAME), 'utf8'));
  } catch (err) {
    // "Aqui no hay manifiesto" es el caso normal en casi todos los directorios que el
    // instalador inspecciona, y un JSON corrupto no debe tumbar la instalacion: ambos
    // devuelven null. Pero un EACCES o un EISDIR significan "no pude averiguarlo", que
    // es otra cosa; devolver null ahi haria que uninstall saltase EN SILENCIO una
    // instalacion real y dejase sus archivos huerfanos.
    if (err.code === 'ENOENT' || err instanceof SyntaxError) return null;
    throw err;
  }
}

export async function writeManifest(destRoot, manifest) {
  await fs.mkdir(destRoot, { recursive: true });
  const target = path.join(destRoot, MANIFEST_NAME);
  const temp = `${target}.tmp-${process.pid}`;
  // Escritura atomica: rename dentro del mismo directorio es atomico, asi que un corte
  // a mitad (disco lleno, kill, corte de luz) deja intacto el manifiesto anterior en vez
  // de uno truncado. Un truncado se leeria como JSON corrupto -> null -> "no instalado",
  // perdiendo el registro de todo lo que craftkit habia escrito ahi.
  try {
    await fs.writeFile(temp, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    await fs.rename(temp, target);
  } catch (err) {
    await fs.rm(temp, { force: true }).catch(() => {});
    throw err;
  }
}

export async function removeManifest(destRoot) {
  await fs.rm(path.join(destRoot, MANIFEST_NAME), { force: true });
}
