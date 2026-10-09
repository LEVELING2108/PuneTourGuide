// Starts the FastAPI safety service from its local virtualenv (services/safety/.venv).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'services', 'safety');
const python = process.platform === 'win32'
  ? join(dir, '.venv', 'Scripts', 'python.exe')
  : join(dir, '.venv', 'bin', 'python');

if (!existsSync(python)) {
  console.error('[safety] No virtualenv found. Run: cd services/safety && python -m venv .venv && .venv/Scripts/pip install -r requirements.txt');
  process.exit(1);
}

const port = process.env.SAFETY_PORT || '8000';
const child = spawn(python, ['-m', 'uvicorn', 'main:app', '--reload', '--port', port], { cwd: dir, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
