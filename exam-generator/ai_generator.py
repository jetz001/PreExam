import json
import re
from pydantic import BaseModel, Field
from typing import Optional
from config import config
from google import genai
from google.genai import types

class ExamQuestion(BaseModel):
    question_text: str = Field(description="โจทย์ข้อสอบ...")
    option_a: str = Field(description="ตัวเลือก A")
    option_b: str = Field(description="ตัวเลือก B")
    option_c: str = Field(description="ตัวเลือก C")
    option_d: str = Field(description="ตัวเลือก D")
    correct_answer: str = Field(description="Option A, Option B, Option C หรือ Option D (ระบุให้เป๊ะ)")
    subject: str = Field(description="หมวดหมู่วิชาหลัก (เช่น ท้องถิ่น ภาค ก, ท้องถิ่น ภาค ข)")
    skill: str = Field(description="ทักษะที่ใช้วัดผล (เช่น อังกฤษ, ความรู้ทั่วไป, กฎหมาย, บัญชี)")
    catalogs: str = Field(description="แท็กรายวิชา (เช่น ภาษาอังกฤษ, ความรู้พื้นฐานในการปฏิบัติราชการ)")
    explanation: str = Field(description="คำอธิบายเฉลยอย่างละเอียด...")

def fix_correct_answer(answer: str) -> str:
    """Auto-fix the correct_answer field if the AI outputs shorter formats."""
    ans = answer.strip().upper()
    if ans in ['A', 'OPTION A', 'OPTION_A', '(A)', '1']:
        return "Option A"
    elif ans in ['B', 'OPTION B', 'OPTION_B', '(B)', '2']:
        return "Option B"
    elif ans in ['C', 'OPTION C', 'OPTION_C', '(C)', '3']:
        return "Option C"
    elif ans in ['D', 'OPTION D', 'OPTION_D', '(D)', '4']:
        return "Option D"
    
    match = re.search(r'OPTION\s*[A-D]', ans)
    if match:
        return match.group(0).title()
        
    return answer.title()

def generate_exam_question(category_name: str, previous_questions: str) -> dict:
    """Calls Gemini API to parse the ExamQuestion format."""
    if not config.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in .env")
        
    client = genai.Client(api_key=config.GEMINI_API_KEY)
    
    prompt = f"""จงสร้างข้อสอบปรนัย 4 ตัวเลือก จำนวน 1 ข้อ สำหรับชุดข้อสอบ (Exam Set): "{category_name}"
ระดับความยาก: เทียบเท่าข้อสอบแข่งขันเข้ารับราชการ (เช่น ภาค ก. หรือ ท้องถิ่น)

⚠️ ข้อมูลสำคัญ 1: นี่คือข้อสอบที่คุณเคยสร้างไปแล้ว (ห้ามออกโจทย์ซ้ำเรื่องเดิม หรือคล้ายคลึงกับรายการเหล่านี้เด็ดขาด):
{previous_questions}

⚠️ ข้อมูลสำคัญ 2 (ข้อควรระวังในการตั้งคำถามและตัวเลือก):
ห้ามตั้งคำถามที่ต้องอาศัยการดูรูปภาพ กราฟ หรือตารางประกอบ เพราะระบบไม่รองรับการแนบภาพ
หลีกเลี่ยงประเด็นอ่อนไหวทางการเมือง ศาสนา หรือบุคคลที่มีอยู่จริงในปัจจุบัน ให้ใช้สถานการณ์สมมติที่เป็นกลาง
ตัวลวง (Distractors) ในอีก 3 ตัวเลือกที่ผิด ต้องมีความน่าจะเป็นสูง สมเหตุสมผล หรือเป็นความเข้าใจผิดที่พบบ่อย
สามารถใช้ HTML Tags พื้นฐาน เช่น <b>คำที่ต้องการเน้น</b> หรือ <br> ในส่วนของโจทย์และคำอธิบายได้

⚠️ ข้อมูลสำคัญ 3 (รูปแบบคำอธิบายเฉลย - explanation):
หากเป็นวิชาคำนวณ หรือ ตรรกศาสตร์ ให้แสดงวิธีคิดวิเคราะห์ทีละขั้นตอน (Step-by-step)
หากเป็นวิชากฎหมาย ให้อ้างอิงชื่อ พ.ร.บ. และ มาตรา ที่เกี่ยวข้องอย่างชัดเจน
ทุกวิชา ต้องอธิบายสั้นๆ ด้วยว่าทำไมตัวเลือกอื่นจึงผิด

ให้คุณวิเคราะห์และแต่งข้อสอบข้อใหม่เอี่ยมที่เกี่ยวข้องกับ "{category_name}"
และให้ตอบกลับเป็น JSON ตามแบบฟอร์มดังนี้ ปริ้นต์เฉพาะข้อมูล JSON เท่านั้น ห้ามมี Markdown backticks ข้อความนำใดๆ:
{{
    "question_text": "โจทย์ข้อสอบ...",
    "option_a": "ตัวเลือก A",
    "option_b": "ตัวเลือก B",
    "option_c": "ตัวเลือก C",
    "option_d": "ตัวเลือก D",
    "correct_answer": "Option A, Option B, Option C หรือ Option D (ระบุให้เป๊ะ)",
    "subject": "หมวดหมู่วิชาหลัก (เช่น ท้องถิ่น ภาค ก, ท้องถิ่น ภาค ข)",
    "skill": "ทักษะที่ใช้วัดผล (เช่น อังกฤษ, ความรู้ทั่วไป, กฎหมาย, บัญชี)",
    "catalogs": "แท็กรายวิชา (เช่น ภาษาอังกฤษ, ความรู้พื้นฐานในการปฏิบัติราชการ)",
    "explanation": "คำอธิบายเฉลยอย่างละเอียด..."
}}
    """
    
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.7,
            system_instruction="คุณเป็นผู้เชี่ยวชาญการออกข้อสอบข้าราชการ/พนักงานราชการ สร้างข้อสอบ 1 ข้อ และตอบกลับมาเป็น JSON Format เท่านั้น"
        )
    )
    
    try:
        raw_json = response.text
        # Optional cleanup of backticks
        if raw_json.startswith("```json"):
            raw_json = raw_json[7:-3].strip()
        data = json.loads(raw_json)
        
        exam_obj = ExamQuestion(**data)
        validated_dict = exam_obj.model_dump()
        validated_dict['correct_answer'] = fix_correct_answer(validated_dict['correct_answer'])
        
        return validated_dict

    except Exception as e:
        print(f"Failed to parse Gemini output: {response.text}")
        raise e
