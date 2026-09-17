#!/usr/bin/env bash
# ==============================================================================
# Tag-per-Track Frontend - Script de Déploiement Automatisé VPS
# ==============================================================================

set -euo pipefail

# Configuration VPS
SSH_HOST="${TAG_PER_TRACK_SSH_HOST:-tag-per-track}"
REMOTE_FRONTEND_DIR="/var/www/tag-per-track"

# Palette de couleurs (ANSI portable)
C_RESET="$(printf '\033[0m')"
C_BOLD="$(printf '\033[1m')"
C_GREEN="$(printf '\033[32m')"
C_BLUE="$(printf '\033[34m')"
C_YELLOW="$(printf '\033[33m')"
C_RED="$(printf '\033[31m')"
C_CYAN="$(printf '\033[36m')"

log_info() { printf "%s%s[INFO]%s %s\n" "${C_BLUE}" "${C_BOLD}" "${C_RESET}" "$*"; }
log_success() { printf "%s%s[SUCCESS]%s %s\n" "${C_GREEN}" "${C_BOLD}" "${C_RESET}" "$*"; }
log_warn() { printf "%s%s[WARN]%s %s\n" "${C_YELLOW}" "${C_BOLD}" "${C_RESET}" "$*"; }
log_error() { printf "%s%s[ERROR]%s %s\n" "${C_RED}" "${C_BOLD}" "${C_RESET}" "$*"; }
log_step() { printf "\n%s%s==>%s %s%s%s\n" "${C_CYAN}" "${C_BOLD}" "${C_RESET}" "${C_BOLD}" "$*" "${C_RESET}"; }

# Vérifier la connectivité SSH avec le VPS
check_ssh() {
  log_info "Vérification de la connexion SSH vers '${SSH_HOST}'..."
  if ! ssh -q -o BatchMode=yes -o ConnectTimeout=5 "${SSH_HOST}" "exit 0" 2>/dev/null; then
    log_error "Impossible de se connecter au serveur SSH '${SSH_HOST}'."
    log_warn "Vérifiez votre configuration ~/.ssh/config ou la variable TAG_PER_TRACK_SSH_HOST."
    exit 1
  fi
  log_success "Connexion SSH établie avec succès."
}

deploy() {
  local start_time=$(date +%s)
  log_step "Déploiement du FRONTEND (Angular 18)..."

  # Étape 1 : Compilation de l'application Angular
  log_info "Étape 1/3 : Compilation de l'application Angular (npm run build)..."
  npm run build
  log_success "Compilation Angular terminée avec succès."

  local dist_dir="dist/frontend/browser"
  if [ ! -d "$dist_dir" ]; then
    log_error "Dossier de build introuvable à : ${dist_dir}"
    exit 1
  fi

  # Étape 2 : Transfert vers le VPS
  log_info "Étape 2/3 : Synchronisation vers ${SSH_HOST}:${REMOTE_FRONTEND_DIR}..."
  rsync -avz --delete "${dist_dir}/" "${SSH_HOST}:${REMOTE_FRONTEND_DIR}/"
  log_success "Fichiers statiques transférés avec succès."

  # Étape 3 : Test de santé HTTP
  log_info "Étape 3/3 : Test de santé du site live..."
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" https://tag-per-track.cloud || true)
  if [ "$http_code" = "200" ]; then
    log_success "Frontend disponible sur https://tag-per-track.cloud (HTTP 200 OK)."
  else
    log_error "Échec du test de santé Frontend ! Le serveur a répondu avec le statut HTTP ${http_code}."
    exit 1
  fi

  local duration=$(( $(date +%s) - start_time ))
  log_success "Déploiement du Frontend terminé en ${duration}s !"
}

main() {
  printf "%s%s" "${C_CYAN}" "${C_BOLD}"
  echo "╔═══════════════════════════════════════════════════════╗"
  echo "║   Tag-per-Track Frontend - Déploiement VPS en 1 clic  ║"
  echo "╚═══════════════════════════════════════════════════════╝"
  printf "%s\n" "${C_RESET}"

  check_ssh
  deploy
  printf "\n%s%s✨ Frontend à jour et disponible sur le web !%s\n\n" "${C_GREEN}" "${C_BOLD}" "${C_RESET}"
}

main "$@"
