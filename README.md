# AI-Based Online Exam Proctoring and Abnormal Activity Detection System

> **Final-Year Engineering Project**  
> Conceptual Methodology Reference: *"Effectiveness of Pre-Trained CNN Networks for Detecting Abnormal Activities in Online Exams"*

---

## 📋 1. Problem Statement

Remote online examinations have gained immense popularity across higher educational institutions. However, maintaining academic integrity without physical invigilators is a major challenge. Unsupervised environments enable unethical practices such as using unauthorized external devices (mobile phones), obtaining outside help (multiple persons), looking away at hidden study materials (head movement), or whispering answers to peers (talking behavior). Manual invigilation over webcam video grids is unscalable and error-prone.

---

## 🎯 2. Project Objective

The objective of this project is to build an automated, end-to-end full-stack web application that uses **Computer Vision and Deep Learning** to continuously monitor a candidate's webcam stream during an online exam, detect suspicious activities in real time, issue progressive warnings, calculate candidate risk scores, and present live telemetry and audit reports to examiners.

---

## 🚀 3. Key System Features

### Student Module
- **Registration & Role Authentication**: Student login with JWT authorization.
- **Student Dashboard**: Browse active proctored assessment catalog.
- **Pre-Exam Camera Verification**: Interactive webcam hardware test and rule verification.
- **Online Proctored Exam Room**: Timer, question player, live camera stream, real-time AI status indicators (**Green** = Normal, **Yellow** = Warning, **Red** = Critical Violation), progressive warning counter banner, and live violation event logger.
- **Instant Result & Risk Report**: Detailed score breakdown (correct, wrong, unanswered), proctoring warning tally, transparent risk index, and submission status.

### Admin / Examiner Module
- **Examiner Dashboard**: High-level telemetry, candidate metrics, active exam stats, and 5-class violation distribution cards.
- **Exam Management (CRUD)**: Create, edit, activate/deactivate, and delete proctored exams.
- **Live Invigilation Room (`ActiveMonitoring.jsx`)**: Real-time surveillance grid displaying candidate webcam streams, violation counters, and risk badges.
- **Audit & Report Manager (`ReportsView.jsx`)**: Detailed candidate audit reports featuring a chronological violation timeline and print-friendly PDF export capabilities.

---

## 🧠 4. AI Detection Methodology & 5 Target Classes

Inspired by the research paper's motion keyframe and deep learning classification strategy, the system implements real-time video analytics for 5 target behavior classes:

| Class | Activity | Computer Vision Methodology | Severity | Risk Weight |
| :--- | :--- | :--- | :---: | :---: |
| **1** | `NORMAL` | Single person centered in frame, compliant posture, no device or mouth activity. | `NONE` | **0** |
| **2** | `EXTERNAL_DEVICE` | OpenCV / YOLO rectangular object contour detection matching mobile phone aspect ratios ($1.6 - 2.5$). | `HIGH` | **25** |
| **3** | `MULTIPLE_PERSONS` | Multi-scale face & body detection returning candidate count $> 1$. | `HIGH` | **30** |
| **4** | `HEAD_MOVEMENT` | Facial center displacement tracking yaw/pitch offsets ($> 22\%$) across a rolling frame buffer. | `LOW` | **5** |
| **5** | `TALKING` | Visual Mouth Aspect Ratio (MAR) and smile cascade variation analysis across consecutive frames. | `MEDIUM` | **10** |

---

## 📐 5. Transparent Risk-Score Formula

$$\text{Risk Score} = \min\left(100, \sum (\text{Violation Count}_i \times \text{Weight}_i)\right)$$

### Risk Categories:
- **0 – 19%**: `LOW` Risk
- **20 – 49%**: `MEDIUM` Risk
- **50 – 74%**: `HIGH` Risk
- **75 – 100%**: `CRITICAL` Risk

> *Note: The risk index is a project-defined heuristic scoring metric to assist examiner review and is not an official cheating probability.*

---

## 🏗️ 6. System Architecture & Data Flow

```
┌────────────────────────────────────────────────────────┐
│                   React + Vite SPA                     │
│  - Webcam Frame Capture (getUserMedia + Canvas)        │
│  - Real-time AI Status Indicator (Green/Yellow/Red)    │
│  - Progressive Warning Banner & Exam Questionnaire     │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Base64 Image Frame (HTTP POST /analyze-frame)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  FastAPI REST Server                   │
│  - JWT Bearer Authentication & CORS                    │
│  - Proctoring Router & Risk Calculation Engine         │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│     Vision Engine       │  │   MongoDB Database      │
│ - OpenCV & Haar Cascade │  │ - Users, Exams, Attempts│
│ - Motion Keyframe       │  │ - Violations, Reports   │
│ - 5-Class Detector      │  └─────────────────────────┘
└─────────────────────────┘
```

---

## 💻 7. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Axios, React Router DOM.
- **Backend**: Python 3.9+, FastAPI, PyJWT, Passlib (Bcrypt), Pydantic v2, Uvicorn.
- **Computer Vision**: OpenCV (`opencv-python-headless`), NumPy, Pillow.
- **Database**: MongoDB (asynchronous driver via Motor).

---

## 📂 8. Project Directory Structure

```
AI-Online-Exam-Proctoring/
├── backend/                        # FastAPI REST Backend
│   ├── app/
│   │   ├── api/                    # v1 API Routes (Auth, Exams, Users, Proctoring, Reports)
│   │   ├── core/                   # Config, Database Motor Connection & JWT Security
│   │   ├── models/                 # MongoDB Pydantic Schema Models
│   │   ├── schemas/                # Request & Response Data Schemas
│   │   └── services/               # Business Logic, Risk Score & Exam Evaluation Services
│   ├── .env.example                # Environment Variable Template
│   ├── requirements.txt            # Backend Dependencies
│   ├── seed_data.py                # Demo Account Database Seeder
│   └── start.py                    # Server Launcher
├── frontend/                       # React + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/             # Common, Student & Admin UI Components
│   │   ├── context/                # AuthContext & ExamContext Providers
│   │   ├── pages/                  # Student & Admin Portal Pages
│   │   ├── services/               # Axios API Clients
│   │   ├── App.jsx                 # Routes & Role-Based Protected Guards
│   │   └── index.css               # Tailwind CSS & Glassmorphism System
│   ├── package.json
│   └── vite.config.js
├── vision/                         # Computer Vision Engine
│   ├── __init__.py
│   ├── detector.py                 # Real OpenCV 5-Class Abnormal Activity Detector
│   └── utils.py                    # Base64 Frame Decoders & Keyframe Motion Filtering
└── README.md                       # Comprehensive Documentation
```

---

## 🛢️ 9. MongoDB Database Schemas

- **`users`**: `_id`, `email`, `full_name`, `hashed_password`, `role` (`student`/`admin`), `student_id`, `department`, `is_active`.
- **`exams`**: `_id`, `title`, `description`, `duration_minutes`, `total_marks`, `passing_marks`, `questions`, `created_by`, `is_active`.
- **`exam_attempts`**: `_id`, `student_id`, `exam_id`, `start_time`, `last_active`, `warning_count`, `risk_score`, `risk_category`, `submitted`.
- **`violations`**: `_id`, `exam_id`, `student_id`, `violation_type`, `severity`, `confidence`, `timestamp`, `details`.
- **`reports`**: `_id`, `exam_id`, `exam_title`, `student_id`, `student_name`, `score`, `total_marks`, `correct_answers`, `wrong_answers`, `unanswered`, `status`, `total_warnings`, `risk_score`, `risk_category`, `submitted_at`.

---

## ⚡ 10. Installation & Setup Guide

### Prerequisites
- Node.js `v18+`
- Python `3.9+`
- MongoDB running locally on `mongodb://localhost:27017` (or MongoDB Atlas connection string)

### 1. Database Seeding & Backend Run

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Seed demo accounts (Admin & Student) and sample exam
python seed_data.py

# Start FastAPI REST server
python start.py
```
> REST API will start at `http://localhost:8000`. Interactive Swagger docs available at `http://localhost:8000/docs`.

### 2. Frontend Web Application Run

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
```
> Web Dashboard will launch at `http://localhost:5173`.

---

## 🔑 11. Demo Login Credentials

For testing and demonstration, use the seeded demo accounts:

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Examiner / Admin** | `admin@example.com` | `admin123` | Access to Admin Dashboard, Live Invigilation, Exam CRUD, and Candidate Reports. |
| **Student** | `student@example.com` | `student123` | Access to Student Dashboard, Pre-Exam Camera Verification, and Proctored Exam Room. |

---

## 🧪 12. Testing Commands & Verification

### Backend Verification
```bash
python -m py_compile backend/app/main.py backend/start.py vision/detector.py backend/seed_data.py
```

### Frontend Verification
```bash
cd frontend
npm run build
```

---

## ⚠️ 13. Limitations & Future Enhancements

### Current Limitations
- Frame sampling relies on client-side webcam feed (`getUserMedia`) via HTTP REST requests rather than full WebSockets binary streaming.
- Visual talking detection tracks mouth aspect ratio and facial geometry motion; it does not perform audio speech recognition.

### Future Enhancements
- WebSockets integration for low-latency live video streaming.
- Audio decibel/whisper audio analysis pipeline integration.
- Custom YOLOv8n fine-tuning on academic cheating datasets (S_OCA dataset).
