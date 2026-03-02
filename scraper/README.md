# OCSC Job Scraper

Automated tool to scrape job announcements from the OCSC portal and sync them to PreExam.

## Setup

1. Copy `.env.example` to `.env` and configure.
2. Install dependencies:
   ```bash
   pip install playwright playwright-stealth httpx pyyaml pydantic python-dotenv
   playwright install chromium
   ```

## Usage

Run manually:
```bash
python scraper.py
```

Dry run (no API calls):
```bash
python scraper.py --dry-run
```

## Deployment with Docker

```bash
docker-compose up -d --build
```

The scraper is configured to run daily at midnight via cron.
