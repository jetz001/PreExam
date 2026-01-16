#!/bin/bash

# Configuration
# Usage: ./restore.sh <path_to_zip_file>

BACKUP_FILE=$1
PROJECT_ROOT="/root/PreExam"
DB_PATH="$PROJECT_ROOT/database.sqlite"
EMAIL="support@preexam.online"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <path_to_zip_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "File not found: $BACKUP_FILE"
    exit 1
fi

echo "🔐 กรุณาใส่รหัสผ่านไฟล์ Backup (ถ้ามี):"

# 1. Stop Service
echo "Stopping PM2 services..."
pm2 stop all

# 2. Emergency Backup of current state
echo "Creating emergency backup of current state..."
cp "$DB_PATH" "$DB_PATH.emergency_$(date +%s).bak"

# 3. Extract & Restore
# -o overwrite without prompting
# -d destination directory
echo "Restoring from $BACKUP_FILE..."
unzip -o "$BACKUP_FILE" -d "$PROJECT_ROOT/"

# Move temp database if it was zipped as temp.sqlite (handling script logic)
if [ -f "$PROJECT_ROOT/temp.sqlite" ]; then
    mv "$PROJECT_ROOT/temp.sqlite" "$DB_PATH"
fi

# 4. Restart Service
echo "Restarting PM2 services..."
pm2 restart all

echo "Restore Completed." | mail -s "✅ [PreExam] System Restored" $EMAIL
