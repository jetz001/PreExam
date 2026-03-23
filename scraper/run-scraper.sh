#!/bin/bash
# OCSC Scraper Execution Script with Timeout

SCRAPER_DIR="/root/PreExam/scraper"
LOG_FILE="/root/PreExam/scraper/scraper.log"
TIMEOUT="30m"

echo "--- Starting Scraper Run: $(date) ---" >> $LOG_FILE

# Run with timeout to prevent hanging
timeout $TIMEOUT docker-compose -f $SCRAPER_DIR/docker-compose.yml run --rm scraper >> $LOG_FILE 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
    echo "ERROR: Scraper timed out after $TIMEOUT" >> $LOG_FILE
elif [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: Scraper failed with exit code $EXIT_CODE" >> $LOG_FILE
else
    echo "SUCCESS: Scraper run completed." >> $LOG_FILE
fi

echo "--- End Run: $(date) ---" >> $LOG_FILE
