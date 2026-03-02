from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime

class JobData(BaseModel):
    title: str
    content: str
    summary: Optional[str] = ""
    external_link: HttpUrl
    pdf_url: Optional[str] = None
    image_url: Optional[str] = None
    keywords: Optional[str] = ""
    source_memo: Optional[str] = ""

    def dict(self, *args, **kwargs):
        # Ensure HttpUrl is cast to string for JSON serialization
        d = super().dict(*args, **kwargs)
        if d.get('external_link'):
            d['external_link'] = str(d['external_link'])
        return d

class ScraperState(BaseModel):
    last_run: datetime
    jobs_processed: int
    errors: int
