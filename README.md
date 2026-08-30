# 🤖 AI-Based Online Exam Proctoring and Abnormal Activity Detection System

<p align="center">
  <strong>AICTE AI Internship Program 2026 | XTRAGRAD Technologies</strong>
</p>

<p align="center">
  An AI-powered full-stack online examination platform that uses Computer Vision and AI-based visual analytics to monitor candidates, detect abnormal activities, calculate risk scores, and generate proctoring reports.
</p>

<p align="center">
  <a href="https://github.com/rakshitad22/AI-Online-Exam-Proctoring">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub">
  </a>
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/AI-Computer%20Vision-purple" alt="AI">
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel" alt="Vercel">
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Project Objective](#-project-objective)
- [Key Features](#-key-features)
- [Examination Structure](#-examination-structure)
- [AI Detection Methodology](#-ai-detection-methodology)
- [Risk Scoring System](#-risk-scoring-system)
- [Warning System](#-warning-system)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Database Design](#-database-design)
- [API Endpoints](#-api-endpoints)
- [Application Workflow](#-application-workflow)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Live Deployment](#-live-deployment)
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
- MongoDB Database
- Real-Time Proctoring
- Risk Scoring
- Automated Warning Detection
- Examiner Monitoring
- Proctoring Reports

The application captures webcam frames during an examination and analyzes visual information to identify potentially abnormal activities.

The system focuses on five primary activity classes:

| Class | Activity |
|---|---|
| 1 | `NORMAL` |
| 2 | `EXTERNAL_DEVICE` |
| 3 | `MULTIPLE_PERSONS` |
| 4 | `HEAD_MOVEMENT` |
| 5 | `TALKING` |

Detected activities are converted into weighted risk values that help examiners review candidate behavior.

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

Traditional manual webcam monitoring becomes difficult and unscalable when many candidates are taking examinations simultaneously.

Therefore, this project explores an automated approach using **Computer Vision and AI-based visual analysis** to assist examiners in identifying potentially abnormal activities.

---

# 🎯 Project Objective

The primary objective is to build an automated, end-to-end online examination platform capable of:

- Providing a secure online examination environment
- Providing multiple technical examinations
- Providing 20 questions per examination
- Capturing candidate webcam frames
- Analyzing visual information
- Detecting predefined abnormal activities
- Generating progressive warnings
- Calculating candidate risk scores
- Recording detected violations
- Providing administrator monitoring
- Maintaining examination results
- Generating candidate audit reports

---

# 🚀 Key Features

## 👨‍🎓 Student Module

### 🔐 Authentication

- Student registration
- Student login
- Role-based access
- JWT-based authorization

### 📊 Student Dashboard

Students can:

- View available examinations
- View examination details
- Start active examinations
- View examination results
- Review proctoring information

### 🛡️ Pre-Exam Verification

Before starting an examination, the student is shown the examination requirements and proctoring rules.

The system provides:

- Webcam availability check
- Camera permission handling
- Microphone permission handling
- Proctoring rule information
- Examination consent
- Proctored exam launch

### 📝 Online Examination Environment

The examination interface provides:

- Examination timer
- Question navigation
- 20 questions
- Multiple-choice answers
- Answer selection
- Question number navigation
- Previous/Next controls
- Live webcam monitoring
- Microphone monitoring
- AI monitoring status
- Warning counter
- Live violation stream
- Exam submission

### 📈 Result & Proctoring Summary

After submission, the system can provide:

- Obtained score
- Result status
- AI warning count
- Risk score
- Risk category
- Correct answers
- Wrong answers
- Unanswered questions
- Proctoring summary

---

# 🧑‍💼 Admin / Examiner Module

The administrator interface provides tools for managing examinations and monitoring candidates.

## 📊 Admin Dashboard

The dashboard provides an overview of:

- Registered candidates
- Active examination sessions
- Detected violations
- Flagged examinations
- Average risk score
- Recent examination activity
- Recent violations
- Violation distribution
- Risk-level distribution
- System health

## 📝 Exam Management

Administrators can:

- Create examinations
- View examinations
- Edit examinations
- Activate examinations
- Deactivate examinations
- Delete examinations
- Configure examination duration
- Configure examination questions

The system supports multiple examinations, including:

1. **Test 1: Computer Vision & OpenCV**
2. **Test 2: Machine Learning Fundamentals**
3. **Test 3: Deep Learning & CNN**
4. **Test 4: YOLO & Object Detection**
5. **Test 5: Data Structures and Algorithms**

Each examination is designed with **20 questions** and a configured examination duration.

## 🔴 Live Monitoring

The live monitoring interface provides candidate-level information including:

- Candidate ID
- Candidate name
- Examination name
- Online/offline status
- Normal/suspicious/flagged status
- Warning count
- Live monitoring information
- Violation information

## ⚠️ Violation Logs

The administrator can review detected activities including:

- Student ID
- Violation class
- AI confidence
- Timestamp
- Status
- Risk contribution

## 📄 Proctoring Reports

The reporting interface provides:

- Candidate details
- Examination details
- Score
- Proctor warnings
- Risk score
- Risk category
- Violation summary
- Chronological violation timeline
- Report viewing
- Print-friendly report
- Browser-based PDF export

---

# 🧪 Examination Structure

The system provides five technical examinations.

| Test | Examination | Questions | Duration |
|---|---|---:|---:|
| Test 1 | Computer Vision & OpenCV | 20 | 45 Minutes |
| Test 2 | Machine Learning Fundamentals | 20 | 45 Minutes |
| Test 3 | Deep Learning & CNN | 20 | 45 Minutes |
| Test 4 | YOLO & Object Detection | 20 | 45 Minutes |
| Test 5 | Data Structures and Algorithms | 20 | 45 Minutes |

### Test 1: Computer Vision & OpenCV

Covers topics such as:

- OpenCV fundamentals
- Image processing
- Matrix operations
- Color spaces
- Thresholding
- Morphological operations

### Test 2: Machine Learning Fundamentals

Covers:

- Supervised learning
- Unsupervised learning
- Classification
- Regression
- Gradient descent
- Bias-variance tradeoff
- Evaluation metrics

### Test 3: Deep Learning & CNN

Covers:

- Neural networks
- Backpropagation
- Convolutional layers
- Pooling
- Activation functions
- ReLU
- Softmax
- Transfer learning

### Test 4: YOLO & Object Detection

Covers:

- Object detection
- YOLO architecture
- Backbone
- Neck
- Detection head
- Single-stage detection
- Two-stage detection
- Non-Maximum Suppression
- Intersection over Union

### Test 5: Data Structures and Algorithms

Covers:

- Arrays
- Linked lists
- Stacks
- Queues
- Trees
- Graphs
- Sorting
- Hashing
- Algorithm complexity

---

# 🧠 AI Detection Methodology

The project is conceptually inspired by:

> *Effectiveness of Pre-Trained CNN Networks for Detecting Abnormal Activities in Online Exams*

The system uses webcam frame analysis and audio-level analysis to classify candidate behavior into five target categories.

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

The project uses computer-vision/object-detection-based visual analysis for identifying objects associated with external device usage.

Example:

```text
Candidate
    ↓
Webcam Frame
    ↓
Object Detection
    ↓
External Device Detected
    ↓
Warning Generated
    ↓
Risk Score Updated
