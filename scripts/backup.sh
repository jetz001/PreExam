#!/bin/bash

# Configuration
DB_PATH="/root/PreExam/database.sqlite"
UPLOADS_PATH="/root/PreExam/server/public/uploads"
BACKUP_DIR="/backups"
DATE=$(date +%Y-%m-%d_%H%M)
FILENAME="backup-$DATE.zip"
ZIP_PASSWORD="CHANGE_ME_TO_STRONG_PASSWORD" # เปลี่ยนรหัสผ่านตรงนี้
EMAIL="support@preexam.online"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# 1. Integrity Check
if command -v sqlite3 &> /dev/null; then
    INTEGRITY=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;")
    if [ "$INTEGRITY" != "ok" ]; then
        echo "Database Corrupted!" | mail -s "❌ [PreExam] Backup Failed: DB Corrupt" $EMAIL
        exit 1
    fi
else
    echo "SQLite3 not installed, skipping integrity check."
fi

# 2. Dump & Zip (with Password)
# Create a temp copy using VACUUM INTO (safer for live DB) or .backup
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/temp.sqlite'"

# Zip the database and uploads
zip -j -P "$ZIP_PASSWORD" "$BACKUP_DIR/$FILENAME" "$BACKUP_DIR/temp.sqlite"
if [ -d "$UPLOADS_PATH" ]; then
    zip -r -P "$ZIP_PASSWORD" "$BACKUP_DIR/$FILENAME" "$UPLOADS_PATH"
fi

# Remove temp file
rm "$BACKUP_DIR/temp.sqlite"

# 3. Upload to Google Drive
if command -v rclone &> /dev/null; then
    rclone copy "$BACKUP_DIR/$FILENAME" gdrive:/backups/
    # Cleanup Cloud
    rclone delete gdrive:/backups/ --min-age 30d
else
    echo "Rclone not installed, skipping cloud upload."
fi

# 4. Cleanup Local
find "$BACKUP_DIR" -type f -mtime +7 -delete

# Notify
echo "Backup Success: $FILENAME" | mail -s "✅ [PreExam] Backup Success" $EMAIL
