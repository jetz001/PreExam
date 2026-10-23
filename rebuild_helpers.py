import os, sys, pymupdf, re, sqlite3, json

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'D:\DEV\PreExam')
from pipeline_core import clean_page_artifacts, find_pdf, evaluate_condition_answer, clean_thai
from test_older_years import split_exam_sections

def is_header_line(line):
    s = line.strip()
    if not s: return False
    if re.search(r"^\s*(?:ข้อสอบ\s*(?:ภาค\s*[ก-ฮ]\s*)?ก\.?พ\.?|แบบทดสอบ|วิชา)", s):
        return True
    if re.search(r"^\s*-\s*Exam", s):
        return True
    if re.match(r"^(?:วิชา)?(?:ความสามารถในการคิดวิเคราะห์|ภาษาอังกฤษ|ความรู้และลักษณะการเป็นข้าราชการที่ดี)\s*$", s):
        return True
    if re.search(r"GO!\s*ราชการ\s*สงวนลิขสิทธิ์", s):
        return True
    return False

def is_context_start_line(line):
    s = line.strip()
    if not s: return False
    if re.search(r"^(?:จากเงื่อนไข|จากข้อมูลในตาราง|จากตาราง|หลักในการทำคำตอบ|คำชี้แจง|Directions|Situation|Conversation|จงอ่านบทความ|อ่านบทความ|จากบทความต่อไปนี้)", s, re.I):
        return True
    if re.search(r"(?:ตอบคำถามข้อ|ข้อ)\s*\d+\s*[-–]\s*\d+", s):
        return True
    return False

def parse_sadam_section(lines, start_idx):
    questions = {}
    i = start_idx
    while i < len(lines):
        line = lines[i].strip()
        m = re.match(r'^(\d+)\s*$', line)
        if m:
            q_num = int(m.group(1))
            tokens = []
            j = i + 1
            while j < len(lines):
                next_l = lines[j].strip()
                if not next_l or is_header_line(next_l):
                    j += 1
                    continue
                if re.match(r'^\d+[\.\)]', next_l) or (re.match(r'^\d+\s*$', next_l) and len(tokens) >= 2):
                    break
                tokens.append(next_l)
                j += 1
            
            col_a = tokens[0] if len(tokens) > 0 else "-"
            col_b = tokens[1] if len(tokens) > 1 else "-"
            col_c = ' '.join(tokens[2:]) if len(tokens) > 2 else "-"
            
            q_text = f"คำชี้แจง: ให้เปรียบเทียบค่าระหว่าง สดมภ์ ก, สดมภ์ ข และ สดมภ์ ค\n\nสดมภ์ ก: {col_a}\nสดมภ์ ข: {col_b}\nสดมภ์ ค (เงื่อนไข): {col_c}"
            questions[q_num] = q_text
            i = j
        else:
            i += 1
            
    return questions

def determine_catalogs(cat, q_text, exp_text):
    text = (q_text + " " + exp_text).lower()
    
    if cat == "ภาษาอังกฤษ":
        if any(w in text for w in ["conversation", "situation", "appointment", "dialogue", "greeting", "a :", "b :", "mr.", "receptionist", "hotel", "cafeteria"]):
            return json.dumps(["บทสนทนา"], ensure_ascii=False)
        elif any(w in text for w in ["passage", "reading", "letter", "article", "paragraph", "author", "according to"]):
            return json.dumps(["Reading"], ensure_ascii=False)
        elif any(w in text for w in ["meaning", "synonym", "antonym", "definition", "closest in meaning", "vocabulary"]):
            return json.dumps(["Vocabulary"], ensure_ascii=False)
        else:
            return json.dumps(["Grammar"], ensure_ascii=False)
            
    elif cat == "ความรู้และลักษณะการเป็นข้าราชการที่ดี":
        if any(w in text for w in ["ระเบียบบริหารราชการแผ่นดิน", "นายกรัฐมนตรี", "กระทรวง", "ทบวง", "กรม", "จังหวัด", "อำเภอ", "ผู้ว่าราชการ", "ก.พ.ร."]):
            return json.dumps(["พ.ร.บ.ระเบียบบริหารราชการแผ่นดิน"], ensure_ascii=False)
        elif any(w in text for w in ["บ้านเมืองที่ดี", "กิจการบ้านเมืองที่ดี", "ประโยชน์สุข", "สัมฤทธิผล", "ลดขั้นตอน", "คุ้มค่า", "ก.พ.ร."]):
            return json.dumps(["พ.ร.ฎ.การบริหารกิจการบ้านเมืองที่ดี"], ensure_ascii=False)
        elif any(w in text for w in ["วิธีปฏิบัติราชการทางปกครอง", "คำสั่งทางปกครอง", "เจ้าหน้าที่", "เพิกถอน", "อุทธรณ์"]):
            return json.dumps(["พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง"], ensure_ascii=False)
        elif any(w in text for w in ["ละเมิด", "ความรับผิดทางละเมิด", "เจ้าหน้าที่ปฏิบัติหน้าที่", "ชดใช้ค่าสินไหม", "จงใจหรือประมาทเลินเล่ออย่างร้ายแรง"]):
            return json.dumps(["พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่"], ensure_ascii=False)
        elif any(w in text for w in ["มาตรฐานทางจริยธรรม", "องค์กรกลางทางจริยธรรม", "ประมวลจริยธรรม", "ก.ม.จ."]):
            return json.dumps(["พ.ร.บ.มาตรฐานทางจริยธรรม"], ensure_ascii=False)
        elif any(w in text for w in ["อาญา", "ความผิดต่อตำแหน่งหน้าที่", "สินบน", "ทุจริต", "มาตรา 147", "มาตรา 148", "มาตรา 149", "มาตรา 157"]):
            return json.dumps(["กฎหมายอาญา (ความผิดต่อตำแหน่งหน้าที่)"], ensure_ascii=False)
        else:
            return json.dumps(["กฎหมายข้าราชการที่ดี"], ensure_ascii=False)
            
    else: # ความสามารถในการคิดวิเคราะห์
        if "สดมภ์" in text:
            return json.dumps(["คณิตศาสตร์ทั่วไป", "สดมภ์"], ensure_ascii=False)
        elif "::" in text or "อุปมาอุปไมย" in text:
            return json.dumps(["อุปมาอุปไมย"], ensure_ascii=False)
        elif "ข้อสรุปที่ 1" in text or "ข้อสรุปที่ 2" in text or "<" in text or ">" in text or "≤" in text or "≥" in text:
            if any(w in text for w in ["ฝ่ายการตลาด", "คน", "บ้าน", "นาย", "เพื่อน", "ทำงาน", "แพทย์", "โรงพยาบาล", "ห้อง"]):
                return json.dumps(["เงื่อนไขภาษา"], ensure_ascii=False)
            else:
                return json.dumps(["เงื่อนไขสัญลักษณ์"], ensure_ascii=False)
        elif any(w in text for w in ["ตาราง", "ข้อมูลในตาราง", "ร้อยละ", "อัตราการเติบโต", "มูลค่าการส่งออก"]):
            return json.dumps(["ตาราง"], ensure_ascii=False)
        elif any(w in text for w in ["ข้อความใดอยู่ในลำดับที่", "เรียงลำดับข้อความ", "เรียงประโยค"]):
            return json.dumps(["ภาษาไทย", "เรียงประโยค"], ensure_ascii=False)
        elif any(w in text for w in ["บทความ", "สาระสำคัญ", "ใจความสำคัญ", "ข้อใดสอดคล้อง", "ข้อความข้างต้น", "ผู้เขียน"]):
            return json.dumps(["ภาษาไทย", "บทความ"], ensure_ascii=False)
        elif "*" in text or "โอเปอเรชัน" in text or "operate" in text:
            return json.dumps(["คณิตศาสตร์ทั่วไป", "โอเปอเรชัน"], ensure_ascii=False)
        elif re.search(r"\b(?:\d+\s+){3,}\.?\.?\.?", text):
            return json.dumps(["คณิตศาสตร์ทั่วไป", "อนุกรม"], ensure_ascii=False)
        else:
            return json.dumps(["คณิตศาสตร์ทั่วไป"], ensure_ascii=False)

def parse_questions_comprehensive(sec_text):
    lines = sec_text.split('\n')
    raw_q_blocks = {}
    contexts_by_q = {}
    gap_lines = []
    
    current_q = None
    current_lines = []
    in_gap = False
    choices_seen = 0
    
    i = 0
    while i < len(lines):
        l = lines[i]
        stripped = l.strip()
        
        if is_header_line(stripped):
            i += 1
            continue
            
        # Check for สดมภ์ table section
        if "สดมภ์ ก" in stripped and "สดมภ์ ข" in stripped:
            if current_q is not None:
                raw_q_blocks[current_q] = '\n'.join(current_lines).strip()
                current_q = None
                current_lines = []
                choices_seen = 0
            
            sadam_qs = parse_sadam_section(lines, i)
            for sq_num, sq_text in sadam_qs.items():
                raw_q_blocks[sq_num] = sq_text
            
            j = i + 1
            while j < len(lines):
                if re.match(r'^\d+[\.\)](?!\d)\s*', lines[j].strip()):
                    break
                j += 1
            i = j
            continue
            
        if is_context_start_line(stripped):
            if current_q is not None:
                raw_q_blocks[current_q] = '\n'.join(current_lines).strip()
                current_q = None
                current_lines = []
                choices_seen = 0
            in_gap = True
            
        m = re.match(r'^(\d+)[\.\)](?!\d)\s*(.*)', stripped)
        
        if in_gap and not m:
            gap_lines.append(l)
            i += 1
            continue
            
        if m:
            num = int(m.group(1))
            
            # Typo correction: 50 typed as 40
            if current_q == 49 and num == 40:
                num = 50
                
            is_new_q = False
            is_choice = False
            
            if current_q is None:
                is_new_q = True
            elif current_q in [1, 2, 3, 4]:
                if choices_seen == 0:
                    if num == 1:
                        is_choice = True
                    elif num > current_q:
                        is_new_q = True
                else:
                    if num in [2, 3, 4] and choices_seen < 4:
                        is_choice = True
                    elif num == current_q + 1:
                        is_new_q = True
                    elif num >= 5:
                        is_new_q = True
            else:
                # current_q >= 5
                if num in [1, 2, 3, 4] and not in_gap:
                    if choices_seen < 4:
                        is_choice = True
                    else:
                        is_choice = False
                elif num > current_q:
                    is_new_q = True
                    
            if is_choice:
                choices_seen += 1
                current_lines.append(l)
            elif is_new_q:
                in_gap = False
                if current_q is not None:
                    raw_q_blocks[current_q] = '\n'.join(current_lines).strip()
                gap_text = '\n'.join(gap_lines).strip()
                if gap_text:
                    contexts_by_q[num] = gap_text
                gap_lines = []
                
                current_q = num
                current_lines = [l]
                choices_seen = 0
            else:
                if in_gap:
                    gap_lines.append(l)
                elif current_q is not None:
                    current_lines.append(l)
                else:
                    gap_lines.append(l)
        else:
            if in_gap:
                gap_lines.append(l)
            elif current_q is not None:
                current_lines.append(l)
            else:
                gap_lines.append(l)
        i += 1
                
    if current_q is not None:
        raw_q_blocks[current_q] = '\n'.join(current_lines).strip()
        
    return raw_q_blocks, contexts_by_q
