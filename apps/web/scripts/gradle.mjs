/** Runs the Android Gradle wrapper on Windows, macOS and Linux:  node scripts/gradle.mjs assembleDebug */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../android');
const win = process.platform === 'win32';
// Windows runs .bat files through cmd; quote the path (the project folder has spaces)
const cmd = win ? `"${path.join(dir, 'gradlew.bat')}"` : './gradlew';
const r = spawnSync(cmd, process.argv.slice(2), { cwd: dir, stdio: 'inherit', shell: win });
process.exit(r.status ?? 1);
