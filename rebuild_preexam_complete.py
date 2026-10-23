import os, sys, pymupdf, re, sqlite3, json, subprocess

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'D:\DEV\PreExam')
from pipeline_core import clean_page_artifacts, find_pdf, evaluate_condition_answer, clean_thai
from test_older_years import split_exam_sections
from rebuild_helpers import parse_questions_comprehensive, determine_catalogs

def parse_sols_perfect(sec_sol_text, year, set_name, cat):
    lines = sec_sol_text.split('\n')
    current_s = None
    current_lines = []
    sols = {}
    
    for l in lines:
        stripped = l.strip()
        m = re.match(r'^(\d+)[\.\)]\s*(.*)', stripped)
        if m:
            num = int(m.group(1))
            has_keyword = bool(re.search(r'(?:ตอบ|ข้อสรุปที่|แผนภาพ|กรณี|สามารถ|คำแปล|จง)', stripped))
            is_next = False
            
            # In English, choice translations e.g. '2. What do you do ?' do not have 'ตอบ'
            if cat == 'ภาษาอังกฤษ' and num in [2, 3, 4] and not has_keyword:
                is_next = False
            elif current_s is None:
                if num in [1, 2, 3]: is_next = True
            else:
                if num == current_s + 1:
                    is_next = True
                elif num > current_s and (has_keyword or num <= current_s + 3):
                    is_next = True
                elif num < current_s and current_s in [48, 49] and num == 40:
                    num = 50
                    is_next = True
                    
            if is_next:
                if current_s is not None:
                    sols[current_s] = '\n'.join(current_lines).strip()
                current_s = num
                current_lines = [l]
            else:
                if current_s is not None: current_lines.append(l)
        else:
            if current_s is not None: current_lines.append(l)
    if current_s is not None:
        sols[current_s] = '\n'.join(current_lines).strip()
        
    # Source corrections where the original book misnumbered or omitted a solution:
    if year == '2559' and set_name == 'Paper' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if 26 in sols and 25 not in sols:
            sols[25] = sols[26]
    if year == '2565' and set_name == 'Paper' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if 69 in sols and 'การติดตั้งระบบไฟฟ้า' in sols[69]:
            p = sols[69].find('การติดตั้งระบบไฟฟ้า')
            p10 = sols[69].rfind('10. ตอบ', 0, p)
            if p10 != -1:
                sols[70] = '70. ตอบ' + sols[69][p10+7:].strip()
                sols[69] = sols[69][:p10].strip()
    if year == '2566' and set_name == 'e-Exam3' and cat == 'ความสามารถในการคิดวิเคราะห์':
        sols[93] = """93. ตอบ 1) หมาสองราง : นกสองหัว\n\nคำอธิบาย: "เหยียบเรือสองแคม" และ "จับปลาสองมือ" หมายถึงการทำตัวเข้ากับทั้งสองฝ่ายเพื่อผลประโยชน์ เช่นเดียวกับ "หมาสองราง" และ "นกสองหัว" """
    if year == '2565' and set_name == 'e-Exam2' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if 53 in sols:
            sols[53] = '53. ตอบ 1)\n\n' + sols[53]
            
    return sols

def resolve_ans_perfect(s_body, choices):
    if not s_body: return ""
    ans_m = re.search(r"ตอบ\s*([1-4])\)?", s_body)
    if ans_m: return ans_m.group(1)
    
    m2 = re.search(r"(?:^|\n)\s*\d+[\.\)]\s*(?:ตอบ\s*)?([1-4])\)", s_body)
    if m2: return m2.group(1)
    
    if "ข้อสรุปที่ 1" in s_body or "ข้อสรุปที่ 2" in s_body or "จริง" in s_body or "เท็จ" in s_body:
        eval_ans = evaluate_condition_answer(s_body)
        if eval_ans: return eval_ans
        
    if choices:
        m_ans = re.search(r"ตอบ\s*([^\n\r]+)", s_body)
        if m_ans:
            raw = m_ans.group(1).strip()
            for c_i, c in enumerate(choices, 1):
                c_clean = c.strip()
                if c_clean and (c_clean == raw or raw.startswith(c_clean) or c_clean in raw or raw in c_clean):
                    return str(c_i)
                    
    m_val = re.search(r"ตอบ\s*([^\n\r]+)", s_body)
    if m_val:
        v = m_val.group(1).strip()
        v = re.split(r"[\(]", v)[0].strip()
        if v: return v
        
    lines = s_body.strip().split("\n")
    if lines:
        first = lines[0]
        m_first = re.search(r"^\d+[\.\)]\s*(?:ตอบ\s*)?([^\n\r]+)", first)
        if m_first:
            v = m_first.group(1).strip()
            v = re.split(r"[\(]", v)[0].strip()
            if v: return v
            
    return ""

def get_skill(cat):
    if cat == "ความสามารถในการคิดวิเคราะห์":
        return "ความสามารถทั่วไป"
    elif cat == "ภาษาอังกฤษ":
        return "ภาษาอังกฤษ"
    else:
        return "กฎหมาย"

conn = sqlite3.connect(r"D:\DEV\PreExam\clean_questions.db")
cur = conn.cursor()

# Ensure clean_questions.db schema has all columns
columns_to_add = [
    ("subject", "TEXT"),
    ("difficulty", "INTEGER DEFAULT 0"),
    ("catalogs", "TEXT"),
    ("skill", "TEXT"),
    ("is_custom", "INTEGER DEFAULT 0")
]
for col_name, col_type in columns_to_add:
    try:
        cur.execute(f"ALTER TABLE Questions ADD COLUMN {col_name} {col_type};")
    except Exception:
        pass
conn.commit()

all_sets = [
    ("2559", "2559", "Paper"),
    ("2560", "2560", "Paper"),
    ("2561", "2561", "Paper"),
    ("2562", "2562", "Paper"),
    ("2563", "2563", "Paper"),
    ("2564 Paper", "2564", "Paper"),
    ("2564 e-Exam", "2564", "e-Exam"),
    ("2565 Paper", "2565", "Paper"),
    ("2565 e-Exam1", "2565", "e-Exam1"),
    ("2565 e-Exam2", "2565", "e-Exam2"),
    ("2566 Paper", "2566", "Paper"),
    ("2566 e-Exam1", "2566", "e-Exam1"),
    ("2566 e-Exam2", "2566", "e-Exam2"),
    ("2566 e-Exam3", "2566", "e-Exam3"),
    ("2566 รอบพิเศษ", "2566", "รอบพิเศษ"),
    ("2567 Paper", "2567", "Paper"),
    ("2567 e-Exam1", "2567", "e-Exam1"),
    ("2567 e-Exam2", "2567", "e-Exam2"),
    ("2567 e-Exam3", "2567", "e-Exam3"),
    ("2567 รอบพิเศษ", "2567", "รอบพิเศษ")
]

all_processed_questions = []

print("Starting Complete Rebuild for years 2559 - 2567...")

for kw, year, name in all_sets:
    p_q = find_pdf(kw, is_sol=False)
    p_s = find_pdf(kw, is_sol=True)
    if not p_q or not p_s:
        print(f"Warning: Could not find PDFs for {year} {name}")
        continue
        
    raw_q = clean_page_artifacts('\n'.join([p.get_text() for p in pymupdf.open(p_q)]))
    raw_s = clean_page_artifacts('\n'.join([p.get_text() for p in pymupdf.open(p_s)]))
    
    sec_q = split_exam_sections(raw_q)
    sec_s = split_exam_sections(raw_s)
    
    set_questions = []
    
    for sec_idx, (sec_q_text, sec_cat) in enumerate(sec_q):
        sec_s_text = sec_s[sec_idx][0] if sec_idx < len(sec_s) else ""
        sols_raw = parse_sols_perfect(sec_s_text, year, name, sec_cat)
        raw_q_blocks, contexts_by_q = parse_questions_comprehensive(sec_q_text)
        
        active_ctx = ""
        ctx_range = None
        
        # Check initial context before Q1
        if 1 in contexts_by_q:
            ctx1 = contexts_by_q[1]
            ctx_clean = re.sub(r"^(?:วิชา)?(?:ภาษาอังกฤษ|ความสามารถในการคิดวิเคราะห์|ความรู้และลักษณะการเป็นข้าราชการที่ดี)\s*", "", ctx1).strip()
            if ctx_clean:
                active_ctx = ctx_clean
                m_rng = re.search(r"(?:ตอบคำถามข้อ|ข้อ)\s*(\d+)\s*[-–]\s*(\d+)", ctx_clean)
                if m_rng:
                    ctx_range = (int(m_rng.group(1)), int(m_rng.group(2)))
                    
        for num in sorted(raw_q_blocks.keys()):
            block = raw_q_blocks[num]
            if num in contexts_by_q:
                ctx = contexts_by_q[num]
                active_ctx = ctx.strip()
                m_rng = re.search(r"(?:ตอบคำถามข้อ|ข้อ)\s*(\d+)\s*[-–]\s*(\d+)", active_ctx)
                if m_rng:
                    ctx_range = (int(m_rng.group(1)), int(m_rng.group(2)))
                else:
                    ctx_range = None
            elif ctx_range:
                if not (ctx_range[0] <= num <= ctx_range[1]):
                    active_ctx = ""
                    ctx_range = None
                    
            block = re.sub(rf"^{num}[\.\)](?!\d)\s*", "", block).strip()
            
            choices = []
            q_question = block
            
            if "ข้อสรุปที่ 1" in block or "ข้อสรุปที่ 2" in block:
                choices = [
                    "ข้อสรุปทั้งสองเป็นจริง",
                    "ข้อสรุปทั้งสองไม่เป็นจริง",
                    "ข้อสรุปทั้งสองไม่สามารถสรุปได้แน่ชัด",
                    "ข้อสรุปทั้งสองมีผลต่างกัน"
                ]
                c_m = list(re.finditer(r"(?:^|\n|\s{2,})([1-4])\.(?!\d)\s*", block))
                if len(c_m) >= 4:
                    first_c = c_m[0].start()
                    if "ข้อสรุปทั้งสอง" in block[first_c:]:
                        q_question = block[:first_c].strip()
            else:
                c_m = list(re.finditer(r"(?:^|\n|\s{2,})([1-4])\.(?!\d)\s*", block))
                if len(c_m) >= 4:
                    first_c = c_m[0].start()
                    q_question = block[:first_c].strip()
                    c_text = block[first_c:]
                    c_parts = re.split(r"(?:^|\n|\s{2,})[1-4]\.(?!\d)\s*", c_text)
                    choices = [clean_thai(c.strip()) for c in c_parts if c.strip()][:4]
                    
            clean_q = re.sub(r"^ข้อ(?:ที่)?\s*\d+[\.\s:]*", "", q_question).strip()
            clean_q = clean_thai(clean_q)
            
            # If question text is empty (like in English conversation blanks where only choices exist):
            if not clean_q:
                if active_ctx:
                    clean_q = f"{clean_thai(active_ctx)}\n\nจงเลือกคำตอบที่เหมาะสมสำหรับช่องว่าง ({num})"
                else:
                    clean_q = f"คำถามข้อที่ {num}"
            else:
                if active_ctx and (ctx_range and ctx_range[0] <= num <= ctx_range[1] or any(w in clean_q for w in ["ข้อสรุปที่", "จากบทความ", "จากข้อมูล", "จากเงื่อนไข", "Passage", "Letter", "Conversation", "Situation"]) or f"({num})" in active_ctx):
                    clean_q = f"{clean_thai(active_ctx)}\n\n{clean_q}".strip()
                    
            s_body = sols_raw.get(num, "")
            ans = resolve_ans_perfect(s_body, choices)
            exp = clean_thai(s_body)
            
            # Determine metadata columns
            subject_val = "กพ ภาค ก"
            difficulty_val = 0
            skill_val = get_skill(sec_cat)
            catalogs_val = determine_catalogs(sec_cat, clean_q, exp)
            
            set_questions.append({
                "num": num,
                "category": sec_cat,
                "question_text": clean_q,
                "choices": choices,
                "correct_answer": ans,
                "explanation": exp,
                "subject": subject_val,
                "difficulty": difficulty_val,
                "skill": skill_val,
                "catalogs": catalogs_val,
                "year": year,
                "set_name": name
            })
            
    # Update SQLite for this set
    cur.execute("DELETE FROM Questions WHERE exam_year = ? AND exam_set = ?", (year, name))
    for idx, q in enumerate(set_questions, 1):
        q_id = f"{year}_{name}_{idx:03d}"
        q["id"] = q_id
        cur.execute("""
        INSERT INTO Questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, skill, catalogs, exam_year, exam_set, is_custom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        """, (
            q_id,
            q["question_text"],
            json.dumps(q["choices"], ensure_ascii=False),
            q["correct_answer"],
            q["explanation"],
            q["category"],
            q["subject"],
            q["difficulty"],
            q["skill"],
            q["catalogs"],
            year,
            name
        ))
    conn.commit()
    
    # Write Markdown file
    md_filename = f"{year}_{name}.md"
    md_path = os.path.join(r"D:\DEV\PreExam\exam_md", md_filename)
    with open(md_path, "w", encoding="utf-8") as out:
        out.write(f"# ข้อสอบจริง ก.พ. ปี {year} ชุด {name}\n\n")
        out.write(f"- **ปีการสอบ:** {year}\n")
        out.write(f"- **ชุดข้อสอบ:** {name}\n")
        out.write(f"- **วิชา (Subject):** {set_questions[0]['subject'] if set_questions else 'กพ ภาค ก'}\n")
        out.write(f"- **จำนวนข้อรวม:** {len(set_questions)} ข้อ\n\n")
        out.write("---\n\n")
        
        for idx, q in enumerate(set_questions, 1):
            out.write(f"### ข้อที่ {idx} (ลำดับในต้นฉบับ: ข้อ {q['num']})\n")
            out.write(f"- **หมวดวิชา:** `{q['category']}` | **Skill:** `{q['skill']}` | **Catalogs:** `{q['catalogs']}`\n")
            out.write(f"- **คำถาม:**\n\n```text\n{q['question_text']}\n```\n\n")
            out.write("- **ตัวเลือก:**\n")
            if q['choices']:
                for c_i, c in enumerate(q['choices']):
                    out.write(f"  {c_i+1}. {c}\n")
            else:
                out.write("  (ไม่มีตัวเลือก / เติมคำตอบ)\n")
            out.write(f"\n- **คำตอบที่ถูกต้อง:** `{q['correct_answer']}`\n")
            out.write(f"- **คำอธิบาย:**\n\n{q['explanation']}\n\n")
            out.write("---\n\n")
            
    # Write SQL import file for this set
    sql_filename = f"import_{year}_{name}.sql"
    sql_path = os.path.join(r"D:\DEV\PreExam\worker", sql_filename)
    with open(sql_path, "w", encoding="utf-8") as out:
        out.write(f"DELETE FROM Questions WHERE exam_year = '{year}' AND exam_set = '{name}';\n\n")
        for q in set_questions:
            q_id = q["id"]
            q_text_esc = q["question_text"].replace("'", "''")
            choices_esc = json.dumps(q["choices"], ensure_ascii=False).replace("'", "''")
            ans_esc = (q["correct_answer"] or '').replace("'", "''")
            exp_esc = (q["explanation"] or '').replace("'", "''")
            cat_esc = q["category"].replace("'", "''")
            subj_esc = q["subject"].replace("'", "''")
            skill_esc = q["skill"].replace("'", "''")
            catlog_esc = q["catalogs"].replace("'", "''")
            
            out.write(f"INSERT INTO Questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, skill, catalogs, exam_year, exam_set, is_custom) VALUES ('{q_id}', '{q_text_esc}', '{choices_esc}', '{ans_esc}', '{exp_esc}', '{cat_esc}', '{subj_esc}', {q['difficulty']}, '{skill_esc}', '{catlog_esc}', '{year}', '{name}', 0);\n")
            
    all_processed_questions.extend(set_questions)
    print(f"Set {year} {name}: Processed {len(set_questions)} questions (SQL saved to {sql_filename})")

conn.close()

print(f"\nRebuild complete! Total clean questions processed: {len(all_processed_questions)}")
print("Writing combined SQL for Cloudflare D1 sync...")

# Write combined SQL for quick batch uploading
batch_sql_path = os.path.join(r"D:\DEV\PreExam\worker", "import_all_2559_2567_clean.sql")
with open(batch_sql_path, "w", encoding="utf-8") as out:
    out.write("DELETE FROM Questions WHERE (exam_year NOT IN ('2568', '2569') OR exam_year IS NULL);\n\n")
    for q in all_processed_questions:
        q_id = q["id"]
        q_text_esc = q["question_text"].replace("'", "''")
        choices_esc = json.dumps(q["choices"], ensure_ascii=False).replace("'", "''")
        ans_esc = (q["correct_answer"] or '').replace("'", "''")
        exp_esc = (q["explanation"] or '').replace("'", "''")
        cat_esc = q["category"].replace("'", "''")
        subj_esc = q["subject"].replace("'", "''")
        skill_esc = q["skill"].replace("'", "''")
        catlog_esc = q["catalogs"].replace("'", "''")
        out.write(f"INSERT INTO Questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, skill, catalogs, exam_year, exam_set, is_custom) VALUES ('{q_id}', '{q_text_esc}', '{choices_esc}', '{ans_esc}', '{exp_esc}', '{cat_esc}', '{subj_esc}', {q['difficulty']}, '{skill_esc}', '{catlog_esc}', '{q['year']}', '{q['set_name']}', 0);\n")

print(f"Combined SQL written to {batch_sql_path} ({os.path.getsize(batch_sql_path):,} bytes)")
