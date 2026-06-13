#!/bin/bash
# -----------------------------------------------------------------------------
# Nexmarto Automated PostgreSQL Backup Script
# Target RPO: < 15 Minutes
# Description: Dumps the PostgreSQL database, compresses it, and syncs to AWS S3.
# This script should be attached to a cron job running every 15 minutes:
# */15 * * * * /path/to/infrastructure/scripts/backup-db.sh >> /var/log/backup.log 2>&1
# -----------------------------------------------------------------------------

set -e # Exit immediately if a command exits with a non-zero status
set -o pipefail # Return value of a pipeline is the status of the last command to exit with a non-zero status

# Configuration
DB_CONTAINER_NAME="nexmarto_postgres"
DB_USER="postgres"
DB_NAME="nexmarto"
BACKUP_DIR="/tmp/nexmarto-backups/db"
S3_BUCKET="s3://nexmarto-dr-vault/database-backups"
TIMESTAMP=$(date +"%Y-%m-%dT%H%M%S")
BACKUP_FILE="$BACKUP_DIR/nexmarto_db_$TIMESTAMP.sql.gz"

echo "[$(date)] Starting Nexmarto Database Backup..."

# Ensure local backup directory exists
mkdir -p "$BACKUP_DIR"

# Execute pg_dump inside the docker container, gzip it, and save to local filesystem
echo "[$(date)] Dumping and compressing database..."
docker exec "$DB_CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" -F p | gzip > "$BACKUP_FILE"

# Verify dump was created and is not completely empty (min size check)
if [ ! -s "$BACKUP_FILE" ]; then
    echo "[$(date)] ERROR: Backup file is empty or missing!"
    exit 1
fi

# Sync to AWS S3 (Requires AWS CLI to be configured on the host)
echo "[$(date)] Uploading to S3 Vault ($S3_BUCKET)..."
aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/" --storage-class STANDARD_IA

# Retention Policy: Delete local backups older than 24 hours to save disk space
echo "[$(date)] Pruning local backups older than 24 hours..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mmin +1440 -exec rm {} \;

echo "[$(date)] Database Backup Completed Successfully."
exit 0
