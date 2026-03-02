import httpx
import logging

class APIClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "X-API-KEY": api_key,
            "Content-Type": "application/json"
        }

    async def post_job(self, job_data):
        url = f"{self.base_url}/api/scraper/jobs"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=job_data, headers=self.headers, timeout=30.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logging.error(f"Failed to post job: {e}")
                return None

    async def post_alert(self, message, alert_type="system"):
        url = f"{self.base_url}/api/scraper/alert"
        payload = {"message": message, "type": alert_type}
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=self.headers, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logging.error(f"Failed to post alert: {e}")
                return None
