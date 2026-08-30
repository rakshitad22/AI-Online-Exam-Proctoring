import urllib.request
import json

url = "https://ai-online-exam-proctoring-api.vercel.app/api/v1/exams"
req = urllib.request.Request(url)
try:
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode('utf-8')
        data = json.loads(body)
        print("EXAMS COUNT:", len(data))
        for idx, ex in enumerate(data, 1):
            q_count = len(ex.get("questions", []))
            print(f"Exam {idx}: '{ex.get('title')}' - {q_count} Questions - Active: {ex.get('is_active')}")
except Exception as e:
    print("ERROR FETCHING EXAMS:", e)
