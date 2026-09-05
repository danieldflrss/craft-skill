import fs from 'node:fs/promises';
import path from 'node:path';

export const MANIFEST_NAME = '.craftkit-manifest.json';

export async function readManifest(destRoot) {
  try {
    return JSON.parse(await fs.readFile(path.join(destRoot, MANIFEST_NAME), 'utf8'));
  } catch {
    return null;
  }
}

export async function writeManifest(destRoot, manifest) {
  await fs.mkdir(destRoot, { recursive: true });
  await fs.writeFile(
    path.join(destRoot, MANIFEST_NAME),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );
}

export async function removeManifest(destRoot) {
  await fs.rm(path.join(destRoot, MANIFEST_NAME), { force: true });
}
