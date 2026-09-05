import fs from 'node:fs/promises';
import path from 'node:path';

export async function copyDir(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const written = [];
  for (const entry of await fs.readdir(srcDir, { withFileTypes: true })) {
    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      for (const nested of await copyDir(from, to)) written.push(path.join(entry.name, nested));
    } else {
      await fs.copyFile(from, to);
      written.push(entry.name);
    }
  }
  return written;
}

export async function materializeSkill(srcDir, destDir, { mode = 'auto' } = {}) {
  const existing = await fs.lstat(destDir).catch(() => null);
  if (existing) {
    const err = new Error(`EEXIST: destination already exists: ${destDir}`);
    err.code = 'EEXIST';
    throw err;
  }
  await fs.mkdir(path.dirname(destDir), { recursive: true });

  if (mode === 'auto') {
    const type = process.platform === 'win32' ? 'junction' : 'dir';
    try {
      await fs.symlink(path.resolve(srcDir), destDir, type);
      return { mode: type === 'junction' ? 'junction' : 'symlink', files: [] };
    } catch (err) {
      if (err.code === 'EEXIST') throw err;
    }
  }
  return { mode: 'copy', files: await copyDir(srcDir, destDir) };
}
