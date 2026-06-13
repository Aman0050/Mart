#!/bin/bash
# -----------------------------------------------------------------------------
# Nexmarto Automated PostgreSQL Restore Script
# Target RTO: < 30 Minutes
# Description: Fetches a backup from S3, drops the current DB, and restores it.
# Usage: ./restore-db.sh [S3_FILE_NAME]
# -----------------------------------------------------------------------------

set -e
set -o pipefail

# Configuration
DB_CONTAINER_NAME="nexmarto_postgres"
DB_USER="postgres"
DB_NAME="nexmarto"
RESTORE_DIR="/tmp/nexmarto-restore"
S3_BUCKET="s3://nexmarto-dr-vault/database-backups"

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file_name_on_s3>"
    echo "Example: $0 nexmarto_db_2026-06-13T120000.sql.gz"
    exit 1
fi

BACKUP_FILE_NAME="$1"
LOCAL_ARCHIVE="$RESTORE_DIR/$BACKUP_FILE_NAME"
EXTRACTED_FILE="$RESTORE_DIR/restore.sql"

echo "[$(date)] Starting Disaster Recovery: Database Restore"
echo "[!] WARNING: This will DROP the current '$DB_NAME' database!"
read -p "Are you absolutely sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore aborted."
    exit 1
fi

mkdir -p "$RESTORE_DIR"

# 1. Fetch from S3
echo "[$(date)] Downloading backup from S3 ($S3_BUCKET/$BACKUP_FILE_NAME)..."
aws s3 cp "$S3_BUCKET/$BACKUP_FILE_NAME" "$LOCAL_ARCHIVE"

# 2. Decompress
echo "[$(date)] Decompressing archive..."
gzip -d -c "$LOCAL_ARCHIVE" > "$EXTRACTED_FILE"

# 3. Copy into Postgres Container
echo "[$(date)] Transferring SQL to database container..."
docker cp "$EXTRACTED_FILE" "$DB_CONTAINER_NAME:/tmp/restore.sql"

# 4. Drop and Recreate Database
echo "[$(date)] Dropping and recreating database schema..."
docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;" || true
docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;"

# 5. Hydrate Database
echo "[$(date)] Hydrating database from backup..."
docker exec "$DB_CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -f "/tmp/restore.sql"

# Cleanup
echo "[$(date)] Cleaning up temporary files..."
rm -rf "$RESTORE_DIR"
docker exec "$DB_CONTAINER_NAME" rm -f "/tmp/restore.sql"

echo "[$(date)] Database Restoration Completed Successfully! RTO target achieved."
exit 0
