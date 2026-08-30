import urllib.request
import json

base_url = "https://ai-online-exam-proctoring-api.vercel.app/api/v1"

def test_login(email, password):
    url = f"{base_url}/auth/login"
    payload = {"email": email, "password": password}
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            res = json.loads(body)
            print(f"LOGIN SUCCESS ({email}): Role={res.get('role')}, Token={res.get('access_token')[:20]}...")
            return res
    except Exception as e:
        print(f"LOGIN ERROR ({email}):", e)

if __name__ == "__main__":
    test_login("admin@example.com", "admin123")
    test_login("student@example.com", "student123")
