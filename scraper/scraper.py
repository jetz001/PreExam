import asyncio
import logging
import yaml
import hashlib
import sys
import argparse
from datetime import datetime
from playwright.async_api import async_playwright
from db_manager import DBManager
from api_client import APIClient
from models import JobData

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler("scraper.log"), logging.StreamHandler()]
)

class OCSCScraper:
    def __init__(self, config_path="config.yaml"):
        with open(config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)
        self.db = DBManager()
        # API credentials should be in .env or passed via env vars
        import os
        from dotenv import load_dotenv
        load_dotenv()
        
        base_url = os.getenv("PREEXAM_API_URL", "http://localhost:3000")
        api_key = os.getenv("SCRAPER_API_KEY", "dev_scraper_key")
        self.api = APIClient(base_url, api_key)

    async def scrape(self, dry_run=False):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.config['browser']['headless'])
            context = await browser.new_context(user_agent=self.config['browser']['user_agents'][0])
            page = await context.new_page()

            try:
                logging.info(f"Starting scrape at {self.config['urls']['portal']}")
                await page.goto(self.config['urls']['portal'], timeout=120000)
                
                # Step 1: Get Agencies
                agencies = await self.get_agency_info(page)
                logging.info(f"Found {len(agencies)} agencies")

                all_jobs_count = 0
                for agency in agencies:
                    agency_url = agency['url']
                    agency_name = agency['name']
                    # Step 2: Get Jobs for Agency
                    job_urls = await self.get_job_urls(page, agency_url)
                    logging.info(f"Found {len(job_urls)} jobs in {agency_name}")

                    for job_url in job_urls:
                        if self.db.is_processed(job_url) and not dry_run:
                            logging.info(f"Skipping already processed job: {job_url}")
                            continue

                        # Step 3: Scrape Job Detail
                        job_data = await self.scrape_job_detail(page, job_url)
                        if job_data:
                            job_data['agency'] = agency_name # Add agency name
                            if dry_run:
                                logging.info(f"DRY RUN: Would post job: {job_data['title']} (Agency: {agency_name})")
                            else:
                                res = await self.api.post_job(job_data)
                                if res and res.get('success'):
                                    self.db.save_job(job_url, hashlib.md5(str(job_data).encode()).hexdigest())
                                    all_jobs_count += 1
                                    logging.info(f"Successfully posted: {job_data['title']}")

                summary_msg = f"OCSC Scraper finished. Processed {all_jobs_count} new jobs."
                logging.info(summary_msg)
                if not dry_run:
                    await self.api.post_alert(summary_msg)

            except Exception as e:
                error_msg = f"OCSC Scraper failed: {str(e)}"
                logging.error(error_msg)
                if not dry_run:
                    await self.api.post_alert(error_msg, alert_type="error")
            finally:
                await browser.close()

    async def get_agency_info(self, page):
        selectors = self.config['selectors']['home']
        await page.wait_for_selector(selectors['category_block'], timeout=60000)
        links = await page.query_selector_all(selectors['agency_card'])
        agencies = []
        for link in links:
            href = await link.get_attribute('href')
            text_el = await link.query_selector('p') # The name is usually in a paragraph inside the a tag
            name = await text_el.inner_text() if text_el else "Unknown Agency"
            
            if href:
                url = self.config['urls']['search_prefix'] + href if href.startswith('/') else href
                agencies.append({
                    'name': name.strip(),
                    'url': url
                })
        
        # Remove duplicates based on URL
        seen = set()
        unique_agencies = []
        for a in agencies:
            if a['url'] not in seen:
                seen.add(a['url'])
                unique_agencies.append(a)
        return unique_agencies

    async def get_job_urls(self, page, agency_url):
        selectors = self.config['selectors']['job_list']
        await page.goto(agency_url)
        try:
            await page.wait_for_selector(selectors['container'], timeout=10000)
            links = await page.query_selector_all(selectors['job_card'])
            urls = []
            for link in links:
                href = await link.get_attribute('href')
                if href:
                    urls.append(self.config['urls']['search_prefix'] + href if href.startswith('/') else href)
            return urls
        except:
            return []

    async def scrape_job_detail(self, page, job_url):
        selectors = self.config['selectors']['job_detail']
        await page.goto(job_url)
        await page.wait_for_selector(selectors['main'])
        
        main_content = await page.query_selector(selectors['main'])
        if not main_content: return None

        # Data extraction logic
        data = {
            "external_link": job_url,
            "source_memo": f"Fetched from OCSC on {datetime.now().strftime('%Y-%m-%d')}"
        }

        # Extract specific parts (Simulated logic based on brief)
        sections = await main_content.query_selector_all(selectors['sections'])
        content_parts = []
        
        for section in sections:
            header_text = await section.inner_text()
            header_text = header_text.strip()
            
            # Find next element content safely
            content_elem = await section.evaluate_handle("el => el.nextElementSibling")
            if content_elem:
                # Use evaluate directly to get textContent which is safer
                val = await content_elem.evaluate("el => el.textContent || el.innerText || ''")
                if not val:
                    continue
                val = val.strip()
                
                if "ตำแหน่ง" in header_text: data["title"] = val
                elif "เงินเดือน" in header_text: content_parts.append(f"💰 {header_text}: {val}")
                elif "จำนวน" in header_text: content_parts.append(f"👥 {header_text}: {val}")
                elif "ระดับการศึกษา" in header_text: content_parts.append(f"🎓 {header_text}:\n{val}")
                elif "เปิดรับสมัคร" in header_text: 
                    data["summary"] = f"เปิดรับสมัคร: {val}"
                    content_parts.append(f"📅 {header_text}: {val}")
                else:
                    content_parts.append(f"📝 {header_text}:\n{val}")

        # PDF Link
        pdf_link_elem = await main_content.query_selector(selectors['pdf_download'])
        if pdf_link_elem:
            pdf_href = await pdf_link_elem.get_attribute('href')
            if pdf_href:
                data["pdf_url"] = pdf_href
                content_parts.append(f"\n📥 [ดาวน์โหลดประกาศรับสมัครฉบับเต็ม]({pdf_href})")

        # Agency Logo
        try:
            agency_logo_elem = await page.wait_for_selector(selectors.get('agency_logo', 'header.job-detail-header img'), timeout=5000)
            if agency_logo_elem:
                logo_url = await agency_logo_elem.get_attribute('src')
                if logo_url:
                    if logo_url.startswith('/'):
                        logo_url = 'https://job.ocsc.go.th' + logo_url
                    data["image_url"] = logo_url
        except Exception:
            logging.warning(f"Could not find agency logo for {job_url}")

        data["content"] = "\n\n".join(content_parts)
        
        # Validation
        try:
            return JobData(**data).dict()
        except Exception as e:
            logging.warning(f"Validation failed for {job_url}: {e}")
            return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    scraper = OCSCScraper()
    asyncio.run(scraper.scrape(dry_run=args.dry_run))
    sys.exit(0)
