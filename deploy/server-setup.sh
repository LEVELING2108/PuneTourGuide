#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu 22.04/24.04 server (e.g. Azure for Students B1s) for Pune Explorer.
# Run it on the server as your normal (sudo) user:
#
#   curl -fsSL https://raw.githubusercontent.com/LEVELING2108/PuneTourGuide/main/deploy/server-setup.sh -o setup.sh
#   bash setup.sh your-domain.app you@example.com
#
# It installs Docker, adds swap (small servers), opens only ports 22/80/443, turns on automatic
# security updates, puts the compose files in /opt/pune-explorer and creates .env.production
# with fresh secrets. Then fill in the remaining values (docs/LAUNCH_SETUP.md) and start it.
set -euo pipefail

DOMAIN="${1:?Usage: bash setup.sh <domain> <email-for-https-certificates>}"
ACME_EMAIL="${2:?Usage: bash setup.sh <domain> <email-for-https-certificates>}"
REPO="${REPO:-LEVELING2108/PuneTourGuide}"
BRANCH="${BRANCH:-main}"
OWNER_LC="$(echo "${REPO%%/*}" | tr '[:upper:]' '[:lower:]')"
DIR=/opt/pune-explorer
RAW="https://raw.githubusercontent.com/${REPO}/${BRANCH}/deploy"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

say "System updates"
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates ufw unattended-upgrades openssl
sudo dpkg-reconfigure -f noninteractive unattended-upgrades

say "Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"
sudo systemctl enable --now docker

say "Swap (2 GB) so a 1 GB server does not run out of memory"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  echo 'vm.swappiness=10' | sudo tee /etc/sysctl.d/99-swap.conf >/dev/null
  sudo sysctl -p /etc/sysctl.d/99-swap.conf
fi

say "Firewall: SSH, HTTP and HTTPS only"
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable

say "App folder ${DIR}"
sudo mkdir -p "$DIR"
sudo chown "$USER":"$USER" "$DIR"
cd "$DIR"
curl -fsSL "$RAW/docker-compose.prod.yml" -o compose.yaml
curl -fsSL "$RAW/Caddyfile" -o Caddyfile

if [ ! -f .env.production ]; then
  curl -fsSL "$RAW/.env.production.example" -o .env.production
  rand_b64() { openssl rand -base64 "$1" | tr -d '\n=+/' ; }
  RAM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
  REDIS_PASSWORD="$(rand_b64 32)"
  set_env() { # key value
    if grep -q "^$1=" .env.production; then sed -i "s|^$1=.*|$1=$2|" .env.production; else echo "$1=$2" >> .env.production; fi
  }
  set_env DOMAIN "$DOMAIN"
  set_env ACME_EMAIL "$ACME_EMAIL"
  set_env APP_URL "https://$DOMAIN"
  set_env CORS_ORIGINS "https://$DOMAIN,https://localhost"
  set_env EMAIL_FROM "\"Pune Explorer <no-reply@$DOMAIN>\""
  set_env APP_IMAGE "ghcr.io/$OWNER_LC/pune-explorer-app:latest"
  set_env SAFETY_IMAGE "ghcr.io/$OWNER_LC/pune-explorer-safety:latest"
  set_env JWT_SECRET "$(rand_b64 48)"
  set_env MEDICAL_ENC_KEY "$(openssl rand -hex 32)"
  set_env REDIS_PASSWORD "$REDIS_PASSWORD"
  set_env REDIS_URL "redis://:$REDIS_PASSWORD@redis:6379"
  if [ "$RAM_MB" -lt 1800 ]; then
    # Small server: one process each, capped memory
    set_env NODE_OPTIONS "--max-old-space-size=256"
    set_env SAFETY_WORKERS 1
    set_env REDIS_MAXMEMORY 64mb
  fi
  chmod 600 .env.production
  echo
  echo "Created ${DIR}/.env.production with new secrets."
  echo "!! Copy MEDICAL_ENC_KEY from it into your password manager now: without it, saved medical info can never be read again."
fi

say "Nightly help-point import at 03:00 IST (21:30 UTC)"
CRON="30 21 * * * cd $DIR && docker compose --env-file .env.production --profile jobs run --rm refresh-help >> $DIR/refresh-help.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'refresh-help' ; echo "$CRON" ) | crontab -

say "Done"
cat <<EOF
Next (docs/LAUNCH_SETUP.md, "Free student setup"):
  1. Fill in the rest of ${DIR}/.env.production   (nano ${DIR}/.env.production)
  2. Log out and back in once (so 'docker' works without sudo), then:
       cd ${DIR}
       docker compose --env-file .env.production pull
       docker compose --env-file .env.production up -d
       docker compose --env-file .env.production run --rm app node dist/seed.js --force
       docker compose --env-file .env.production --profile jobs run --rm refresh-help
  3. Open https://${DOMAIN}
EOF
