import requests
from config import config

def post_exam_draft(category_name: str, payload_dict: dict) -> bool:
    """
    Sends the generated Exam/Question JSON to the PreExam Backend. 
    It communicates securely using POST.
    """
    url = f"{config.PREEXAM_API_URL}/api/generator/exam"
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.GENERATOR_API_KEY
    }
    
    # Add metadata
    payload_dict['exam_set'] = category_name
    
    response = requests.post(url, json=payload_dict, headers=headers)
    
    if response.status_code in [200, 201]:
        print("Successfully posted exam to PreExam.")
        return True
    else:
        print(f"Backend rejected exam post. Status: {response.status_code}, Body: {response.text}")
        return False

def send_inbox_alert(message: str) -> bool:
    """
    Sends a system alert to the Admin Inbox indicating success or failure.
    """
    url = f"{config.PREEXAM_API_URL}/api/generator/inbox"
    headers = {
        "Content-Type": "application/json",
        "X-API-KEY": config.GENERATOR_API_KEY
    }
    
    payload = {
        "message": message
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"Failed to send inbox alert: {str(e)}")
        return False
