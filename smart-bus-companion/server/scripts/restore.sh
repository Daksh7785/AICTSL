#!/bin/bash
# restore.sh - Automates restoring the Smart Bus Companion database
# Usage: ./restore.sh <path_to_backup_directory>

DB_NAME="smart-bus-companion"

if [ -z "$1" ]; then
  echo "Error: Please provide the path to the backup directory."
  echo "Usage: ./restore.sh ./backups/2026-07-24_12-00-00/smart-bus-companion"
  exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "Error: Directory $BACKUP_DIR does not exist."
  exit 1
fi

echo "Starting restore of database: $DB_NAME from $BACKUP_DIR..."

mongorestore --db="$DB_NAME" "$BACKUP_DIR" --drop

if [ $? -eq 0 ]; then
  echo "Restore successful!"
else
  echo "Restore failed!"
  exit 1
fi
