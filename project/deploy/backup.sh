#!/bin/bash

# Database Backup Script
# Run this script regularly to backup your database

set -e

# Configuration
BACKUP_DIR="/opt/consultant-tracker/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="consultant_tracker_backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Load environment variables
source /opt/consultant-tracker/backend/.env

echo "📦 Creating database backup..."

# Create backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

echo "✅ Backup created: $BACKUP_DIR/$BACKUP_FILE.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "consultant_tracker_backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up"