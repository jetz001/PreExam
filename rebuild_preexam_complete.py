import os, sys, pymupdf, re, sqlite3, json, subprocess

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, r'D:\DEV\PreExam')
from pipeline_core import clean_page_artifacts, find_pdf, evaluate_condition_answer, clean_thai
from test_older_years import split_exam_sections
from rebuild_helpers import parse_questions_comprehensive, determine_catalogs, is_header_line

TABLE_HTML_MAP = {
    ("2559", "Paper", (36, 38)): """จากข้อมูลในตาราง จงตอบคำถามข้อ 36 - 38

<p><strong>ข้อมูลปริมาณนักท่องเที่ยวที่เดินทางเข้าประเทศไทยผ่านท่าอากาศยานดอนเมือง ปี 2558-2559</strong></p>
<table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:0.92rem; border:1px solid rgba(255,255,255,0.3);">
  <thead>
    <tr style="background:rgba(255,255,255,0.18); border-bottom:2px solid rgba(255,255,255,0.4); text-align:center;">
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ลำดับ</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ประเทศ</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ปี 2558 (คน)</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ปี 2559 (คน)</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">อัตราเพิ่ม-ลด (%)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">1</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ไทย</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">307,626</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">256,050</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">-16.77</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">2</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ญี่ปุ่น</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">12,578</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">-2.73</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">3</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">มาเลเซีย</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">32,665</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">31,012</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">-5.06</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">4</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ฟิลิปปินส์</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">125,468</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">134,539</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">7.23</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">5</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">อเมริกา</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">11,253</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">13,020</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">15.70</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">6</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">แคนาดา</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">225,745</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">240,078</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">7</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">บรูไน</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">66,578</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">58,654</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">8</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">เวียดนาม</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">15,946</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">16,452</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td></tr>
    <tr style="text-align:center;"><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">9</td><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">สิงคโปร์</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">10,021</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">17.83</td></tr>
  </tbody>
</table>""",
    ("2559", "Paper", (39, 40)): """จากข้อมูลในตาราง จงตอบคำถามข้อ 39 - 40

<p><strong>ข้อมูลพื้นที่เพาะปลูกพืชชนิดต่างๆ ในแต่ละภาคของประเทศไทย ปี 2559</strong></p>
<table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:0.92rem; border:1px solid rgba(255,255,255,0.3);">
  <thead>
    <tr style="background:rgba(255,255,255,0.18); border-bottom:2px solid rgba(255,255,255,0.4); text-align:center;">
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ภาค</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ข้าว (ไร่)</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ข้าวโพด (ไร่)</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ยาสูบ (ไร่)</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ยางพารา (ไร่)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">เหนือ</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">33,478</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">40,553</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">36,421</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">18,475</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">กลาง</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">21,562</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">37,884</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">28,463</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">16,652</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ใต้</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">18,736</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">23,825</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">32,451</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">56,984</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ตะวันออก</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">11,237</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">17,426</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">21,552</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">28,152</td></tr>
  </tbody>
</table>""",
    ("2563", "Paper", (62, 65)): """จากข้อมูลในตารางต่อไปนี้ จงตอบคำถามข้อ 62 - 65

<p><strong>ตารางข้อมูลพื้นที่ จำนวนประชากร และความหนาแน่นในแต่ละภาค</strong></p>
<table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:0.92rem; border:1px solid rgba(255,255,255,0.3);">
  <thead>
    <tr style="background:rgba(255,255,255,0.18); border-bottom:2px solid rgba(255,255,255,0.4); text-align:center;">
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ภาค</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">พื้นที่ (ตารางกิโลเมตร)</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">จำนวนประชากร (คน)</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ความหนาแน่น (คน/ตารางกิโลเมตร)</th>
    </tr>
  </thead>
  <tbody>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ภาคเหนือ</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">93,690</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">6,341,973</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ภาคตะวันออกเฉียงเหนือ</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">168,854</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">22,240,574</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ภาคกลาง</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">91,799</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">20,085,971</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">219</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ภาคตะวันตก</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">53,769</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">3,381,719</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ภาคใต้</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">?</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">9,290,708</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">131</td></tr>
    <tr style="text-align:center; font-weight:bold; background:rgba(255,255,255,0.1);"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.2);">รวม</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.2);">?</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.2);">?</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.2);">?</td></tr>
  </tbody>
</table>""",
    ("2566", "Paper", (18, 22)): """จากข้อมูลในตารางต่อไปนี้ จงตอบคำถามข้อ 18 – 22

<p><strong>ตารางแสดงข้อมูลยอดขายถั่ว 5 ชนิด พ.ศ. 2560 – 2565 (ล้านบาท)</strong></p>
<table style="width:100%; border-collapse:collapse; margin:12px 0; font-size:0.92rem; border:1px solid rgba(255,255,255,0.3);">
  <thead>
    <tr style="background:rgba(255,255,255,0.18); border-bottom:2px solid rgba(255,255,255,0.4); text-align:center;">
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">ชนิดถั่ว</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">2560</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">2561</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">2562</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">2563</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">2564</th>
      <th style="padding:6px; border:1px solid rgba(255,255,255,0.2);">2565</th>
    </tr>
  </thead>
  <tbody>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ถั่วเขียว</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">21</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">-</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">13</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">16</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">12</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">20</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ถั่วรสไก่</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">14</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">24</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">18</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">9</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">-</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">18</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ถั่วรสกุ้ง</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">19</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">23</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">-</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">6</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">22</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">21</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ถั่วปากอ้า</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">12</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">16</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">16</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">8</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">24</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">14</td></tr>
    <tr style="text-align:center;"><td style="text-align:left; padding:5px 8px; border:1px solid rgba(255,255,255,0.15);">ถั่วเคลือบรสกะทิ</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">7</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">11</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">20</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">11</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">13</td><td style="padding:5px; border:1px solid rgba(255,255,255,0.15);">16</td></tr>
  </tbody>
</table>"""
}

def clean_and_format_question(text, active_ctx, year, set_name, q_num):
    # 1. Check table map
    for (t_year, t_set, (q_start, q_end)), html_table in TABLE_HTML_MAP.items():
        if year == t_year and set_name == t_set and q_start <= q_num <= q_end:
            active_ctx = html_table
            break

    # 2. Strip running page headers
    header_pat = r"^\s*(?:ข้อสอบ\s*(?:ภาค\s*[ก-ฮ]\s*)?ก\.?พ\.?|แบบทดสอบ|วิชา)[^\n]*(?:\n\s*-\s*Exam[^\n]*)?\n*"
    text = re.sub(header_pat, "", text, flags=re.MULTILINE)
    text = re.sub(r"^(?:วิชา)?(?:ความสามารถในการคิดวิเคราะห์|ภาษาอังกฤษ|ความรู้และลักษณะการเป็นข้าราชการที่ดี)[^\n]*\n?", "", text, flags=re.MULTILINE)
    text = re.sub(r"GO!\s*ราชการ\s*สงวนลิขสิทธิ์[^\n]*\n?", "", text, flags=re.MULTILINE)

    if active_ctx:
        active_ctx = re.sub(header_pat, "", active_ctx, flags=re.MULTILINE)
        active_ctx = re.sub(r"^(?:วิชา)?(?:ความสามารถในการคิดวิเคราะห์|ภาษาอังกฤษ|ความรู้และลักษณะการเป็นข้าราชการที่ดี)[^\n]*\n?", "", active_ctx, flags=re.MULTILINE)
        active_ctx = re.sub(r"GO!\s*ราชการ\s*สงวนลิขสิทธิ์[^\n]*\n?", "", active_ctx, flags=re.MULTILINE)

    # 3. Strip redundant question numbers
    text = re.sub(r"^ข้อ(?:ที่)?\s*\d+[\.\s:]*", "", text).strip()

    # 4. Format math operations (e.g. 7 * 1 = 5 \n 9 * 1 = 7 \n 20 * 2 = ?)
    text = re.sub(r"(\d+\s*[\*xX]\s*\d+\s*=\s*(?:\d+|\?))\s*", r"\1\n", text)

    # 5. Format conditions with dashes: each '- ' on a new line
    if "-" in text:
        text = re.sub(r"(?<![A-Za-z0-9])\s*-\s+", r"\n- ", text)
    if active_ctx and "-" in active_ctx and "<table" not in active_ctx:
        active_ctx = re.sub(r"(?<![A-Za-z0-9])\s*-\s+", r"\n- ", active_ctx)

    # 6. Format conclusions
    text = re.sub(r"\s*(ข้อสรุปที่\s*1\s*[:\s]*)", r"\n\n\1", text)
    text = re.sub(r"\s*(ข้อสรุปที่\s*2\s*[:\s]*)", r"\n\1", text)

    # 7. Format English dialogue
    text = re.sub(r"\s*([A-Za-z]+(?:\s+[A-Za-z]+)?\s*:\s*)", r"\n\1", text)

    # 8. Prepend active context
    if active_ctx:
        clean_ctx_sub = active_ctx[:30].replace("\n", "").strip()
        if clean_ctx_sub not in text.replace("\n", ""):
            text = f"{active_ctx.strip()}\n\n{text.strip()}"

    # 9. Collapse multiple newlines
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return clean_thai(text)

def find_choices_ordered(block):
    p1 = re.search(r"(?:^|\n|\s{2,})1\.(?!\d)\s*", block)
    if not p1: return None, block
    p2 = re.search(r"(?:^|\n|\s{2,})2\.(?!\d)\s*", block[p1.end():])
    if not p2: return None, block
    p2_pos = p1.end() + p2.start()
    p3 = re.search(r"(?:^|\n|\s{2,})3\.(?!\d)\s*", block[p2_pos + p2.end() - p2.start():])
    if not p3: return None, block
    p3_pos = p2_pos + (p2.end() - p2.start()) + p3.start()
    p4 = re.search(r"(?:^|\n|\s{2,})4\.(?!\d)\s*", block[p3_pos + p3.end() - p3.start():])
    if not p4: return None, block
    p4_pos = p3_pos + (p3.end() - p3.start()) + p4.start()

    q_text = block[:p1.start()].strip()
    c1 = block[p1.end():p2_pos].strip()
    c2 = block[p2_pos + (p2.end() - p2.start()):p3_pos].strip()
    c3 = block[p3_pos + (p3.end() - p3.start()):p4_pos].strip()
    c4 = block[p4_pos + (p4.end() - p4.start()):].strip()
    
    # Strip running headers or next context that leaked into c4
    c4 = re.split(r"\n\s*(?:ข้อสอบ\s*ก\.พ\.|GO!\s*ราชการ|วิชา|หลักในการทำคำตอบ|จากเงื่อนไข)", c4)[0].strip()
    
    choices = [clean_thai(c.strip()) for c in [c1, c2, c3, c4]]
    return choices, q_text

def parse_sols_perfect(sec_sol_text, year, set_name, cat):
    lines = sec_sol_text.split('\n')
    current_s = None
    current_lines = []
    sols = {}
    
    for l in lines:
        stripped = l.strip()
        m = re.match(r'^(\d+)[\.\)]\s*(.*)', stripped)
        if not m and ('สดมภ์ ก' in sec_sol_text or cat == 'ความสามารถในการคิดวิเคราะห์'):
            m_sadam = re.match(r'^(\d+)\s*$', stripped)
            if m_sadam and (1 <= int(m_sadam.group(1)) <= 150):
                m = m_sadam

        if m:
            num = int(m.group(1))
            has_keyword = bool(re.search(r'(?:ตอบ|ข้อสรุปที่|แผนภาพ|กรณี|สามารถ|คำแปล|จง)', stripped))
            is_next = False
            
            if cat == 'ภาษาอังกฤษ' and num in [2, 3, 4] and not has_keyword:
                is_next = False
            elif current_s is None:
                if num in [1, 2, 3]: is_next = True
            else:
                if num == current_s + 1:
                    is_next = True
                elif num > current_s and (has_keyword or num <= current_s + 5):
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
        
    # Source corrections
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
    ans_m = re.search(r"ตอบ\s*([1-4])(?!\d)\)?", s_body)
    if ans_m: return ans_m.group(1)
    
    m2 = re.search(r"(?:^|\n)\s*\d+[\.\)]\s*(?:ตอบ\s*)?([1-4])(?!\d)\)", s_body)
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

# Ensure schema has all columns
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

print("Starting Complete Rebuild with formatting, table HTML, and real exam tags...")

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
            
            # 1. Sadam Questions
            if "สดมภ์ ก:" in block:
                choices = [
                    "ค่าในสดมภ์ ก มากกว่าค่าในสดมภ์ ข",
                    "ค่าในสดมภ์ ข มากกว่าค่าในสดมภ์ ก",
                    "ค่าในสดมภ์ ก เท่ากับค่าในสดมภ์ ข",
                    "ไม่สามารถสรุปได้แน่ชัด"
                ]
                q_question = block
            # 2. Condition Questions
            elif "ข้อสรุปที่ 1" in block or "ข้อสรุปที่ 2" in block:
                choices = [
                    "ข้อสรุปทั้งสองเป็นจริง",
                    "ข้อสรุปทั้งสองไม่เป็นจริง",
                    "ข้อสรุปทั้งสองไม่สามารถสรุปได้แน่ชัด",
                    "ข้อสรุปทั้งสองมีผลต่างกัน"
                ]
                # If choices were embedded in text
                extracted_c, stripped_q = find_choices_ordered(block)
                if extracted_c and "ข้อสรุปทั้งสอง" in extracted_c[0]:
                    q_question = stripped_q
            # 3. Standard 4-choice questions
            else:
                extracted_c, stripped_q = find_choices_ordered(block)
                if extracted_c:
                    choices = extracted_c
                    q_question = stripped_q

            # Format question text with line breaks & tables
            ctx_to_apply = active_ctx if (ctx_range and ctx_range[0] <= num <= ctx_range[1]) or (active_ctx and not ctx_range) else ""
            clean_q = clean_and_format_question(q_question, ctx_to_apply, year, name, num)
            
            if not clean_q:
                if ctx_to_apply:
                    clean_q = f"{clean_thai(ctx_to_apply)}\n\nจงเลือกคำตอบที่เหมาะสมสำหรับช่องว่าง ({num})"
                else:
                    clean_q = f"คำถามข้อที่ {num}"
                    
            s_body = sols_raw.get(num, "")
            ans = resolve_ans_perfect(s_body, choices)
            
            # Format explanation with "ข้อสอบจริง" attribution
            exam_real_tag = f"ข้อสอบจริง ก.พ. ปี {year} ชุด {name}"
            exp_clean = clean_thai(s_body).strip()
            if exp_clean:
                if "ข้อสอบจริง" not in exp_clean:
                    exp = f"{exam_real_tag}\n\n{exp_clean}"
                else:
                    exp = exp_clean
            else:
                exp = f"{exam_real_tag}\n\nเฉลย: {ans if ans else 'ดูคำอธิบายประกอบ'}"
            
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
        out.write(f"- **จำนวนข้อทั้งหมด:** {len(set_questions)} ข้อ\n\n---\n\n")
        for q in set_questions:
            out.write(f"### ข้อที่ {q['num']} ({q['id']})\n")
            out.write(f"- **หมวดวิชา:** {q['category']}\n")
            out.write(f"- **ทักษะ (Skill):** {q['skill']}\n")
            out.write(f"- **ป้ายกำกับ (Catalogs):** {q['catalogs']}\n\n")
            out.write(f"**โจทย์:**\n\n{q['question_text']}\n\n")
            if q['choices']:
                out.write("**ตัวเลือก:**\n")
                for c_i, c in enumerate(q['choices'], 1):
                    out.write(f"{c_i}. {c}\n")
                out.write("\n")
            out.write(f"**คำตอบที่ถูกต้อง:** {q['correct_answer']}\n\n")
            out.write(f"**คำอธิบาย / เฉลยละเอียด:**\n\n{q['explanation']}\n\n---\n\n")
            
    # Write standalone SQL file for this set
    sql_filename = f"import_{year}_{name}.sql"
    sql_path = os.path.join(r"D:\DEV\PreExam\worker", sql_filename)
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(f"-- Import for {year} {name}\n")
        f.write(f"DELETE FROM Questions WHERE exam_year = '{year}' AND exam_set = '{name}';\n")
        for q in set_questions:
            q_id = q["id"]
            q_text_escaped = q["question_text"].replace("'", "''")
            choices_json = json.dumps(q["choices"], ensure_ascii=False).replace("'", "''")
            ans = q["correct_answer"].replace("'", "''")
            exp_escaped = q["explanation"].replace("'", "''")
            cat = q["category"].replace("'", "''")
            subj = q["subject"].replace("'", "''")
            diff = q["difficulty"]
            skl = q["skill"].replace("'", "''")
            cats = q["catalogs"].replace("'", "''")
            yr = q["year"].replace("'", "''")
            sn = q["set_name"].replace("'", "''")
            
            sql = f"INSERT INTO Questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, skill, catalogs, exam_year, exam_set, is_custom) VALUES ('{q_id}', '{q_text_escaped}', '{choices_json}', '{ans}', '{exp_escaped}', '{cat}', '{subj}', {diff}, '{skl}', '{cats}', '{yr}', '{sn}', 0);\n"
            f.write(sql)
            
    print(f"Set {year} {name}: Processed {len(set_questions)} questions (SQL saved to {sql_filename})")
    all_processed_questions.extend(set_questions)

print(f"\nRebuild complete! Total clean questions processed: {len(all_processed_questions)}")

# Write combined SQL file
print("Writing combined SQL for Cloudflare D1 sync...")
combined_sql_path = r"D:\DEV\PreExam\worker\import_all_2559_2567_clean.sql"
with open(combined_sql_path, "w", encoding="utf-8") as f:
    f.write("-- Complete Clean Import for years 2559 - 2567\n")
    for y_val in ["2559", "2560", "2561", "2562", "2563", "2564", "2565", "2566", "2567"]:
        f.write(f"DELETE FROM Questions WHERE exam_year = '{y_val}';\n")
    for q in all_processed_questions:
        q_id = q["id"]
        q_text_escaped = q["question_text"].replace("'", "''")
        choices_json = json.dumps(q["choices"], ensure_ascii=False).replace("'", "''")
        ans = q["correct_answer"].replace("'", "''")
        exp_escaped = q["explanation"].replace("'", "''")
        cat = q["category"].replace("'", "''")
        subj = q["subject"].replace("'", "''")
        diff = q["difficulty"]
        skl = q["skill"].replace("'", "''")
        cats = q["catalogs"].replace("'", "''")
        yr = q["year"].replace("'", "''")
        sn = q["set_name"].replace("'", "''")
        
        sql = f"INSERT INTO Questions (id, question_text, choices, correct_answer, explanation, category, subject, difficulty, skill, catalogs, exam_year, exam_set, is_custom) VALUES ('{q_id}', '{q_text_escaped}', '{choices_json}', '{ans}', '{exp_escaped}', '{cat}', '{subj}', {diff}, '{skl}', '{cats}', '{yr}', '{sn}', 0);\n"
        f.write(sql)

print(f"Combined SQL written to {combined_sql_path} ({os.path.getsize(combined_sql_path):,} bytes)")
