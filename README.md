# 🏛️ CivicLens AI – Flagsmith Hackathon Upgrade
> **AI-Powered Traffic, Pothole and Civic Infrastructure Detection Platform with Live Flagsmith A/B Experimentation**

[![Flagsmith Hackathon](https://img.shields.io/badge/Flagsmith-Hackathon%202026-6C5CE7?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00LjUgMTAuNWwxLjUtMS41TDEyIDE1bDYtNmwxLjUgMS41TDEyIDE4bC03LjUtNy41eiIvPjwvc3ZnPg==)](https://flagsmith.com)
[![React](https://img.shields.io/badge/React%2018-Vite%206-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.6-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io)
[![Java](https://img.shields.io/badge/Java-21%20LTS-ED8B00?style=for-the-badge&logo=java)](https://openjdk.org)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

---

## 🌟 Overview

**CivicLens AI** is an intelligent civic infrastructure defect detection and traffic telemetry platform designed for college campuses and smart municipalities.

For the **Flagsmith Hackathon**, CivicLens AI integrates the **official Flagsmith SDK** to execute a true **multivariate A/B experiment** (`smart_road_dashboard`), measuring whether predictive road risk visualization and smart hazard alerts significantly lift citizen safety actions compared to traditional defect dashboards.

---

## 🔬 The Flagsmith A/B Experiment

### Feature Flag: `smart_road_dashboard`
- **Experiment Split:** 50% Version A / 50% Version B
- **Multivariate Configuration:**
  - `control`: Version A (Standard Defect Dashboard)
  - `experiment`: Version B (Smart Road Monitoring Dashboard)
- **Safe Fallback:** If Flagsmith is offline or unconfigured, the app falls back safely to **Version A (Control)** without any visual glitch or runtime error.
- **Judge / Dev Override Switcher:** A live switcher (`[Flagsmith SDK | Version A | Version B]`) is built directly into the UI so evaluators can inspect both experiences in real time.

---

### Experience Comparison

```
+---------------------------------------------------+---------------------------------------------------+
|               VERSION A - CONTROL                 |             VERSION B - EXPERIMENT                |
|           (Standard Civic Dashboard)              |         (Smart Road Monitoring Dashboard)         |
+---------------------------------------------------+---------------------------------------------------+
| * Standard summary cards (Open, In Progress, etc.) | * Real-time Road Risk Priority Index (High Hazard)|
| * Basic chronological recent defect list          | * Smart Pothole Hazard Alerts with detour options |
| * Standard issue reporting form                   | * Traffic congestion impact & slowdown estimates  |
| * General OpenStreetMap defect markers            | * Quick-action one-click defect category chips    |
|                                                   | * Live driver & pedestrian safety advisories      |
+---------------------------------------------------+---------------------------------------------------+
```

---

## 📊 Experiment Metrics & Telemetry

### Primary Success Metric
$$\text{Conversion Rate} = \frac{\text{Sessions with at least 1 meaningful road-safety action}}{\text{Total eligible dashboard sessions}} \times 100$$

### Tracked User Interactions (Privacy-Safe)
1. `dashboard_view` — Dashboard session initialized with variant tag (`control` or `experiment`).
2. `pothole_alert_view` — User views critical pothole/road hazard alert.
3. `issue_report_submit` — User submits a road damage report with AI diagnosis.
4. `map_interaction` — User engages with road risk visualization map.
5. `traffic_recommendation_click` — User accepts recommended detour or safe route advisory.

> **Privacy Guarantee:** Experiment analytics never transmit passwords, JWT tokens, PII, personal coordinates, or uploaded image files. All tracking uses ephemeral anonymous session IDs.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Role |
|---|---|---|
| **Feature Flags & Experimentation** | `@flagsmith/flagsmith` (React/JS SDK) | Feature flag evaluation, multivariate variant distribution, offline fallback |
| **Frontend Web** | React 18, Vite 6, Tailwind CSS | High-performance dashboard with dual A/B experience |
| **Analytics & Data Viz** | Recharts, Lucide React | A/B test conversion rate charts, breakdown graphs, KPI meters |
| **Geographic Mapping** | Leaflet, React-Leaflet, OpenStreetMap | Real-time road hazard cluster and risk hotspot rendering |
| **Backend API** | Java 21, Spring Boot 3.3.6, Spring Security 6 | Enterprise REST API, JWT auth, experiment telemetry ingest |
| **Database** | MySQL 8.0 / In-memory H2 (Dual support) | Relational persistence for issues, comments, and experiment events |
| **AI Vision Engine** | Google Gemini 3.8 Flash API | Real-time multimodal infrastructure damage diagnosis & priority scoring |

---

## ⚙️ Flagsmith Setup Guide

1. Sign up for a free account at [Flagsmith.com](https://flagsmith.com).
2. Create a project named **CivicLens AI**.
3. Create a Feature Flag:
   - **Name:** `smart_road_dashboard`
   - **Enabled:** `true`
   - **Type:** Multivariate Flag
   - **Variations:**
     - `control`: 50%
     - `experiment`: 50%
4. Copy your **Client-side Environment Key** from **Project Settings ➔ Keys**.
5. Paste it into your frontend `.env` file:
   ```bash
   VITE_FLAGSMITH_ENVIRONMENT_ID=your_client_side_key_here
   ```
6. If left blank, CivicLens AI automatically operates in resilient local fallback mode.

---

## 🚀 Quick Start Guide (Windows / Linux / macOS)

### Option 1: One-Click Startup (Windows)
Double-click `start.bat` in the project root:
```cmd
start.bat
```

### Option 2: Manual Terminal Commands

#### 1. Backend API (Port 8080)
```bash
cd backend
mvn -s settings.xml spring-boot:run
```
- API Base URL: `http://localhost:8080/api`
- Experiment Metrics: `http://localhost:8080/api/admin/experiments/metrics`
- H2 Database Console: `http://localhost:8080/h2-console`

#### 2. Frontend App (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Administrator** | `admin@civiclens.app` | `admin123` | Full admin dashboard, Flagsmith A/B conversion analytics, status triage |
| **Citizen / Student** | `user@civiclens.app` | `demo123` | Citizen dashboard (Version A or B), report issues, AI diagnosis, road risk map |

---

## 🔒 Security Hardening

- **JWT Signing Secret:** Sourced securely from environment variable `${JWT_SECRET}`.
- **Gemini API Key:** Sourced from `${GEMINI_API_KEY}` without leaking to client bundles.
- **CORS Hardening:** Configured with specific allowed origin patterns and credentials handling.
- **Credential Storage:** All passwords hashed with BCrypt.
- **Git Hygiene:** Clean `.gitignore` excluding all `node_modules`, `target`, `uploads`, `.m2`, and `.env` files.

---

## 📹 Demo Video Walkthrough Script (60–90 seconds)

1. **[0:00 - 0:15] Introduction:**
   *"Welcome to CivicLens AI. Today we are demonstrating our live Flagsmith A/B experimentation platform for intelligent road safety and civic infrastructure."*
2. **[0:15 - 0:35] Flagsmith Feature Flag & Version A (Control):**
   *"Notice our Flagsmith experiment banner evaluating the `smart_road_dashboard` flag. In Version A (Control), citizens see standard civic defect counts and lists."*
3. **[0:35 - 0:60] Version B (Experiment - Smart Road Monitoring):**
   *"When Flagsmith routes the user to Version B, the experience upgrades into a Smart Road Monitoring Dashboard with Road Risk Priority Gauges, Critical Pothole Alerts, Traffic Slowdown Insights, and One-Click Reporting."*
4. **[0:60 - 1:15] Real-Time Interaction Tracking:**
   *"Every meaningful safety action—viewing an alert, inspecting a detour, or submitting a hazard—is tracked in a privacy-conscious event pipeline without transmitting PII."*
5. **[1:15 - 1:30] Admin Experiment Analytics Dashboard:**
   *"Switching to the Admin Panel, administrators see real-time Recharts visualizations showing conversion rates, relative conversion lift, participant counts, and statistically backed A/B metrics."*

---

## 🏆 Flagsmith Hackathon Submission Checklist

- [x] Official Flagsmith React / JS SDK integrated (`@flagsmith/flagsmith`)
- [x] Feature flag created: `smart_road_dashboard`
- [x] True 50/50 A/B multivariate experiment implemented
- [x] Distinct Version A (Control) and Version B (Smart Road) experiences
- [x] Privacy-conscious interaction event tracking (`/api/experiments/track`)
- [x] Dedicated Admin A/B test analytics pane with Recharts
- [x] Graceful offline fallback when Flagsmith is unreachable
- [x] Interactive live variant switcher for judges and evaluators
- [x] Security-hardened JWT secret and Gemini API keys
- [x] Clean repository with `.env.example` and zero committed secrets
- [x] Verified builds for both React Vite frontend and Spring Boot backend

---

© 2026 CivicLens AI — Flagsmith Hackathon Project
