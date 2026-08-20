# STARQ — AI-Powered Cricket Talent Assessment & Discovery Platform

> **"Talent exists everywhere. Data should help discover it."**

StarQ is a sports talent assessment and discovery platform that combines **MediaPipe computer vision biomechanics**, **cricket analytics**, and **explainable machine learning** to create multi-dimensional athlete profiles and scout high-potential youth cricketers.

---

## 🌟 Key Features

1. **Computer Vision Biomechanics Lab (MediaPipe Pose)**
   - Real-time in-browser 33-point body skeleton tracking with joint angle arcs.
   - **Batting Biomechanics**: Stance base width ratio, head eye-line stability, hip-shoulder rotational torque, downswing kinetic chain.
   - **Bowling Biomechanics**: Delivery stride length, gathered front-leg brace, high release angle.
   - **Optical Ball Speed Estimation**: Pixel displacement across frames with calibrated distance calculation.
   - **Standing Broad Jump Distance**: Computer-vision assisted takeoff-to-landing distance measurement.

2. **Multi-Modal ML Talent Potential Engine**
   - **Talent Potential Score (0–100)**: Transparent weighted ensemble incorporating match performance, athleticism, technical biomechanics, consistency, and developmental trajectory.
   - **Cricket Archetype Matching**: e.g., *Aggressive Top-Order Batter*, *Express Fast Bowler (140+ km/h)*, *Dynamic Leg-Spin All-Rounder*, *Death Overs Specialist*.
   - **Explainable AI (XAI)**: Rationale explaining *"Why this athlete ranked highly"* along with strengths, development areas, and tailored coaching drill prescriptions.

3. **Scout & Coach Intelligence Hub**
   - **Discover Emerging Talent**: Filter by age category (U-16, U-19, U-23), playing role, state/region, minimum talent potential, and archetype.
   - **Head-to-Head Athlete Comparison**: Dual radar chart overlays comparing 2-3 athletes across 6 dimensions with delta breakdown.
   - **High-Potential Talent Leaderboard**: Real-time ranking with historical progress trajectory arrows (↑).

4. **Structured 10-Step Assessment Workflow**
   - Sequential guided evaluation: Sport selection → Role → Bio → Match Stats → Physical Benchmarks → Live CV Test → Match Context → AI Normalization → Potential Score → Final Profile Save.

5. **Universal Multi-Sport Architecture**
   - Built modularly: Deep implementation in **Cricket**, with extensible relational schemas for Football, Basketball, Athletics, and Badminton.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons, Canvas Confetti.
- **Backend API**: Node.js & Express.js, JWT Authentication, bcryptjs, CORS, Multer.
- **Database**: SQLite with `sql.js` (zero native C++ compilation required, runs seamlessly across Windows/Mac/Linux) with PostgreSQL-compatible schema.
- **Microservice / CV**: Python 3.14, FastAPI, OpenCV, MediaPipe, scikit-learn, NumPy.

---

## 🚀 Quick Start Guide

### 1. Backend Server (Port 5000)
```bash
cd server
npm install
npm run seed   # Seeds database with 6 diverse player profiles and scout accounts
npm start      # Runs on http://localhost:5000
```

### 2. Frontend React Client (Port 5173)
```bash
cd client
npm install
npm run dev    # Runs on http://localhost:5173
```

### 3. Python CV/ML Microservice (Port 8001)
```bash
cd cv-service
pip install -r requirements.txt
python main.py # Runs on http://localhost:8001
```

---

## 🎯 1-Click Demo Guide for Judges

Open `http://localhost:5173` and use the **"Demo Switch"** dropdown in the top navbar to instantly test:

- 🏏 **Rahul Sharma (17)**: Aggressive Top-Order Batter (87 Potential • State U-19)
- ⚡ **Vikram Rathore (18)**: Express Fast Bowler (Clocked 141.2 km/h • 91 Potential)
- 🌀 **Ananya Patel (16)**: Leg-Spin All-Rounder (89 Potential • State U-16)
- 🔍 **Rajesh Dravid**: Senior National Scout / Coach Dashboard
