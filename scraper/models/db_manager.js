const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DBManager {
    constructor() {
        this.dbPath = path.resolve(__dirname, '../scraper.db');
        this.db = new sqlite3.Database(this.dbPath);
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS jobs (
                        url TEXT PRIMARY KEY,
                        title TEXT,
                        last_scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        hash TEXT
                    )
                `, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    async isDuplicate(url) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT url FROM jobs WHERE url = ?', [url], (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            });
        });
    }

    async saveJob(url, title, hash) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT OR REPLACE INTO jobs (url, title, hash, last_scraped_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
                [url, title, hash],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    async pruneOldRecords() {
        return new Promise((resolve, reject) => {
            // Delete records older than 1 year (365 days)
            this.db.run(
                "DELETE FROM jobs WHERE last_scraped_at < date('now', '-365 days')",
                (err) => {
                    if (err) reject(err);
                    else {
                        console.log('Old records pruned from local database.');
                        resolve();
                    }
                }
            );
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = new DBManager();
