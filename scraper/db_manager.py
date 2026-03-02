import sqlite3
import os
from datetime import datetime, timedelta

class DBManager:
    def __init__(self, db_path="jobs_state.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS processed_jobs (
                    url TEXT PRIMARY KEY,
                    last_scraped DATETIME,
                    hash TEXT,
                    status TEXT
                )
            """)
            conn.commit()

    def is_processed(self, url, content_hash=None):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT hash FROM processed_jobs WHERE url = ?", (url,))
            row = cursor.fetchone()
            if not row:
                return False
            if content_hash and row[0] != content_hash:
                return False
            return True

    def save_job(self, url, content_hash, status="inserted"):
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO processed_jobs (url, last_scraped, hash, status)
                VALUES (?, ?, ?, ?)
            """, (url, datetime.now().isoformat(), content_hash, status))
            conn.commit()

    def prune_old_records(self, days=365):
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM processed_jobs WHERE last_scraped < ?", (cutoff,))
            conn.commit()
