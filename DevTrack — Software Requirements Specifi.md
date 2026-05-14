DevTrack — Software Requirements Specification (SRS)
📌 Project Title

DevTrack — Training Batch Management System

1. 📖 Project Description

DevTrack is a full-stack web application designed to manage developer training programs, coding bootcamps, and mentorship batches.

The system enables administrators and mentors to create training batches, assign developers, generate schedules, track attendance, manage assignments, and monitor trainee progress through analytics dashboards.

Developers can log into the platform to view schedules, attendance records, assignments, and submit project work.

The application aims to simplify training operations and provide centralized management for technical education programs.

2. 🎯 Project Objectives
Manage training batches efficiently
Automate training schedules
Track trainee attendance
Monitor developer performance
Manage assignments and submissions
Provide analytics dashboards
Support role-based authentication
3. 🧱 Tech Stack
Layer	Technology
Frontend	Next.js (React + TypeScript)
Backend	Django REST Framework
Database	PostgreSQL
Development Database	SQLite
Authentication	JWT Authentication
Styling	Tailwind CSS
API Communication	Axios / Fetch API
ORM	Django ORM
4. 👥 User Roles
A. Admin / Mentor

Can:

Manage batches
Manage developers
Generate schedules
Mark attendance
Create assignments
View analytics dashboard
Manage sessions
B. Developer / Trainee

Can:

View assigned batch
View schedule
View attendance
Submit assignments
View progress
5. 📦 Core Modules
Module 1 — Authentication System
Features
User registration
Login/logout
JWT authentication
Role-based access control
Protected routes
Backend APIs
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/profile
Module 2 — Batch Management
Features
Create batch
Update batch
Delete batch
Assign mentor
Configure training days
Set attendance target
Generate training calendar automatically
Fields
Field	Type
Batch Name	String
Mentor Name	String
Start Date	Date
End Date	Date
Duration	Integer
Training Days	Array
Attendance Target	Integer
APIs
GET    /api/batches
POST   /api/batches
GET    /api/batches/:id
PUT    /api/batches/:id
DELETE /api/batches/:id
Module 3 — Developer Management
Features
Add developer
Edit developer
Activate/deactivate developer
Assign developer to batch
Fields
Field	Type
Developer Code	String
Full Name	String
Email	String
Phone	String
Is Active	Boolean
APIs
GET    /api/developers
POST   /api/developers
GET    /api/developers/:id
PUT    /api/developers/:id
DELETE /api/developers/:id
Module 4 — Schedule Management
Features
Auto-generate class sessions
Create assignment sessions
View schedules
View upcoming classes
Session Types
Class Day
Assignment Day
Exam Day
APIs
GET  /api/sessions
POST /api/sessions/generate
GET  /api/sessions/:id
Module 5 — Attendance System
Features
Mark attendance
Edit attendance
Track attendance percentage
Leave management
Attendance Status
Present
Absent
Leave
APIs
GET  /api/attendance
POST /api/attendance
PUT  /api/attendance/:id
Module 6 — Assignment System
Features
Create assignments
Set deadlines
Submit GitHub/project links
Track submissions
APIs
GET    /api/assignments
POST   /api/assignments
POST   /api/submissions
GET    /api/submissions
Module 7 — Dashboard & Analytics
Admin Dashboard Displays
Total batches
Total developers
Attendance rate
Success rate
Attendance trends
Recent sessions
Developer Dashboard Displays
Attendance %
Upcoming classes
Pending assignments
Batch progress
6. 🗄️ Database Design
Table: Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Table: Batches
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    batch_name VARCHAR(255),
    mentor_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    duration_months INTEGER,
    attendance_target INTEGER
);
Table: Developers
CREATE TABLE developers (
    id SERIAL PRIMARY KEY,
    developer_code VARCHAR(50),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    batch_id INTEGER REFERENCES batches(id)
);
Table: Sessions
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id),
    session_date DATE,
    session_type VARCHAR(50),
    title VARCHAR(255)
);
Table: Attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    developer_id INTEGER REFERENCES developers(id),
    session_id INTEGER REFERENCES sessions(id),
    status VARCHAR(20)
);
Table: Assignments
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES batches(id),
    title VARCHAR(255),
    description TEXT,
    due_date DATE
);
Table: Submissions
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id),
    developer_id INTEGER REFERENCES developers(id),
    github_link TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
7. 🎨 Frontend Pages (Next.js)
Public Pages
Login Page
Register Page
Admin Pages
Dashboard
Batches List
Create Batch
Batch Details
Developers List
Add Developer
Attendance Page
Schedule Page
Assignments Page
Developer Pages
Developer Dashboard
My Schedule
My Attendance
My Assignments
My Profile
8. 🔐 Authentication Flow
JWT Flow
1. User logs in
2. Backend validates credentials
3. Backend returns JWT token
4. Frontend stores token
5. Protected routes use token
6. API requests include Authorization header
9. 🧩 Suggested Django Apps Structure
backend/
│
├── accounts/
├── batches/
├── developers/
├── attendance/
├── schedules/
├── assignments/
├── dashboard/
10. 📁 Suggested Next.js Structure
frontend/
│
├── app/
├── components/
├── services/
├── hooks/
├── store/
├── types/
├── utils/
├── middleware.ts
11. 🚀 Key Features to Impress Recruiters
Role-based authentication
REST API architecture
Dashboard analytics
Dynamic schedule generation
Attendance calculations
Responsive UI
Clean database relationships
Full CRUD operations
JWT authentication
Real-world workflow system
12. 📌 Future Enhancements
Email notifications
QR attendance system
Real-time chat
Certificate generation
AI analytics
Mobile app
Docker deployment
CI/CD pipeline
13. ✅ Development Phases
Phase 1
Authentication
Database setup
Basic CRUD
Phase 2
Batch management
Developer management
Schedule generation
Phase 3
Attendance system
Assignment system
Phase 4
Dashboard analytics
UI improvements
Phase 5
Deployment & testing

Build a full-stack Training Batch Management System called DevTrack using:

Frontend:

* Next.js 15 with TypeScript
* Tailwind CSS
* App Router

Backend:

* Django REST Framework
* JWT Authentication

Database:

* PostgreSQL

Features:

* Role-based authentication (Admin and Developer)
* Batch CRUD operations
* Developer CRUD operations
* Auto-generated training schedules
* Attendance management
* Assignment management
* Dashboard analytics
* Responsive UI

Requirements:

* Clean architecture
* Reusable components
* RESTful APIs
* Proper folder structure
* Error handling
* Form validation
* Protected routes
* Loading states
* Pagination
* Search and filtering

Generate:

* Models
* Serializers
* Views
* API routes
* React pages/components
* Database schema
* Authentication flow
* Dashboard UI
* API integration
* Full CRUD functionality
