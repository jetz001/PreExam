import os
from dotenv import load_dotenv

# Load main project .env file located one level up from exam-generator
env_path = os.path.join(os.path.dirname(__file__), "..", "server", ".env")
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PREEXAM_API_URL = os.getenv("PREEXAM_API_URL", "http://localhost:3000")
# Use the same scraper API key for the generator to keep things simple for the mock, 
# or a new one specifically for it.
GENERATOR_API_KEY = os.getenv("SCRAPER_API_KEY", "your-fallback-secret-key")

class Config:
    GEMINI_API_KEY = GEMINI_API_KEY
    PREEXAM_API_URL = PREEXAM_API_URL
    GENERATOR_API_KEY = GENERATOR_API_KEY
    DB_PATH = os.path.join(os.path.dirname(__file__), "exams.db")

config = Config()
