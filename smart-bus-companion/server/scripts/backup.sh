#!/bin/bash
# backup.sh - Automates backing up the Smart Bus Companion database
# Note: Ensure mongodump is installed and in your PATH.

DB_NAME="smart-bus-companion"
BACKUP_DIR="./backups/$(date +%Y-%m-%d_%H-%M-%S)"

echo "Starting backup of database: $DB_NAME..."
mkdir -p "$BACKUP_DIR"

mongodump --db="$DB_NAME" --out="$BACKUP_DIR"

if [ $? -eq 0 ]; then
  echo "Backup successful! Data saved to: $BACKUP_DIR"
else
  echo "Backup failed!"
  exit 1
fi
