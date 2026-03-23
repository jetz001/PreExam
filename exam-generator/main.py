import sys
import time
import argparse
import logging
import os
from sqlite_db import get_next_category, get_previous_questions, save_history
from ai_generator import generate_exam_question
from api_client import post_exam_draft, send_inbox_alert

# Setup logging
log_file = os.path.join(os.path.dirname(__file__), 'generator.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

MAX_RETRIES = 3

def main():
    parser = argparse.ArgumentParser(description="Daily Exam Generator using Gemini API")
    parser.add_argument("--dry-run", action="store_true", help="Run without posting to the backend API")
    args = parser.parse_args()

    # Step 1: Get the category for today
    try:
        category_name = get_next_category()
        logging.info(f"Today's Assigned Category: {category_name}")
    except Exception as e:
        logging.error(f"Error fetching category: {e}")
        send_inbox_alert(f"Failed to fetch today's category. Error: {e}")
        return

    # Step 2: Fetch history to prevent duplicates
    previous_questions = get_previous_questions(category_name, limit=1)
    logging.info(f"Fetched {len(previous_questions.split('- ')) - 1} previous questions for context.")

    # Step 3: Generate Question via Gemini API with Retry Logic
    attempt = 0
    exam_data = None
    last_error = None
    
    while attempt < MAX_RETRIES:
        try:
            attempt += 1
            logging.info(f"Calling Gemini API (Attempt {attempt}/{MAX_RETRIES})...")
            exam_data = generate_exam_question(category_name, previous_questions)
            break
        except Exception as e:
            last_error = e
            logging.error(f"Attempt {attempt} failed: {e}")
            if attempt < MAX_RETRIES:
                time.sleep(2 ** attempt)  # Exponential Backoff
    
    if not exam_data:
        msg = f"Failed to generate exam question after {MAX_RETRIES} attempts. Last error: {last_error}"
        logging.error(msg)
        send_inbox_alert(msg)
        return

    logging.info("Successfully generated question JSON")

    # Step 4: Validate and Post (or skip if dry-run)
    if args.dry_run:
        logging.info("DRY RUN MODE: Skipping API Post and Database Save.")
        return
        
    logging.info("Posting to PreExam backend...")
    success = post_exam_draft(category_name, exam_data)
    
    # Step 5: Save to local DB and Send Notification
    if success:
        save_history(category_name, exam_data['question_text'])
        success_msg = f"🤖 AI ได้สร้างข้อสอบใหม่ในชุดวิชา [{category_name}] เรียบร้อยแล้ว (สถานะ: ฉบับร่าง) กรุณาเข้าไปตรวจสอบ"
        logging.info(success_msg)
        send_inbox_alert(success_msg)
    else:
        err_msg = f"AI generated the exam for [{category_name}] but the Express Backend rejected the payload. Please check the server logs."
        logging.error(err_msg)
        send_inbox_alert(err_msg)

if __name__ == "__main__":
    main()
