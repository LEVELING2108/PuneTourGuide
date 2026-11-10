#!/usr/bin/env node
/**
 * One-time local setup (safe to re-run):  npm run setup
 *
 *   1. checks Node, Python and Docker
 *   2. creates the .env files from the examples (with fresh random dev secrets)
 *   3. starts this project's own PostgreSQL + PostGIS (port 5440) and Redis (port 6390) in Docker
 *   4. installs packages, applies database migrations, loads the curated places
 *   5. creates the safety service's Python environment
 *   6. imports real hospitals / police / fire stations from OpenStreetMap
 *
 * Options:
 *   --skip-help   skip step 6 (needs internet, takes a few minutes; run `npm run refresh:help` later)
 *   --no-docker   use the DATABASE_URL / REDIS_URL already in services/tour-api/.env instead of Docker
 *
 * Then start everything with:  npm run dev   →  http://localhost:5050
 */
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const args = new Set(process.argv.slice(2));
const useDocker = !args.has('--no-docker');
const win = process.platform === 'win32';

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
let stepNo = 0;
const step = (title) => console.log(`\n${bold(`[${++stepNo}] ${title}`)}`);
const ok = (msg) => console.log(`    ${green('✓')} ${msg}`);
const warn = (msg) => console.log(`    ${yellow('!')} ${msg}`);
const fail = (msg, hint) => {
  console.error(`\n${red('✗ ' + msg)}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
};

/** Runs a command, streaming its output. Commands go through the shell so npm/npx/docker resolve on Windows. */
function run(cmd, { cwd = root, quiet = false, allowFail = false } = {}) {
  const r = spawnSync(cmd, { cwd, shell: true, stdio: quiet ? 'pipe' : 'inherit', encoding: 'utf8' });
  if (r.status !== 0 && !allowFail) fail(`Command failed: ${cmd}`, quiet ? (r.stderr || r.stdout || '').trim().slice(-800) : undefined);
  return r;
}
const output = (cmd) => {
  const r = spawnSync(cmd, { cwd: root, shell: true, encoding: 'utf8' });
  return r.status === 0 ? (r.stdout || r.stderr).trim() : null;
};
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// ── 1. Tools ───────────────────────────────────────────────────────
step('Checking tools');
const [major] = process.versions.node.split('.').map(Number);
if (major < 20) fail(`Node.js 20 or newer is needed (you have ${process.versions.node}).`, 'Install it from https://nodejs.org');
ok(`Node.js ${process.versions.node}`);

const pythonCandidates = win ? ['py -3.12', 'py -3', 'python', 'python3'] : ['python3.12', 'python3', 'python'];
let python = null;
for (const c of pythonCandidates) {
  const v = output(`${c} --version`);
  const m = v?.match(/Python (\d+)\.(\d+)/);
  if (m && (Number(m[1]) > 3 || (Number(m[1]) === 3 && Number(m[2]) >= 12))) {
    python = c;
    ok(`${v} (${c})`);
    break;
  }
}
if (!python) fail('Python 3.12 or newer is needed for the safety service.', 'Install it from https://www.python.org/downloads/ (tick "Add to PATH").');

if (useDocker) {
  if (output('docker info --format "{{.ServerVersion}}"') === null) {
    fail('Docker is not running.', 'Start Docker Desktop and run `npm run setup` again (or use --no-docker with your own PostgreSQL + PostGIS and Redis).');
  }
  ok('Docker is running');
}

// ── 2. Environment files ──────────────────────────────────────────
step('Environment files');
function envFromExample(rel, fill) {
  const file = join(root, rel);
  if (existsSync(file)) {
    ok(`${rel} already exists (left as is)`);
    return false;
  }
  copyFileSync(`${file}.example`, file);
  if (fill) writeFileSync(file, fill(readFileSync(file, 'utf8')));
  ok(`created ${rel}`);
  return true;
}
envFromExample('services/tour-api/.env', (s) =>
  s
    .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET="${randomBytes(48).toString('base64url')}"`)
    .replace(/^MEDICAL_ENC_KEY=.*$/m, `MEDICAL_ENC_KEY="${randomBytes(32).toString('hex')}"`)
);
envFromExample('apps/web/.env');
envFromExample('services/safety/.env');

const apiEnv = readFileSync(join(root, 'services/tour-api/.env'), 'utf8');
const dbUrl = apiEnv.match(/^DATABASE_URL="?([^"\r\n]+)/m)?.[1] ?? '';
if (useDocker && !dbUrl.includes('localhost:5440')) {
  warn(`services/tour-api/.env uses DATABASE_URL on ${dbUrl.replace(/\/\/[^@]*@/, '//…@').split('?')[0]}, not this project's Docker database.`);
  warn('That database is used as is. To switch, set DATABASE_URL and REDIS_URL as in services/tour-api/.env.example.');
}

// ── 3. Database and Redis ─────────────────────────────────────────
if (useDocker) {
  step('Starting PostgreSQL + PostGIS (port 5440) and Redis (port 6390)');
  run('docker compose up -d postgres redis');
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    ready =
      output('docker exec pune_explorer_postgres pg_isready -U postgres -d Pune_Tour_Guide') !== null &&
      output('docker exec pune_explorer_redis redis-cli ping') === 'PONG';
    if (!ready) await sleep(1000);
  }
  if (!ready) fail('The database did not become ready within a minute.', 'Check `docker compose logs postgres`.');
  ok('database and Redis are up');
}

// ── 4. Packages, migrations, places ───────────────────────────────
step('Installing packages');
run('npm install --no-audit --no-fund');
ok('npm packages installed');

step('Database: migrations and curated places');
run('npm run prisma:generate', { quiet: true });
run('npm run prisma:deploy');
run('npm run seed -w services/tour-api');
ok('database ready');

// ── 5. Safety service ─────────────────────────────────────────────
step('Safety service (Python)');
const safetyDir = join(root, 'services/safety');
const venvPython = win ? join(safetyDir, '.venv', 'Scripts', 'python.exe') : join(safetyDir, '.venv', 'bin', 'python');
if (!existsSync(venvPython)) {
  run(`${python} -m venv .venv`, { cwd: safetyDir });
  ok('created services/safety/.venv');
}
run(`"${venvPython}" -m pip install --quiet --disable-pip-version-check -r requirements-dev.txt`, { cwd: safetyDir });
ok('Python packages installed');

// ── 6. Help points from OpenStreetMap ─────────────────────────────
if (args.has('--skip-help')) {
  step('Help points: skipped (run `npm run refresh:help` later)');
} else {
  step('Help points: importing hospitals, police and fire stations from OpenStreetMap (a few minutes)');
  const r = run('npm run refresh:help', { allowFail: true });
  if (r.status === 0) ok('help points imported');
  else warn('The import did not finish (the public OpenStreetMap servers are often busy). The app still works; run `npm run refresh:help` again later.');
}

console.log(`\n${green(bold('Setup complete.'))}
  Start everything:   ${bold('npm run dev')}
  Then open:          ${bold('http://localhost:5050')}   (on your phone: http://<this computer's IP>:5050)

  Web app :5050 · Tour API :3001 · Safety service :8010 · PostgreSQL :5440 · Redis :6390
  Stop the database:  npm run db:down      Checks: npm run lint · npm run typecheck · npm test`);
