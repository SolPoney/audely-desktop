#!/usr/bin/env bash
# ================================================================
# AUDELY DESKTOP — Script de sauvegarde MySQL
# ================================================================
# Usage:
#   chmod +x BDD/backup.sh
#   ./BDD/backup.sh
#
# Variables d'environnement requises (ou fichier .env) :
#   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
#
# Le backup est compressé (gzip) et horodaté.
# Les fichiers de plus de 30 jours sont supprimés automatiquement.
# ================================================================

set -euo pipefail

# ── Charger les variables depuis .env si présent ────────────────
if [ -f "$(dirname "$0")/../backend/.env" ]; then
  # shellcheck disable=SC1091
  export "$(grep -v '^#' "$(dirname "$0")/../backend/.env" | xargs)"
fi

DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-audely_app}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-audely_desktop}"

BACKUP_DIR="$(dirname "$0")/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Début de la sauvegarde de la base '$DB_NAME'..."

# ── Dump + compression ───────────────────────────────────────────
mysqldump \
  --host="$DB_HOST" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup créé : $BACKUP_FILE"

# ── Nettoyage des backups de plus de 30 jours ───────────────────
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
echo "[$(date)] Anciens backups nettoyés (> 30 jours)."

# ── Restauration (commenter pour ne pas exécuter) ───────────────
# Pour restaurer :
#   gunzip < backup.sql.gz | mysql -h $DB_HOST -u $DB_USER -p $DB_NAME
