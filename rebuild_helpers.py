import os, sys, pymupdf, re, sqlite3, json

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'D:\DEV\PreExam')
from pipeline_core import clean_page_artifacts, find_pdf, evaluate_condition_answer, clean_thai
from test_older_years import split_exam_sections

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
        if "::" in text or "อุปมาอุปไมย" in text:
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

def parse_sols_comprehensive(sec_sol_text):
    lines = sec_sol_text.split('\n')
    current_s = None
    current_lines = []
    sols = {}
    
    for l in lines:
        stripped = l.strip()
        m = re.match(r'^(\d+)[\.\)]\s*(.*)', stripped)
        if m:
            num = int(m.group(1))
            is_next = False
            if current_s is None:
                if num in [1, 2, 3]: is_next = True
            else:
                # Normal sequential step or jump
                if num > current_s and (num == current_s + 1 or num <= current_s + 4):
                    is_next = True
                elif num > current_s and any(w in stripped for w in ['ตอบ', 'ข้อสรุปที่', 'แผนภาพ', 'กรณี', 'สามารถ', 'จากโจทย์', 'คำแปล', '1)', '2)', '3)', '4)']):
                    is_next = True
                elif num < current_s and current_s in [48, 49] and num in [40, 50]:
                    # Typo in source where 50 is typed as 40
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
    return sols

def parse_questions_comprehensive(sec_text):
    lines = sec_text.split('\n')
    raw_q_blocks = {}
    contexts_by_q = {}
    gap_lines = []
    
    current_q = None
    current_lines = []
    choices_seen = 0
    in_gap = False
    
    for l in lines:
        stripped = l.strip()
        m = re.match(r'^(\d+)[\.\)](?!\d)\s*(.*)', stripped)
        
        is_context_start = False
        if choices_seen >= 4 or current_q is None:
            if re.search(r'(?:จงอ่าน|อ่านบทความ|จากบทความ|จากเงื่อนไข|จากข้อมูลในตาราง|จากตาราง|คำชี้แจง|Directions|Read the following|Situation|Conversation)', stripped, re.I):
                is_context_start = True
            elif re.search(r'____\(\d+\)____|\.\s*\.\s*\(\d+\)\s*\.\s*\.', stripped):
                is_context_start = True
            elif re.match(r'^[A-Z][a-zA-Z\s]{1,15}\s*:', stripped):
                is_context_start = True
                
        if is_context_start:
            in_gap = True
            
        if in_gap and not m:
            gap_lines.append(l)
            continue
            
        if m:
            num = int(m.group(1))
            
            # Handle typo where 50 was typed as 40 in 2566 Paper
            if current_q == 49 and num == 40:
                num = 50
                
            is_new_q = False
            is_choice = False
            
            if current_q is None:
                if num in [1, 2]:
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
                
    if current_q is not None:
        raw_q_blocks[current_q] = '\n'.join(current_lines).strip()
        
    return raw_q_blocks, contexts_by_q
