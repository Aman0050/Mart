# Disaster Recovery & Backup Plan

## 1. Database Backups (PostgreSQL)
We utilize a multi-layered backup strategy to ensure zero data loss.

### Automated Backups
Run a cron job on the VPS that executes a `pg_dump` and syncs the archive directly to AWS S3.
**Cronjob Configuration (`/etc/cron.daily/db-backup`):**
```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
docker exec nexmarto_db pg_dump -U nexmarto -F c nexmarto > /backups/db_$TIMESTAMP.dump
aws s3 cp /backups/db_$TIMESTAMP.dump s3://nexmarto-backups/database/
```

## 2. Object Storage Backups (AWS S3)
For product images, logos, and user uploads stored in S3:
1. Enable **Cross-Region Replication (CRR)** on the primary S3 bucket to replicate objects to a secondary fallback region.
2. Enable **Object Versioning** to prevent accidental deletions or overwrites.

## 3. Recovery Procedures
If the database container crashes or data is corrupted:

**Restoring from the latest S3 Dump:**
```bash
# 1. Download the latest dump
aws s3 cp s3://nexmarto-backups/database/db_latest.dump ./db_latest.dump

# 2. Stop the API to prevent write conflicts
docker-compose stop api

# 3. Drop and recreate the schema (WARNING: Destructive)
docker exec -it nexmarto_db psql -U nexmarto -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# 4. Restore the database
docker exec -i nexmarto_db pg_restore -U nexmarto -d nexmarto < ./db_latest.dump

# 5. Start API
docker-compose start api
```
