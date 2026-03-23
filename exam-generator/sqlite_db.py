import sqlite3
from config import config

def get_connection():
    return sqlite3.connect(config.DB_PATH)

def get_next_category() -> str:
    """
    Reads the categories, skips 'ข้อสอบจริง' and 'Past Exam',
    rotates to the next valid category using last_category_index, and updates the index.
    Returns the category name.
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Get all valid categories
        cursor.execute("SELECT id, name FROM categories WHERE name NOT LIKE '%ข้อสอบจริง%' AND name NOT LIKE '%Past Exam%' ORDER BY id ASC")
        valid_categories = cursor.fetchall()
        
        if not valid_categories:
            raise ValueError("No valid categories found in the database. Ensure mock categories exist.")
            
        # Get rotation state
        cursor.execute("SELECT last_category_index FROM rotation WHERE id = 1")
        row = cursor.fetchone()
        last_index = row[0] if row else -1
        
        # Calculate next valid index relative to the list of valid categories we fetched
        next_index = (last_index + 1) % len(valid_categories)
        
        # Retrieve the selected category
        selected_category = valid_categories[next_index]
        
        # Update the rotation state
        cursor.execute("UPDATE rotation SET last_category_index = ? WHERE id = 1", (next_index,))
        conn.commit()
        
        return selected_category[1]

def get_previous_questions(category_name: str, limit: int = 20) -> str:
    """
    Retrieves previous questions for the given category to avoid duplicates.
    Returns a single string containing the historical questions.
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT question_text 
            FROM history 
            WHERE category_name = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (category_name, limit))
        
        rows = cursor.fetchall()
        
        if not rows:
            return "ไม่มีประวัติการสอบ (No history)"
            
        questions = [f"- {row[0]}" for row in rows]
        return "\n".join(questions)

def save_history(category_name: str, question_text: str):
    """
    Saves the newly generated question into the history table.
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO history (category_name, question_text)
            VALUES (?, ?)
        ''', (category_name, question_text))
        conn.commit()
