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

The system analyzes the frame to determine the number of visible people/faces.

```text
Person Count = 1
        ↓
NORMAL

Person Count > 1
        ↓
MULTIPLE_PERSONS
