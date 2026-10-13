# 🚔 Multilingual AI-Powered Central Grievance Management Portal (CGMP)

> **Complete Zero-Knowledge Guide & Architectural Handbook**  
> Everything you need to know about the system workflow, design decisions, data flow, API endpoints, and line-by-line code logic.

---

## 📑 Table of Contents
1. [Executive Summary (What Is This Project?)](#1-executive-summary-what-is-this-project)
2. [End-to-End Workflow (Real-Life Citizen Journey)](#2-end-to-end-workflow-real-life-citizen-journey)
3. [User Roles and Credentials](#3-user-roles-and-credentials)
4. [Tech Stack & Architecture Map](#4-tech-stack--architecture-map)
5. [Database Models & Schemas Explained](#5-database-models--schemas-explained)
6. [Line-by-Line Code Breakdown](#6-line-by-line-code-breakdown)
   - [6.1 Server Bootstrap (`backend/server.js`)](#61-server-bootstrap-backendserverjs)
   - [6.2 Resilient Database & Auto-Seeding (`backend/config/db.js`)](#62-resilient-database--auto-seeding-backendconfigdbjs)
   - [6.3 Authentication Middleware (`backend/middlewares/authMiddleware.js`)](#63-authentication-middleware-backendmiddlewaresauthmiddlewarejs)
   - [6.4 Authentication Controller (`backend/controllers/authController.js`)](#64-authentication-controller-backendcontrollersauthcontrollerjs)
   - [6.5 Complaint Lifecycle Controller (`backend/controllers/complaintController.js`)](#65-complaint-lifecycle-controller-backendcontrollerscomplaintcontrollerjs)
   - [6.6 AI Vision & Translation Engine (`backend/controllers/visionController.js`)](#66-ai-vision--translation-engine-backendcontrollersvisioncontrollerjs)
   - [6.7 Admin Assignment & Analytics Controller (`backend/controllers/adminController.js`)](#67-admin-assignment--analytics-controller-backendcontrollersadmincontrollerjs)
   - [6.8 Department Controller (`backend/controllers/departmentController.js`)](#68-department-controller-backendcontrollersdepartmentcontrollerjs)
   - [6.9 Staff Controller (`backend/controllers/staffController.js`)](#69-staff-controller-backendcontrollersstaffcontrollerjs)
   - [6.10 Official REPORT & PDF Engine (`backend/controllers/reportController.js`)](#610-official-report--pdf-engine-backendcontrollersreportcontrollerjs)
   - [6.11 RAG Contextual Chat Assistant (`backend/controllers/chatController.js`)](#611-rag-contextual-chat-assistant-backendcontrollerschatcontrollerjs)
7. [Frontend Architecture & Key Components](#7-frontend-architecture--key-components)
8. [Setup, Deployment & Environment Variables](#8-setup-deployment--environment-variables)
9. [Troubleshooting & FAQ for Hackathon Demos](#9-troubleshooting--faq-for-hackathon-demos)

---

## 1. Executive Summary (What Is This Project?)

The **Central Grievance Management Portal (CGMP)** is an intelligent civic reporting platform that bridges the gap between everyday citizens and municipal/civic authorities (PWD, Sanitation, Water Supply, Electricity, Police/Administration).

### Why Was It Built?
1. **Regional Languages:** Many citizens explain problems in Telugu, Hindi, or "Hinglish/Telugish" (e.g., *"ma area lo water block ayindi"*). Traditional portals only accept English.
2. **AI Triage:** Citizens don't always know which department handles their problem or what priority to give it. The system analyzes their raw text, detects the language, translates it, tags the department, and assigns a priority (`Low`, `Medium`, `High`, `Critical`).
3. **Computer Vision Verification:** Prevents spam or fake complaints. When a citizen attaches a photo of a pothole, the AI verifies whether the photo actually shows road damage.
4. **Accountability & Resolution Proof:** When municipal staff resolves a problem, they must upload an after-resolution photo and operational remarks before the ticket can be closed.

---

## 2. End-to-End Workflow (Real-Life Citizen Journey)

```
[ Citizen Files Grievance ]
        │
        ├──> Type text in English / Telugu / Hindi or use Speech-to-Text
        ├──> Upload image proof (Pothole, Garbage, Water Leak)
        └──> Select or Geocode address on interactive OpenStreetMap
        │
        ▼
[ AI Intake Pipeline (Groq / GPT-OSS / Gemini) ]
        │
        ├──> Language Detection & English Translation
        ├──> AI Categorization & Urgency Prioritization
        └──> Vision Validation (Checks if image matches category)
        │
        ▼
[ Backend Storage (MongoDB / In-Memory Fallback) ]
        │
        └──> Creates unique complaint docket (e.g., COMP-1727442654)
        │
        ▼
[ Admin Dashboard (`admin@city.gov`) ]
        │
        ├──> Real-time geospatial heatmaps and metrics
        ├──> Reviews incoming grievances
        └──> Assigns ticket to Department (PWD) + Specific Staff (`rupesh@city.gov`)
        │
        ▼
[ Officer Dashboard (`rupesh@city.gov`) ]
        │
        ├──> Receives assigned docket in personal work queue
        ├──> Investigates and takes physical civic action
        └──> Updates Status to RESOLVED with Mandatory Resolution Notes & Proof Photo
        │
        ▼
[ Citizen Dashboard (`john1@gmail.com`) ]
        │
        ├──> Receives live update: Status changes to RESOLVED
        └──> Rates service quality (1-5 Stars) and submits civic feedback
```

---

## 3. User Roles and Credentials

To make testing seamless both locally and in production (Render), the database is automatically seeded with these exact credentials:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Citizen (Public)** | `john1@gmail.com` | `password123` | File grievances, voice-assisted intake, track complaint history, rate resolutions |
| **Administrator** | `admin@city.gov` | `password123` | View global analytics, geospatial heatmaps, manage departments, delegate tickets to officers |
| **Department Staff** | `rupesh@city.gov` | `password123` | View assigned case queue, update investigation milestones, upload proof, mark resolved |

---

## 4. Tech Stack & Architecture Map

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet.js (OpenStreetMap), Axios, Framer Motion.
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, PDFKit, Multer.
- **Database:** MongoDB Atlas (Mongoose ODM) with automated fallback to `mongodb-memory-server` if firewalls block Atlas port 27017.
- **AI Integration:** Groq Cloud API (`openai/gpt-oss-120b`, `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`) with automatic failover safety wrappers.
- **Geocoding:** OpenStreetMap Nominatim reverse geocoding API.

---

## 5. Database Models & Schemas Explained

### 5.1 `User.js` (`backend/models/User.js`)
Stores citizen profiles, department staff, and administrators:
- `name` *(String)*: User full name.
- `email` *(String)*: Unique user email address.
- `password` *(String)*: Bcrypt-hashed password (never stored as plain text).
- `role` *(Enum: `'USER'`, `'STAFF'`, `'ADMIN'`)*: Determines which dashboard they can access.
- `departmentId` *(ObjectId)*: Points to the department the officer belongs to (e.g., PWD).
- `active_cases_count` *(Number)*: Real-time counter of pending cases assigned to this officer.
- `dob` *(Date)*: Citizen date of birth (powers accessible UI adaptations for senior citizens).

### 5.2 `Complaint.js` (`backend/models/Complaint.js`)
The central document for every grievance:
- `complaintId` *(String)*: Public reference number (e.g. `COMP-1727442654`).
- `citizenUserId` *(ObjectId -> User)*: Citizen who raised the complaint.
- `category` *(String)*: Potholes, Sanitation, Water Supply, Electricity, etc.
- `priority` *(Enum: `'Low'`, `'Medium'`, `'High'`, `'Critical'`)*.
- `latitude`, `longitude`, `address` *(Number, String)*: Spatial coordinates.
- `status` *(String)*: `'Submitted'`, `'Assigned'`, `'Work In Progress'`, `'Resolved'`.
- `assignedDepartmentId` *(ObjectId -> Department)*.
- `assignedOfficerUserId` *(ObjectId -> User)*.
- `statusHistory` *(Array)*: Immutable audit trail recording each state transition with timestamp and user.
- `rating`, `feedback` *(Number, String)*: Citizen satisfaction evaluation.

### 5.3 `Department.js` (`backend/models/Department.js`)
Organizes municipal divisions:
- `name` *(String)*: e.g., "PWD (Public Works Department)".
- `categoriesHandled` *(Array of Strings)*: e.g., `['Potholes', 'Roads', 'Infrastructure Decay']`.
- `officerUserIds` *(Array of ObjectIds)*: List of officers working under this department.

### 5.4 `REPORT.js` (`backend/models/REPORT.js`)
Generates standardized legal/administrative dockets suitable for printing or official municipal records.

---

## 6. Line-by-Line Code Breakdown

---

### 6.1 Server Bootstrap (`backend/server.js`)

This file is the root entrance of your entire backend application.

```javascript
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
```
- **Line 1 (`express`):** Imports the Express web framework to build HTTP REST APIs.
- **Line 2 (`dotenv`):** Loads environment variables from the `.env` configuration file into `process.env`.
- **Line 3 (`cors`):** Enables Cross-Origin Resource Sharing so your React frontend (port 5173 or Render domain) can communicate with your backend (port 5000).
- **Line 4 (`morgan`):** HTTP request logger middleware that prints every route request (`GET /api/complaints 200 ...`) to the terminal.
- **Line 5 (`path`):** Built-in Node.js utility for manipulating file and directory paths.
- **Line 6 (`connectDB`):** Imports our database connection function from `config/db.js`.

```javascript
dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();
const app = express();
```
- **Line 9:** Locates and reads the `.env` file in the current directory.
- **Line 12:** Calls `connectDB()` immediately so that database models are ready before handling requests.
- **Line 14:** Initializes the Express application instance (`app`).

```javascript
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```
- **Line 17-18:** Configures the JSON body parser with a large `50mb` limit. This is necessary because citizens upload Base64 images directly inside grievance payloads.
- **Line 19:** Applies CORS security headers.
- **Line 20:** Runs Morgan in developer mode for clean, colorized terminal logs.
- **Line 23:** Exposes the `/uploads` folder statically so stored evidence pictures can be viewed via URLs in browsers.

```javascript
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staffs', officerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/report', reportRoutes);
```
- **Lines 36-43:** Mounts all modular API sub-routers onto their respective `/api/*` endpoints.

```javascript
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "🚀 Multilingual AI REPORT Backend is live" });
});
app.get("/health", (req, res) => res.status(200).send("OK"));
```
- **Lines 46-52:** Provides a root health-check endpoint. Render and cloud hosting monitors ping `/` and `/health` to verify that the server is alive.

```javascript
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});
```
- **Lines 55-61:** Global error-handling middleware. Catches unhandled exceptions anywhere in the request-response cycle and returns a structured JSON error instead of crashing the process.

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```
- **Lines 63-67:** Starts listening for incoming HTTP connections on port 5000 (or the port assigned by Render via `process.env.PORT`).

---

### 6.2 Resilient Database & Auto-Seeding (`backend/config/db.js`)

This file contains one of the most critical resilience features in the project: **Zero-Crash Database Auto-Failover & Permanent Auto-Seeding**.

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    ...
```
- **Line 5:** Retrieves the MongoDB connection URI from environment variables.

```javascript
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000 
        });
        console.log(`✅ MongoDB Atlas Connected Successfully!`);
        await autoSeedDatabase();
    }
```
- **Lines 21-27:** Attempts to connect to MongoDB Atlas in the cloud. We set a 5-second `serverSelectionTimeoutMS`. If the host network (e.g. college Wi-Fi, corporate proxy) blocks port 27017, it does **not** freeze forever; it throws an error immediately after 5 seconds.
- **Line 29:** Calls `autoSeedDatabase()` once connected so production cloud clusters also receive base user accounts.

```javascript
    catch (error) {
        console.error('🔴 MONGODB ATLAS CONNECTION FAILED');
        ...
        console.error('\n⚠️ FALLING BACK TO LOCAL MEMORY DATABASE...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            const memoryConn = await mongoose.connect(memoryUri);
            console.log(`✅ Local In-Memory MongoDB Connected Successfully!`);
            await autoSeedDatabase();
        } catch (memError) {
            process.exit(1);
        }
    }
```
- **Lines 59-71:** **The Rescue Routine.** If Atlas fails due to network firewalls or invalid credentials, the server spins up an internal, self-contained `MongoMemoryServer` right inside your computer's RAM! The application never crashes and continues running seamlessly during demos.

```javascript
async function autoSeedDatabase() {
    try {
        const Department = require('../models/Department');
        const User = require('../models/User');
        
        const adminExists = await User.findOne({ email: 'admin@city.gov' });
        if (adminExists) return;

        const pwd = await Department.create({ 
            name: 'PWD (Public Works Department)', 
            categoriesHandled: ['Potholes', 'Roads', 'Infrastructure Decay', 'Other'] 
        });
        const san = await Department.create({ 
            name: 'Sanitation Department', 
            categoriesHandled: ['Garbage Overflow', 'Sanitation Feed', 'Public Health'] 
        });
        
        await User.create({ name: 'John Citizen', email: 'john1@gmail.com', password: 'password123', role: 'USER', phone: '9999999999', dob: '1990-01-01' });
        await User.create({ name: 'Rupesh Officer', email: 'rupesh@city.gov', password: 'password123', role: 'STAFF', phone: '1111111111', dob: '1990-01-01', departmentId: pwd._id });
        await User.create({ name: 'Admin', email: 'admin@city.gov', password: 'password123', role: 'ADMIN', phone: '2222222222', dob: '1990-01-01' });
    } catch (seedErr) { ... }
}
```
- **Lines 89-112:** Ensures that whether the server is started in production on Render or on an in-memory test database, the departments (`PWD`, `Sanitation`) and the three test credentials (`john1@gmail.com`, `rupesh@city.gov`, `admin@city.gov`) are always created automatically with password hashing intact.

---

### 6.3 Authentication Middleware (`backend/middlewares/authMiddleware.js`)

Protects private routes and validates user roles.

```javascript
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found in DB (Token invalid or DB wiped)' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
```
- **Lines 4-13:** Reads the HTTP `Authorization` header (`Bearer <TOKEN>`). It decrypts the JSON Web Token using `jwt.verify`.
- **Line 12:** Extracts the user ID from the token payload and queries MongoDB to attach the user profile to `req.user`.
- **Lines 13-15:** Checks if `req.user` still exists in the database. If the database was restarted or the account deleted, it terminates the request cleanly with a `401 Unauthorized` instead of crashing subsequent functions with `Cannot read property of null`.

```javascript
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') return next();
  return res.status(401).json({ message: 'Not authorized as an admin' });
};

const officer = (req, res, next) => {
  if (req.user && (req.user.role === 'STAFF' || req.user.role === 'ADMIN')) return next();
  return res.status(401).json({ message: 'Not authorized as an officer' });
};
```
- **Lines 41-55:** Role-Based Access Control (RBAC). Restricts admin endpoints (like creating departments or viewing analytics) strictly to `role: 'ADMIN'`, and staff queues to `role: 'STAFF'` or `'ADMIN'`.

---

### 6.4 Authentication Controller (`backend/controllers/authController.js`)

Handles user registration, login, password comparison, and token creation.

- **`generateToken(id)`:** Encrypts the MongoDB document `_id` into a secure JWT valid for 30 days.
- **`registerUser(req, res)`:**
  1. Checks if the requested email is already registered (`User.findOne({ email })`).
  2. If the user registers as `'STAFF'`, it auto-generates a unique badge number (e.g. `OFF-4821`).
  3. Creates the user in MongoDB. The `User.pre('save')` hook automatically runs Bcrypt salt hashing on the plain-text password.
  4. Returns the created profile along with a newly generated JWT.
- **`authUser(req, res)`:**
  1. Finds the user by email, requesting the normally hidden password field (`.select('+password')`).
  2. Compares the submitted plain password against the hashed string using Bcrypt (`user.comparePassword(password)`).
  3. Calculates the user's age dynamically from their `dob` to trigger accessibility adaptations.
  4. Populates department information and sends back the user session.

---

### 6.5 Complaint Lifecycle Controller (`backend/controllers/complaintController.js`)

Manages the core business logic of civic tickets.

#### 1. Creating a Complaint (`createComplaint`)
```javascript
const complaintId = `COMP-${Date.now()}`;
let priority = 'Medium';
if (severity === 'high' || severity === 'critical') priority = 'High';
if (category === 'Public Safety') priority = 'High';
if (severity === 'critical') priority = 'Critical';
```
- Generates a human-readable docket ID (`COMP-1727442654`).
- Implements an automated priority engine based on severity and category.
- Writes the complaint record with latitude, longitude, and an initial audit milestone:
  `{ status: 'Submitted', remarks: 'Complaint submitted by citizen' }`.

#### 2. AI Complaint Analysis (`analyzeComplaint`)
```javascript
const { data } = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
    model: 'openai/gpt-oss-120b',
    response_format: { type: "json_object" },
    messages: [{ role: 'user', content: `${systemPrompt}\n\nInput: ${text}` }],
    temperature: 0
});
```
- Takes raw, informal citizen text (e.g., Hinglish or colloquial Telugu) and sends it to the LLM.
- Returns a structured JSON output:
  - `detected_language`: Identifies the source language (e.g. "Telugu (Transliterated)").
  - `translated_text`: Pure English equivalent.
  - `case_type`: Automatically categorized municipal sector.
  - `priority`: Urgent triage rating.
  - `report_description`: Formal, professional incident report for government documentation.

#### 3. Conversational AI Assistant (`voiceChat`)
- Powers the interactive voice assistant page.
- Implements a friendly 5-step conversational questionnaire:
  1. Problem Type -> 2. Specific Landmark -> 3. Problem Description -> 4. Severity -> 5. Media attachment.
- Explicitly guides citizens in a warm, helpful manner without intimidating police jargon.

---

### 6.6 AI Vision & Translation Engine (`backend/controllers/visionController.js`)

Provides computer vision and multi-lingual voice translation.

#### 1. Image Verification (`verifyImage`)
```javascript
const systemPrompt = `You are an expert AI civic grievance validator...
Response Requirement: You MUST respond in JSON format only: {"match": boolean, "reason": "short explanation"}.`;
```
- Accepts a Base64-encoded photo uploaded by the citizen.
- Uses Groq's multimodal vision model to determine whether the image corresponds to the claimed civic problem (e.g. verifying an asphalt pothole vs. an unrelated photo).
- **Critical Hackathon Fallback:**
  ```javascript
  catch (error) {
    return res.json({ 
      match: true, 
      reason: "Auto-verified (Vision AI currently offline/unsupported on this API key)." 
    });
  }
  ```
  If the API key runs out of vision quota or the model is temporarily unavailable, it automatically falls back to `match: true`, ensuring the user is never blocked from filing a complaint during a presentation!

#### 2. Resolution Proof Verification (`verifyCompletionProof`)
- When an officer claims they fixed a problem, they must submit an after-resolution photo.
- The AI checks if the photo shows that the issue has been cleared or repaired before allowing the ticket to transition to `Resolved`.

---

### 6.7 Admin Assignment & Analytics Controller (`backend/controllers/adminController.js`)

Powers the Administrator Management Console.

#### 1. Delegating Complaints (`assignComplaint`)
```javascript
complaint.assignedDepartmentId = departmentId;
complaint.assignedOfficerUserId = officerId;
complaint.status = 'Assigned';
complaint.statusHistory.push({
    status: 'Assigned',
    remarks: 'Grievance assigned to departmental staff for resolution.'
});
```
- Updates the ticket's assigned officer and department.
- Automatically increments the officer's `active_cases_count` so the admin can monitor officer workloads in real time.
- Records the state transition in the complaint's history.

#### 2. Real-Time Analytics (`getDashboardAnalytics`)
- Uses MongoDB Aggregation Pipelines to compute:
  - Distribution of complaints across departments and statuses.
  - Total volume and average resolution times.
  - Officer performance metrics (total assigned, total completed, average citizen satisfaction score).

---

### 6.8 Department Controller (`backend/controllers/departmentController.js`)
- `getDepartments`: Lists all municipal departments and populates their member officers.
- `createDepartment`: Creates a new department (e.g. "Public Health") with specific categories.
- `deleteDepartment`: Safely decommissions a department while resetting its assigned officers' `departmentId` to `null` to avoid orphaned references.

---

### 6.9 Staff Controller (`backend/controllers/staffController.js`)
- `getDashboardStats`: Calculates an officer's personal workload:
  - Total assigned cases.
  - Number of resolved cases.
  - Average citizen satisfaction rating (1.0 to 5.0 scale).
  - Breakdown of pending vs. completed work.

---

### 6.10 Official REPORT & PDF Engine (`backend/controllers/reportController.js`)
- `generateREPORT`: Converts a citizen's complaint into an official, formal municipal docket document (`REPORT-2026-XXXXX`).
- `downloadREPORTPdf`: Uses the **PDFKit** stream library to generate a downloadable PDF document on the fly, complete with incident timestamps, GPS coordinates, citizen details, and administrative remarks.

---

### 6.11 RAG Contextual Chat Assistant (`backend/controllers/chatController.js`)

Implements an intelligent chatbot accessible at the bottom-right of the dashboard:
1. **Intent Extraction:** The LLM reads the user's question and identifies the intent (e.g., `GET_COMPLAINT_DETAILS`, `SEARCH_COMPLAINTS`, `SYSTEM_STATS`).
2. **Database Retrieval:** Queries MongoDB for the relevant records based on the extracted intent.
3. **Response Generation:** Synthesizes the live database facts into an authoritative, natural-language response.

---

## 7. Frontend Architecture & Key Components

The frontend is a modern single-page application built with React and Vite.

### 7.1 Router & Page Structure (`frontend/src/App.jsx`)
- **Public Routes:**
  - `/` -> Landing page with features overview and hero graphics.
  - `/features`, `/how-it-works`, `/ai-intelligence` -> Explanatory product showcases.
  - `/login`, `/register` -> Authentication pages.
- **Role-Protected Routes:**
  - `/user/*` -> Citizen Dashboard (Submit Grievance, My Grievances, Interactive Map, Voice Assistant, Profile).
  - `/staff/*` -> Officer Dashboard (Assigned case queue, resolution controls, proof uploads).
  - `/admin/*` -> Admin Command Center (KPI counters, assignment modal, department configuration).

### 7.2 Interactive Geocoding & Map (`frontend/src/components/GrievanceMap.jsx`)
- Built using **Leaflet.js** and OpenStreetMap tiles.
- Allows citizens to click directly on the map to pinpoint an issue, or search by landmark/city name.
- Connects to the OpenStreetMap Nominatim API with automatic query formatting for Indian addresses.

### 7.3 Senior Citizen Adaptive UI
- If a user's age is greater than 50 (calculated from their `dob` at login), `App.jsx` automatically applies the `.adaptive-active` CSS class.
- Increases font sizes, heightens button contrast, and simplifies layouts to maximize accessibility for elderly citizens.

---

## 8. Setup, Deployment & Environment Variables

### 8.1 Environment Configuration (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cgmp?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_12345
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 8.2 Running Locally
1. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5000`*

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`*

### 8.3 Live Deployment
- **Repository:** `https://github.com/basheer123-ahmed/citizens_ai.git`
- **Render Live URL:** `https://citizens-ai-1.onrender.com/`

---

## 9. Troubleshooting & FAQ for Hackathon Demos

**Q1: What happens if our college Wi-Fi blocks MongoDB Atlas during the demo?**  
**Answer:** You don't have to worry! The backend automatically detects connection timeouts within 5 seconds and instantly boots an internal In-Memory MongoDB inside RAM. The server will not crash, and all three demo accounts (`john1@gmail.com`, `admin@city.gov`, `rupesh@city.gov`) will be auto-seeded automatically.

**Q2: What happens if Groq API rate limits our vision requests?**  
**Answer:** The vision controller includes an automatic fallback wrapper. If the Vision AI API is unreachable or rate-limited, it automatically marks the image as verified (`match: true`) so your demo continues smoothly without form submission blocks.

**Q3: Why doesn't the admin's name appear in the assignment dropdown?**  
**Answer:** In municipal hierarchy, administrators supervise and delegate tasks; only departmental staff officers (like Rupesh) are assigned to physical ground investigations.

**Q4: Why does the officer get an error if they click "Resolved" without typing notes?**  
**Answer:** The system strictly enforces municipal compliance: officers must provide written operational remarks documenting what physical action was taken before an incident docket can legally be marked resolved.
