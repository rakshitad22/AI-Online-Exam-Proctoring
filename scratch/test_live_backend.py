import urllib.request
import json

base_url = "https://ai-online-exam-proctoring-api.vercel.app/api/v1"

def test_register():
    url = f"{base_url}/auth/register"
    payload = {
        "email": "demo_student@proctoring.edu",
        "password": "Password123!",
        "full_name": "Demo Candidate",
        "role": "student",
        "student_id": "STD-9988",
        "department": "Computer Science"
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print("REGISTER SUCCESS:", resp.status, body)
            return json.loads(body)
    except urllib.error.HTTPError as e:
        print("REGISTER HTTP ERROR:", e.code, e.read().decode('utf-8'))
    except Exception as e:
        print("REGISTER ERROR:", e)

def test_login():
    url = f"{base_url}/auth/login"
    payload = {
        "email": "demo_student@proctoring.edu",
        "password": "Password123!"
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print("LOGIN SUCCESS:", resp.status, body)
            return json.loads(body)
    except urllib.error.HTTPError as e:
        print("LOGIN HTTP ERROR:", e.code, e.read().decode('utf-8'))
    except Exception as e:
        print("LOGIN ERROR:", e)

if __name__ == "__main__":
    reg = test_register()
    login = test_login()
