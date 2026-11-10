#!/usr/bin/env bash
# Restore drill (docs/LAUNCH_SETUP.md step 20b): proves the newest backup can be restored.
#
# Downloads the newest dump from BACKUP_BUCKET, restores it into a TEMPORARY database next to the
# real one, compares row counts with the live database, then deletes the temporary copy. The live
# database is never written to. Run on the server from /opt/pune-explorer:
#   ./restore-test.sh                 # newest backup
#   ./restore-test.sh db/2026-10-25_2030.dump
set -euo pipefail
cd "$(dirname "$0")"

setting() { grep -E "^$1=" .env.production | tail -1 | cut -d= -f2- | tr -d "\"'" || true; }
BUCKET="$(setting BACKUP_BUCKET)"
[ -n "$BUCKET" ] || { echo "BACKUP_BUCKET is not set in .env.production" >&2; exit 1; }
dc() { docker compose --env-file .env.production "$@"; }
TEST_DB=restore_check
psql_live() { dc exec -T postgres sh -c "psql -U \"\$POSTGRES_USER\" -d \"\$POSTGRES_DB\" -v ON_ERROR_STOP=1 -tAc '$1'"; }
psql_test() { dc exec -T postgres sh -c "psql -U \"\$POSTGRES_USER\" -d $TEST_DB -v ON_ERROR_STOP=1 -tAc '$1'"; }

if [ $# -ge 1 ]; then obj="gs://$BUCKET/$1"; else obj="$(gcloud storage ls "gs://$BUCKET/db/" | sort | tail -1)"; fi
[ -n "$obj" ] || { echo "No backups found in gs://$BUCKET/db/" >&2; exit 1; }
echo "Backup: $obj"

tmp="$(mktemp --suffix=.dump)"
cleanup() {
  rm -f "$tmp"
  psql_live "DROP DATABASE IF EXISTS $TEST_DB" >/dev/null 2>&1 || true
}
trap cleanup EXIT
gcloud storage cp --quiet "$obj" "$tmp" >/dev/null 2>&1

psql_live "DROP DATABASE IF EXISTS $TEST_DB" >/dev/null
psql_live "CREATE DATABASE $TEST_DB" >/dev/null
dc exec -T postgres sh -c "pg_restore -U \"\$POSTGRES_USER\" -d $TEST_DB --no-owner --exit-on-error" < "$tmp"

ok=1
printf '%-18s %10s %10s\n' table backup live
for t in User Place HelpPlace EmergencyContact MedicalProfile ItineraryStop DayRun SosEvent Stamp; do
  b="$(psql_test "SELECT count(*) FROM \"$t\"")"
  l="$(psql_live "SELECT count(*) FROM \"$t\"")"
  printf '%-18s %10s %10s\n' "$t" "$b" "$l"
  # Places and help points must come back; user tables may have grown since the backup
  case "$t" in Place|HelpPlace) [ "$b" -gt 0 ] || ok=0 ;; esac
done
gis="$(psql_test 'SELECT count(*) FROM "Place" WHERE location IS NOT NULL')"
echo "Places with a map location (PostGIS): $gis"
[ "$gis" -gt 0 ] || ok=0

if [ "$ok" = 1 ]; then echo "RESTORE TEST PASSED: the backup restores and the data is there."; else echo "RESTORE TEST FAILED" >&2; exit 1; fi
