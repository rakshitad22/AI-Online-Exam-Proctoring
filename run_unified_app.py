import os
import sys
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent

# Ensure project root is in sys.path
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Ensure backend is in sys.path
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

def main():
    print("=" * 70)
    print("  AI ONLINE EXAM PROCTORING SYSTEM - UNIFIED SINGLE-LINK DEPLOYMENT")
    print("=" * 70)

    frontend_dist = ROOT_DIR / "frontend" / "dist"
    if not (frontend_dist / "index.html").exists():
        print("[+] Frontend build dist missing. Running 'npm run build'...")
        subprocess.run(["npm.cmd", "run", "build"], cwd=str(ROOT_DIR / "frontend"), check=True)
        print("[OK] Frontend successfully built!")
    else:
        print("[OK] Found compiled React frontend distribution in frontend/dist.")

    # Seed Database
    print("[+] Seeding MongoDB database...")
    try:
        subprocess.run([sys.executable, str(BACKEND_DIR / "seed_data.py")], check=True)
        print("[OK] Database seeding complete!")
    except Exception as e:
        print(f"[!] Seeding notice: {e}")

    print("\n" + "=" * 70)
    print("  SINGLE UNIFIED APPLICATION LINK:")
    print("  http://localhost:8008")
    print("  (Serves both React Frontend SPA & FastAPI Backend REST APIs)")
    print("=" * 70 + "\n")

    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8008, reload=True, app_dir=str(BACKEND_DIR))

if __name__ == "__main__":
    main()
