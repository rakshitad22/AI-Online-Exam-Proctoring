# 🤖 AI-Based Online Exam Proctoring and Abnormal Activity Detection System

<p align="center">
  <strong>AICTE AI Internship Program 2026 | XTRAGRAD Technologies</strong>
</p>

<p align="center">
  An AI-powered full-stack online examination platform that uses Computer Vision and Deep Learning-inspired visual analytics to monitor candidates, detect abnormal activities, calculate risk scores, and generate proctoring reports.
</p>

<p align="center">
  <a href="https://github.com/rakshitad22/AI-Online-Exam-Proctoring">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub">
  </a>
  <a href="http://localhost:8008">
    <img src="https://img.shields.io/badge/Demo-Local%20Application-blue" alt="Demo">
  </a>
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/AI-Computer%20Vision-purple" alt="AI">
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Project Objective](#-project-objective)
- [Key Features](#-key-features)
- [AI Detection Methodology](#-ai-detection-methodology)
- [Risk Scoring System](#-risk-scoring-system)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [Application Workflow](#-application-workflow)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Demo Credentials](#-demo-credentials)
- [Testing](#-testing)
- [Security](#-security)
- [Limitations](#-limitations)
- [Future Enhancements](#-future-enhancements)
- [Project Outcomes](#-project-outcomes)
- [Learning Outcomes](#-learning-outcomes)
- [Contributors](#-contributors)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)

---

# 🌟 Overview

The **AI-Based Online Exam Proctoring and Abnormal Activity Detection System** is a full-stack web application designed to assist with monitoring candidates during online examinations.

The system combines:

- Artificial Intelligence
- Computer Vision
- Web Application Development
- REST APIs
- Database Persistence
- Risk Scoring
- Real-Time Proctoring Interfaces

The application monitors webcam frames during an examination and analyzes visual information to identify potentially abnormal activities.

The system focuses on five primary activity classes:

| Class | Activity |
|---|---|
| 1 | `NORMAL` |
| 2 | `EXTERNAL_DEVICE` |
| 3 | `MULTIPLE_PERSONS` |
| 4 | `HEAD_MOVEMENT` |
| 5 | `TALKING` |

The detected activities are converted into weighted risk values that help examiners review candidate behavior.

> **Important:** The risk score is a project-defined heuristic used to assist examiner review. It is not an official probability of cheating.

---

# 📋 Problem Statement

Remote online examinations have become increasingly common across educational institutions.

However, maintaining examination integrity without physical invigilators presents several challenges.

Candidates may potentially:

- Use unauthorized external devices
- Have another person present during the examination
- Look away from the screen repeatedly
- Communicate with someone nearby
- Receive unauthorized assistance

Traditional manual webcam monitoring can become difficult and unscalable when many candidates are taking an examination simultaneously.

Therefore, this project explores an automated approach using **Computer Vision and AI-based visual analysis** to assist examiners in identifying potentially abnormal activities.

---

# 🎯 Project Objective

The primary objective is to build an automated, end-to-end online examination platform capable of:

- Providing a secure online examination environment
- Capturing candidate webcam frames
- Analyzing visual information
- Detecting predefined abnormal activities
- Generating progressive warnings
- Calculating candidate risk scores
- Recording detected violations
- Providing administrator monitoring
- Generating candidate audit reports

---

# 🚀 Key Features

## 👨‍🎓 Student Module

### Authentication

- Student registration/login
- Role-based access
- JWT-based authorization

### Student Dashboard

- View available examinations
- Access active assessments
- View examination information

### Pre-Exam Verification

- Webcam availability check
- Camera permission handling
- Examination rule verification

### Online Exam Environment

The student exam environment provides:

- Examination timer
- Question navigation
- Answer selection
- Live webcam stream
- AI status indicator
- Warning counter
- Violation event feedback
- Exam submission

### Result & Proctoring Summary

After submission, the system can provide:

- Correct answers
- Wrong answers
- Unanswered questions
- Examination score
- Warning count
- Risk score
- Risk category
- Proctoring summary

---

# 👨‍💼 Admin / Examiner Module

The administrator interface provides:

### Dashboard

- Candidate statistics
- Examination statistics
- Proctoring telemetry
- Violation distribution
- Risk information

### Exam Management

Administrators can:

- Create examinations
- View examinations
- Edit examinations
- Activate/deactivate examinations
- Delete examinations

### Live Monitoring

The monitoring interface provides candidate-level information including:

- Candidate status
- Risk score
- Violation count
- Proctoring information
- Monitoring cards

### Reports

The reporting system provides:

- Candidate details
- Examination details
- Score
- Violation summary
- Risk score
- Risk category
- Chronological violation timeline
- Print-friendly report layout
- Browser-based PDF export

---

# 🧠 AI Detection Methodology

The project is conceptually inspired by:

> *Effectiveness of Pre-Trained CNN Networks for Detecting Abnormal Activities in Online Exams*

The system uses visual frame analysis to classify candidate behavior into five target categories.

---

## 1. NORMAL

A candidate is considered normal when:

- A single candidate is detected
- No external device is detected
- No sustained abnormal head movement is detected
- No sustained mouth activity is detected

**Severity:** NONE  
**Risk Weight:** 0

---

## 2. EXTERNAL_DEVICE

The system analyzes the webcam frame for potential external devices such as mobile phones.

The project uses OpenCV/object-detection-based visual analysis for identifying rectangular object patterns associated with mobile devices.

**Severity:** HIGH  
**Risk Weight:** 25

---

## 3. MULTIPLE_PERSONS

The system analyzes the webcam frame to determine the number of visible people/faces.

If more than one person is detected within the webcam frame, the system generates a **Multiple Persons** warning.

**Severity:** HIGH  
**Risk Weight:** 30

---

## 4. HEAD_MOVEMENT

The system monitors the candidate's face orientation and movement.

Repeated or significant movement away from the expected forward-facing position may trigger a **Head Movement** warning.

The detection is intended to identify behavior such as:

- Frequently looking away from the screen
- Excessive side-to-side head movement
- Sustained deviation from the expected examination posture

**Severity:** LOW  
**Risk Weight:** 5

---

## 5. TALKING

The system uses audio-level analysis together with visual mouth-movement cues to identify potential talking behavior.

If sustained audio activity or mouth movement is detected beyond the configured threshold, the system can generate a **Talking Behavior** warning.

**Severity:** MEDIUM  
**Risk Weight:** 10

---

# ⚠️ Warning System

The proctoring engine maintains a warning counter during the examination.

Each detected abnormal activity is recorded as an event containing information such as:

- Detection class
- Confidence
- Timestamp
- Risk contribution
- Candidate/session information

The student interface displays the current warning status in real time.

Example:

AI MONITORING LIVE
Warning 1 / 3

AI Monitoring: External Device Detected
📊 Risk Scoring System

The system uses a project-defined weighted scoring mechanism.

Activity	Risk Weight	Severity
NORMAL	0	None
EXTERNAL_DEVICE	25	High
MULTIPLE_PERSONS	30	High
HEAD_MOVEMENT	5	Low
TALKING	10	Medium

The risk score is calculated from the detected abnormal activities.

A simplified representation is:

Risk Score =
Base Risk
+ External Device Impact
+ Multiple Persons Impact
+ Head Movement Impact
+ Talking Impact

The final value is normalized to the application's configured risk range.

Risk Categories
Risk Score	Category
0–19%	Low
20–49%	Medium
50–74%	High
75–100%	Critical

The risk category helps examiners prioritize examinations requiring manual review.

🏗️ System Architecture
                    ┌─────────────────────────┐
                    │       Student           │
                    │     Web Browser         │
                    └────────────┬────────────┘
                                 │
                                 │ HTTP / REST
                                 ▼
                    ┌─────────────────────────┐
                    │    React Frontend       │
                    │                         │
                    │ • Login / Register      │
                    │ • Student Dashboard     │
                    │ • Exam Interface        │
                    │ • Webcam Monitoring     │
                    │ • Results               │
                    └────────────┬────────────┘
                                 │
                                 │ API Requests
                                 ▼
                    ┌─────────────────────────┐
                    │      FastAPI Backend    │
                    │                         │
                    │ • Authentication        │
                    │ • Exam Management       │
                    │ • Proctoring API        │
                    │ • Reports API           │
                    └───────┬─────────┬───────┘
                            │         │
                 ┌──────────┘         └──────────┐
                 ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │ AI / CV Engine  │             │    MongoDB      │
        │                 │             │                 │
        │ • Face Detection│             │ • Users         │
        │ • Device Detect │             │ • Exams         │
        │ • Head Movement │             │ • Results       │
        │ • Audio Analysis│             │ • Violations    │
        └─────────────────┘             │ • Reports       │
                                        └─────────────────┘
🛠️ Technology Stack
Frontend
React 18
JavaScript
HTML5
CSS
React Router
Browser MediaDevices API
WebRTC/Webcam APIs
Backend
Python
FastAPI
Uvicorn
Pydantic
JWT Authentication
REST API
Artificial Intelligence / Computer Vision
Python
OpenCV
Computer Vision
Face Detection
Object Detection
Audio-level Analysis
YOLO-based detection concepts
CNN-based visual analysis concepts
Database
MongoDB
PyMongo
BSON / ObjectId
Deployment
Vercel
GitHub
Vercel Serverless Functions
📁 Project Structure
AI-Online-Exam-Proctoring/
│
├── backend/
│   ├── api/
│   │   └── index.py
│   │
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── vision/
│   │
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── package.json
│   └── vercel.json
│
├── api/
│   └── index.py
│
├── README.md
└── ...
🗄️ Database Design

MongoDB is used for persistent storage.

The major collections include:

Users

Stores authentication and role information.

users
├── name
├── email
├── password
├── role
└── created_at
Exams

Stores examination configuration.

exams
├── title
├── description
├── duration
├── total_marks
├── questions
├── status
└── created_at
Exam Attempts

Stores candidate examination attempts.

exam_attempts
├── student_id
├── exam_id
├── answers
├── score
├── warnings
├── risk_score
├── risk_category
└── submitted_at
Violations

Stores detected abnormal activities.

violations
├── student_id
├── exam_id
├── violation_class
├── confidence
├── timestamp
└── risk_weight
🔌 API Endpoints
Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
Exams
GET    /api/v1/exams
GET    /api/v1/exams/{exam_id}
POST   /api/v1/exams
PUT    /api/v1/exams/{exam_id}
DELETE /api/v1/exams/{exam_id}
Proctoring
POST /api/v1/proctoring/analyze-frame

The endpoint accepts a webcam frame and returns the detected activity information.

Example response:

{
  "class": "EXTERNAL_DEVICE",
  "confidence": 0.91,
  "warning": true,
  "risk_weight": 25
}
Exam Submission
POST /api/v1/exams/submit
Reports
GET /api/v1/reports/summary
🔄 Application Workflow
Student Registration
        ↓
Student Login
        ↓
Student Dashboard
        ↓
Select Examination
        ↓
Pre-Exam Verification
        ↓
Camera Permission
        ↓
Launch Proctored Exam
        ↓
Answer Questions
        ↓
Webcam + Audio Monitoring
        ↓
AI Frame Analysis
        ↓
Detect Activity
        ↓
Generate Warning
        ↓
Update Risk Score
        ↓
Store Violation
        ↓
Submit Examination
        ↓
Calculate Result
        ↓
Generate Proctoring Summary
        ↓
Examiner Review
💻 Installation
1. Clone Repository
git clone https://github.com/rakshitad22/AI-Online-Exam-Proctoring.git
cd AI-Online-Exam-Proctoring
2. Backend Setup

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r backend/requirements.txt
3. Configure Environment Variables

Create a .env file according to the project's backend configuration.

Typical configuration includes:

MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=ai_proctoring
SECRET_KEY=your_secret_key
BACKEND_CORS_ORIGINS=http://localhost:5173
▶️ Running the Application
Start Backend
uvicorn backend.api.index:app --reload --port 8000

Backend will be available at:

http://localhost:8000

Swagger documentation:

http://localhost:8000/docs
Start Frontend

Open another terminal:

cd frontend
npm install
npm run dev

The React application will normally run at:

http://localhost:5173

Open the displayed localhost URL in your browser.

🌐 Live Deployment

The project can be deployed using Vercel.

Frontend
https://ai-online-exam-proctoring.vercel.app/
Backend
https://ai-online-exam-proctoring-api.vercel.app/
API Documentation
https://ai-online-exam-proctoring-api.vercel.app/docs
🔐 Demo Credentials

For local demonstration, use the credentials configured in the project's database/environment.

Example roles:

Student
Admin / Examiner

Do not commit real passwords, API keys, JWT secrets, or database credentials to GitHub.

🧪 Testing

The project can be tested at multiple levels.

Authentication Testing
✓ Student Registration
✓ Student Login
✓ JWT Authentication
Examination Testing
✓ Exam Listing
✓ Exam Loading
✓ Question Navigation
✓ Answer Selection
✓ Exam Submission
Proctoring Testing
✓ Webcam Frame Capture
✓ Face Detection
✓ Multiple Person Detection
✓ External Device Detection
✓ Head Movement Analysis
✓ Audio Activity Analysis
✓ Warning Generation
Report Testing
✓ Score Calculation
✓ Warning Count
✓ Risk Score
✓ Risk Category
✓ Violation Timeline
✓ Report Generation
🔒 Security

The system includes several security-oriented mechanisms:

JWT-based authentication
Password hashing
Role-based access
Protected API endpoints
Environment variables for secrets
CORS configuration
Server-side validation
Database validation
Controlled examination access

Sensitive credentials should always be stored in environment variables rather than source code.

⚠️ Limitations

The current system has several practical limitations:

Computer Vision detection may produce false positives or false negatives.
Lighting conditions can affect face and object detection.
Webcam quality can affect detection accuracy.
Multiple-person detection depends on visible faces.
Audio detection may be affected by environmental noise.
Head movement detection may incorrectly classify natural candidate movement.
Browser permissions are required for webcam and microphone access.
Internet connectivity can affect real-time monitoring.
The risk score is a heuristic and should not be interpreted as a probability of cheating.
AI-generated warnings should be reviewed by a human examiner before taking disciplinary action.
🔮 Future Enhancements

Possible future improvements include:

Advanced YOLO object detection models
Custom-trained CNN models
Improved face recognition
Eye-gaze tracking
Hand gesture detection
Advanced speech detection
Noise classification
Mobile-phone detection improvements
Real-time WebSocket monitoring
Multi-candidate live monitoring
Email/SMS examiner notifications
Advanced analytics dashboards
Automatic PDF report generation
Cloud-based model inference
Model performance monitoring
Improved false-positive reduction
Candidate behavior timelines
Advanced examiner review tools
📈 Project Outcomes

The project demonstrates an end-to-end implementation of an AI-assisted online examination platform.

Major outcomes include:

Full-stack web application
Online examination environment
Real-time webcam monitoring
Abnormal activity detection
Automated warning mechanism
Risk scoring system
MongoDB persistence
REST API architecture
Student dashboard
Examiner dashboard
Live monitoring interface
Proctoring reports
Cloud deployment
🎓 Learning Outcomes

Through this project, the team gained practical experience in:

Artificial Intelligence
Computer Vision
Image processing
Object detection
Face detection
Activity classification
Risk-based decision systems
Software Development
React application development
FastAPI backend development
REST API integration
MongoDB database operations
Authentication systems
Deployment
Git/GitHub
Environment configuration
Vercel deployment
Serverless backend deployment
Frontend-backend integration
Project Development
Requirement analysis
System architecture
UI/UX design
API development
Testing and debugging
Documentation
👥 Contributors
Rakshita D. & Project Team

AICTE AI Internship Program 2026
XTRAGRAD Technologies

Project Repository:

https://github.com/rakshitad22/AI-Online-Exam-Proctoring

🙏 Acknowledgements

We would like to thank:

AICTE for providing the AI Internship Program
XTRAGRAD Technologies for the internship opportunity and guidance
Faculty mentors and project coordinators
Open-source communities and documentation resources
The developers and researchers whose work inspired the computer vision and AI components
📜 License

This project was developed for academic and internship purposes.

The project may be used for educational purposes with appropriate attribution.

<p align="center">
🤖 AI-Based Online Exam Proctoring System

<strong>Detect • Monitor • Analyze • Report</strong>

<br><br>

AICTE AI Internship Program 2026
XTRAGRAD Technologies

<br><br>

⭐ If you find this project useful, consider starring the repository.

</p> ```
<p align="center">
  <img src="https://img.shields.io/badge/AI-Artificial%20Intelligence-6C63FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Computer%20Vision-00BFFF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-FastAPI-61DAFB?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge" />
</p>

<h2 align="center">🚀 AI-Powered Proctoring for Smarter Online Examinations</h2>

<p align="center">
  <i>Built with technology, intelligence, and continuous learning.</i>
</p>

<p align="center">
  <strong>AICTE AI Internship Program 2026</strong><br>
  XTRAGRAD Technologies
</p>

<p align="center">
  <a href="https://github.com/rakshitad22/AI-Online-Exam-Proctoring">⭐ View on GitHub</a>
  •
  <a href="#-installation">📖 Documentation</a>
  •
  <a href="#-future-enhancements">🔮 Future Scope</a>
</p>

<p align="center">
  Made with ❤️ by <strong>Rakshita D.</strong> & Project Team
</p>

<p align="center">
  © 2026 AI-Based Online Exam Proctoring System
</p>

