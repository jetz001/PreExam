import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "exams.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create Categories table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )
    ''')

    # Create History table to store generated questions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT NOT NULL,
            question_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create Rotation state table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rotation (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            last_category_index INTEGER DEFAULT -1
        )
    ''')
    
    # Insert default row for rotation if missing
    cursor.execute("INSERT OR IGNORE INTO rotation (id, last_category_index) VALUES (1, -1)")

    # Insert initial mock categories from PreExam
    initial_categories = [
        "ความรู้พื้นฐานในการปฏิบัติราชการ",
        "วิชาความสามารถในการศึกษา วิเคราะห์ และสรุปเหตุผล",
        "ภาษาอังกฤษ",
        "Mockup ท้องถิ่น ภาค ก",
        "Mockup ความรู้ทั่วไป"
    ]
    
    for cat in initial_categories:
        cursor.execute("INSERT OR IGNORE INTO categories (name) VALUES (?)", (cat,))

    conn.commit()
    conn.close()
    print(f"Database initialized successfully at {DB_PATH}")

if __name__ == "__main__":
    init_db()
