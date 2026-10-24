#!/usr/bin/env bash
# Nightly database backup to Google Cloud Storage (docs/LAUNCH_SETUP.md step 20b).
#
# Runs on the server as the `deploy` user from /opt/pune-explorer (cron, 20:30 UTC = 2:00 AM Pune):
#   30 20 * * * /opt/pune-explorer/backup-db.sh >> /opt/pune-explorer/backup.log 2>&1
# Settings in .env.production:
#   BACKUP_BUCKET=pune-explorer-backups-xxxx   (private bucket; the server may add and read, not delete)
#   BACKUP_PING_URL=https://hc-ping.com/...     (optional: emails you when a night's backup is missing)
#
# The dump is checked before upload, so a broken dump never lands in the bucket as "the latest".
# MEDICAL_ENC_KEY is NOT in the backup: keep it (and .env.production) in a password manager, or the
# medical details in any restore can never be read.
set -euo pipefail
cd "$(dirname "$0")"

setting() { grep -E "^$1=" .env.production | tail -1 | cut -d= -f2- | tr -d "\"'" || true; }
BUCKET="$(setting BACKUP_BUCKET)"
PING="$(setting BACKUP_PING_URL)"
dc() { docker compose --env-file .env.production "$@"; }
ping() { [ -n "$PING" ] && curl -fsS -m 10 --retry 3 "$PING$1" >/dev/null || true; }
fail() { echo "$(date -u +%FT%TZ) backup FAILED: $*" >&2; ping /fail; exit 1; }

[ -n "$BUCKET" ] || fail "BACKUP_BUCKET is not set in .env.production"
ping /start

tmp="$(mktemp --suffix=.dump)"
trap 'rm -f "$tmp"' EXIT

# Custom format: compressed, and restorable table by table
dc exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$tmp" 2>/dev/null || fail "pg_dump failed"
size=$(stat -c %s "$tmp")
[ "$size" -gt 10000 ] || fail "dump is only $size bytes"
# A dump pg_restore can read back, with the tables we can't lose
list="$(dc exec -T postgres pg_restore --list < "$tmp" 2>/dev/null)" || fail "pg_restore cannot read the dump"
for t in User Place EmergencyContact MedicalProfile SosEvent; do
  grep -q "TABLE DATA public $t " <<<"$list" || fail "table $t missing from the dump"
done

name="db/$(date -u +%Y-%m-%d_%H%M).dump"
gcloud storage cp --quiet "$tmp" "gs://$BUCKET/$name" >/dev/null 2>&1 || fail "upload to gs://$BUCKET failed"

echo "$(date -u +%FT%TZ) backup ok: gs://$BUCKET/$name ($((size / 1024)) KB)"
ping ""
