import urllib.request
import json

base_url = "https://ai-online-exam-proctoring-api.vercel.app/api/v1"

def test_analyze_frame():
    url = f"{base_url}/proctoring/analyze-frame"
    payload = {
        "exam_id": "exam_sample_01",
        "student_id": "std_demo_user_01",
        "frame_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "timestamp": 1788110000
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print("ANALYZE FRAME SUCCESS:", resp.status, body)
            return json.loads(body)
    except Exception as e:
        print("ANALYZE FRAME ERROR:", e)

def test_submit_exam():
    url = f"{base_url}/exams/submit"
    payload = {
        "exam_id": "exam_sample_01",
        "answers": {
            "q1": 0,
            "q2": 1
        },
        "total_warnings": 0,
        "violation_summary": {}
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print("SUBMIT EXAM SUCCESS:", resp.status, body)
            return json.loads(body)
    except Exception as e:
        print("SUBMIT EXAM ERROR:", e)

if __name__ == "__main__":
    frame = test_analyze_frame()
    submit = test_submit_exam()
