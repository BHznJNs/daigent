import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { dirname } from 'node:path';

const ext = process.platform === 'win32' ? '.exe' : '';

let targetTriple;
const targetIndex = process.argv.indexOf('--target');
if (targetIndex !== -1 && process.argv[targetIndex + 1]) {
  // prefer to use the target triple passed in
  targetTriple = process.argv[targetIndex + 1];
} else {
  const rustInfo = execSync('rustc -vV');
  targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
  if (!targetTriple) {
    console.error('Failed to determine platform target triple');
  }
}

const dest = `src-tauri/bin/node_runtime-${targetTriple}${ext}`;
fs.mkdirSync(dirname(dest), { recursive: true });
fs.renameSync(`node-bin/node${ext}`, dest);
