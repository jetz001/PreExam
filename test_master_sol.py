import sys, os, pymupdf, re
sys.path.insert(0, r'D:\DEV\PreExam')
from test_full_pipeline import all_sets
from pipeline_core import clean_page_artifacts, find_pdf, clean_thai
from test_older_years import split_exam_sections
from rebuild_helpers import parse_questions_comprehensive

def parse_sols_master(sec_sol_text, year, set_name, cat):
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
        
    # Set-specific patches
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
        sols[93] = '93. ตอบ 1) หมาสองราง : นกสองหัว\n\nคำอธิบาย: เหยียบเรือสองแคม และ จับปลาสองมือ หมายถึงการทำตัวเข้ากับทั้งสองฝ่ายเพื่อผลประโยชน์ เช่นเดียวกับ หมาสองราง และ นกสองหัว'
    if year == '2565' and set_name == 'e-Exam2' and cat == 'ความสามารถในการคิดวิเคราะห์':
        if 53 in sols:
            sols[53] = '53. ตอบ 1)\n\n' + sols[53]
            
    return sols

total_missing = 0
for kw, year, name in all_sets:
    p_q = find_pdf(kw, is_sol=False)
    p_s = find_pdf(kw, is_sol=True)
    if not p_q or not p_s: continue
    
    raw_q = clean_page_artifacts('\n'.join([p.get_text() for p in pymupdf.open(p_q)]))
    raw_s = clean_page_artifacts('\n'.join([p.get_text() for p in pymupdf.open(p_s)]))
    
    sec_q = split_exam_sections(raw_q)
    sec_s = split_exam_sections(raw_s)
    
    for sec_idx, (sec_q_text, sec_cat) in enumerate(sec_q):
        sec_s_text = sec_s[sec_idx][0] if sec_idx < len(sec_s) else ''
        sols = parse_sols_master(sec_s_text, year, name, sec_cat)
        qb, _ = parse_questions_comprehensive(sec_q_text)
        
        diff = set(qb.keys()) - set(sols.keys())
        if diff:
            total_missing += len(diff)
            print(f'{year} {name} {sec_cat}: missing sols for Qs: {diff}')

print('TOTAL MISSING QUESTIONS IN SOLS:', total_missing)
