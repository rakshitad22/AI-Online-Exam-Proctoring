**Severity:** HIGH

**Risk Weight:** 25

---

## 3. MULTIPLE\_PERSONS

The system analyzes the webcam frame to determine the number of visible people/faces.

If more than one person is detected within the webcam frame, the system generates a **Multiple Persons** warning.

Example:

```
```

```
Webcam Frame
      ↓
Face Detection
      ↓
Number of Faces
      ↓
More than One Person
      ↓
Multiple Persons Warning
```

**Severity:** HIGH

**Risk Weight:** 30

---

## 4. HEAD\_MOVEMENT

The system monitors the candidate's face orientation and movement.

Repeated or significant movement away from the expected forward-facing position may trigger a **Head Movement** warning.

The detection is intended to identify behavior such as:

-  Frequently looking away from the screen 
-  Excessive side-to-side head movement 
-  Sustained deviation from the expected examination posture 

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

Each detected abnormal activity can be recorded as an event containing:

-  Detection class 
-  Confidence 
-  Timestamp 
-  Risk contribution 
-  Candidate information 
-  Examination/session information 

The student interface displays the current warning status in real time.

Example:

```
```

```
AI MONITORING LIVE

Warning 1 / 3

AI Monitoring: External Device Detected
```

The project can be configured so that accumulating **3 or more warnings** flags the examination for examiner review.

> Warnings are indicators for human review and should not be treated as definitive proof of academic misconduct.

---

# 📊 Risk Scoring System

The system uses a project-defined weighted scoring mechanism.

| ActivityRisk WeightSeverity |    |        |
| --------------------------- | -- | ------ |
| `NORMAL`                    | 0  | None   |
| `EXTERNAL_DEVICE`           | 25 | High   |
| `MULTIPLE_PERSONS`          | 30 | High   |
| `HEAD_MOVEMENT`             | 5  | Low    |
| `TALKING`                   | 10 | Medium |

A simplified representation of the scoring mechanism is:

```
```

```
Risk Score =
    Base Risk
    + External Device Impact
    + Multiple Persons Impact
    + Head Movement Impact
    + Talking Impact
```

The final value is normalized to the application's configured risk range.

## Risk Categories

| Risk ScoreCategory |          |
| ------------------ | -------- |
| 0–19%              | Low      |
| 20–49%             | Medium   |
| 50–74%             | High     |
| 75–100%            | Critical |

The risk category helps examiners prioritize examinations requiring manual review.

---

# 🏗️ System Architecture

```
```

```
                         ┌─────────────────────────┐
                         │       Student           │
                         │      Web Browser        │
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
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
          ┌────────────────────┐             ┌────────────────────┐
          │   AI / CV Engine   │             │      MongoDB       │
          │                    │             │                    │
          │ • Face Detection   │             │ • Users            │
          │ • Device Detection │             │ • Exams             │
          │ • Head Movement    │             │ • Attempts          │
          │ • Audio Analysis   │             │ • Results           │
          │ • Activity Analysis│             │ • Violations        │
          └────────────────────┘             │ • Reports           │
                                             └────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

-  React 18 
-  JavaScript 
-  HTML5 
-  CSS 
-  React Router 
-  Browser MediaDevices API 
-  WebRTC/Webcam APIs 

## Backend

-  Python 
-  FastAPI 
-  Uvicorn 
-  Pydantic 
-  JWT Authentication 
-  REST API 

## Artificial Intelligence / Computer Vision

-  Python 
-  OpenCV 
-  Computer Vision 
-  Face Detection 
-  Object Detection 
-  Audio-Level Analysis 
-  YOLO-based Detection Concepts 
-  CNN-based Visual Analysis Concepts 

## Database

-  MongoDB 
-  PyMongo 
-  BSON / ObjectId 

## Deployment

-  GitHub 
-  Vercel 
-  Vercel Serverless Functions 

---

# 📁 Project Structure

```
```

```
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
```

---

# 🗄️ Database Design

MongoDB is used for persistent application storage.

The major collections include:

## Users

Stores authentication and role information.

```
```

```
users
├── name
├── email
├── password
├── role
└── created_at
```

## Exams

Stores examination configuration.

```
```

```
exams
├── title
├── description
├── duration
├── total_marks
├── questions
├── status
└── created_at
```

## Exam Attempts

Stores candidate examination attempts.

```
```

```
exam_attempts
├── student_id
├── exam_id
├── answers
├── score
├── warnings
├── risk_score
├── risk_category
└── submitted_at
```

## Violations

Stores detected abnormal activities.

```
```

```
violations
├── student_id
├── exam_id
├── violation_class
├── confidence
├── timestamp
└── risk_weight
```

---

# 🔌 API Endpoints

## Authentication

```
```

```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

## Exams

```
```

```
GET    /api/v1/exams
GET    /api/v1/exams/{exam_id}
POST   /api/v1/exams
PUT    /api/v1/exams/{exam_id}
DELETE /api/v1/exams/{exam_id}
```

## Proctoring

```
```

```
POST /api/v1/proctoring/analyze-frame
```

The endpoint accepts a webcam frame and returns detected activity information.

Example response:

```
```

```
{
  "class": "EXTERNAL_DEVICE",
  "confidence": 0.91,
  "warning": true,
  "risk_weight": 25
}
```

## Exam Submission

```
```

```
POST /api/v1/exams/submit
```

## Reports

```
```

```
GET /api/v1/reports/summary
```

---

# 🔄 Application Workflow

```
```

```
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
Camera & Microphone Permission
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
```

---

# 💻 Installation

## 1. Clone Repository

```
```

```
git clone https://github.com/rakshitad22/AI-Online-Exam-Proctoring.git
cd AI-Online-Exam-Proctoring
```

---

## 2. Backend Setup

Create a virtual environment:

```
```

```
python -m venv venv
```

Activate it on Windows:

```
```

```
venv\Scripts\activate
```

Install dependencies:

```
```

```
pip install -r backend/requirements.txt
```

---

## 3. Configure Environment Variables

Create a `.env` file according to the project's backend configuration.

Typical configuration includes:

```
```

```
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=ai_proctoring
SECRET_KEY=your_secret_key
BACKEND_CORS_ORIGINS=http://localhost:5173
```

> Never commit real database credentials, passwords, JWT secrets, or API keys to GitHub.

---

# ▶️ Running the Application

## Start Backend

From the project root:

```
```

```
uvicorn backend.api.index:app --reload --port 8000
```

Backend will be available at:

```
```

```
http://localhost:8000
```

Swagger API documentation:

```
```

```
http://localhost:8000/docs
```

---

## Start Frontend

Open another terminal:

```
```

```
cd frontend
npm install
npm run dev
```

The React application will normally run at:

```
```

```
http://localhost:5173
```

Open the displayed localhost URL in your browser.

---

# 🌐 Live Deployment

The project has been configured for deployment using Vercel.

## Frontend Application

```
```

```
https://ai-online-exam-proctoring.vercel.app/
```

## Backend API

```
```

```
https://ai-online-exam-proctoring-api.vercel.app/
```

## Swagger API Documentation

```
```

```
https://ai-online-exam-proctoring-api.vercel.app/docs
```

## OpenAPI Schema

```
```

```
https://ai-online-exam-proctoring-api.vercel.app/api/v1/openapi.json
```

---

# 🔐 Demo Credentials

For local demonstration, use the credentials configured in the project's database/environment.

The application supports the following roles:

```
```

```
Student
Admin / Examiner
```

> Do not publish real passwords or authentication secrets in this README.

---

# 🧪 Testing

The project can be tested at multiple levels.

## Authentication Testing

```
```

```
✓ Student Registration
✓ Student Login
✓ JWT Authentication
✓ Role-Based Access
```

## Examination Testing

```
```

```
✓ Exam Listing
✓ Exam Loading
✓ Question Navigation
✓ Answer Selection
✓ Timer Functionality
✓ Exam Submission
✓ Result Calculation
```

## Proctoring Testing

```
```

```
✓ Webcam Frame Capture
✓ Face Detection
✓ Multiple Person Detection
✓ External Device Detection
✓ Head Movement Analysis
✓ Audio Activity Analysis
✓ Warning Generation
✓ Risk Score Calculation
```

## Report Testing

```
```

```
✓ Score Calculation
✓ Warning Count
✓ Risk Score
✓ Risk Category
✓ Violation Timeline
✓ Report Generation
```

---

# 🔒 Security

The system includes several security-oriented mechanisms:

-  JWT-based authentication 
-  Password hashing 
-  Role-based access control 
-  Protected API endpoints 
-  Environment variables for secrets 
-  CORS configuration 
-  Server-side validation 
-  Database validation 
-  Controlled examination access 

Sensitive credentials should always be stored in environment variables rather than source code.

---

# ⚠️ Limitations

The current system has several practical limitations:

1.  Computer Vision detection may produce false positives or false negatives. 
2.  Lighting conditions can affect face and object detection. 
3.  Webcam quality can affect detection accuracy. 
4.  Multiple-person detection depends on visible faces. 
5.  Audio detection may be affected by environmental noise. 
6.  Head movement detection may incorrectly classify natural candidate movement. 
7.  Browser permissions are required for webcam and microphone access. 
8.  Internet connectivity can affect real-time monitoring. 
9.  The risk score is a heuristic and should not be interpreted as a probability of cheating. 
10.  AI-generated warnings should be reviewed by a human examiner before taking disciplinary action. 

---

# 🔮 Future Enhancements

Possible future improvements include:

-  Advanced YOLO object detection models 
-  Custom-trained CNN models 
-  Improved face recognition 
-  Eye-gaze tracking 
-  Hand gesture detection 
-  Advanced speech detection 
-  Noise classification 
-  Improved mobile-phone detection 
-  Real-time WebSocket monitoring 
-  Multi-candidate live monitoring 
-  Email/SMS examiner notifications 
-  Advanced analytics dashboards 
-  Automatic PDF report generation 
-  Cloud-based model inference 
-  Model performance monitoring 
-  Improved false-positive reduction 
-  Candidate behavior timelines 
-  Advanced examiner review tools 

---

# 📈 Project Outcomes

The project demonstrates an end-to-end implementation of an AI-assisted online examination platform.

Major outcomes include:

```
```

```
✓ Full-Stack Web Application
✓ Online Examination Environment
✓ Five Technical Examinations
✓ 20 Questions Per Examination
✓ Real-Time Webcam Monitoring
✓ Audio Monitoring
✓ Abnormal Activity Detection
✓ Automated Warning Mechanism
✓ Risk Scoring System
✓ MongoDB Persistence
✓ REST API Architecture
✓ Student Dashboard
✓ Examiner Dashboard
✓ Live Monitoring Interface
✓ Proctoring Reports
✓ Cloud Deployment
```

---

# 🎓 Learning Outcomes

Through this project, the team gained practical experience in the following areas.

## Artificial Intelligence

-  Computer Vision 
-  Image Processing 
-  Object Detection 
-  Face Detection 
-  Activity Classification 
-  Risk-Based Decision Systems 

## Software Development

-  React Application Development 
-  FastAPI Backend Development 
-  REST API Integration 
-  MongoDB Database Operations 
-  Authentication Systems 
-  Frontend-Backend Integration 

## Deployment

-  Git and GitHub 
-  Environment Configuration 
-  Vercel Deployment 
-  Serverless Backend Deployment 
-  Cloud Application Deployment 

## Project Development

-  Requirement Analysis 
-  System Architecture 
-  UI/UX Design 
-  API Development 
-  Testing and Debugging 
-  Documentation 

---

# 👥 Contributors

### Rakshita D. & Project Team

**AICTE AI Internship Program 2026**

**XTRAGRAD Technologies**

Project Repository:

https://github.com/rakshitad22/AI-Online-Exam-Proctoring

---

# 🙏 Acknowledgements

We would like to thank:

- **AICTE** for providing the AI Internship Program 
- **XTRAGRAD Technologies** for the internship opportunity and guidance 
-  Faculty mentors and project coordinators 
-  Open-source communities and documentation resources 
-  Developers and researchers whose work inspired the Computer Vision and AI components 

---

# 📜 License

This project was developed for **academic and internship purposes**.

The project may be used for educational purposes with appropriate attribution.

---

 \<p align="center"> 

## 🤖 AI-Based Online Exam Proctoring System

\<strong>Detect • Monitor • Analyze • Report\</strong>

\<br>\<br>

\<strong>AICTE AI Internship Program 2026\</strong>\<br>

XTRAGRAD Technologies

\<br>\<br>

⭐ If you find this project useful, consider starring the repository.

\<br>\<br>

Made with ❤️ by \<strong>Rakshita D. & Project Team\</strong>

\<br>\<br>

© 2026 AI-Based Online Exam Proctoring System

 \</p> \`\`\`  
