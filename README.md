# 🚀 ProjectBuddy — Student Project Partner Matching Platform

> **The verified "LinkedIn for Students" with Zero-Knowledge Idea Protection & Anonymous Administrative Auditing.**

---

## 🌟 Core Concepts

1. **Anti-Theft Idea Vault (Idea Hiding)**:
   - When a student posts an idea, **only the project title, department, difficulty, and required skills are publicly visible**.
   - The detailed idea description and architecture blueprint are **100% encrypted & hidden**.
   - The full idea is only unlocked and revealed **after the project creator formally reviews and accepts a partnership proposal**.

2. **Anonymous Administrative Monitoring (Zero-Knowledge Audit)**:
   - Administrators oversee platform safety and account activity **completely anonymously**.
   - All personal student identifiers (**real legal names, contact emails, private ideation drafts**) are mathematically scrubbed and replaced with anonymous tokens (e.g. `STU_849201`).
   - Admins can monitor engagement patterns, track project volumes, and suspend/warn bad actors **without knowing user personal identities**.

3. **Interactive Collaboration Room & Real-time Partner Chat**:
   - Once a partnership proposal is accepted, teammates unlock a **dedicated Collaboration Workspace**.
   - Includes real-time direct partner messaging stream, milestone checklists, and verified mutual commitment agreements.

4. **Skill-Match Engine**:
   - Dynamic algorithm calculates compatibility percentages (e.g., `⚡ 92% Skill Match`) between student profiles and project tech stacks.

5. **Watchlist & Bookmarks**:
   - Save interesting projects to your personal watchlist to review and send proposals later.

---

## 🗄️ Backend & Database Architecture

Built with **Node.js**, **Express**, and **MongoDB (Mongoose)**:

```
c:\project\
├── config/
│   └── db.js                 # MongoDB Mongoose connection handler
├── models/
│   ├── User.js               # User schema (roles, skills, anonToken, bookmarks, bcrypt)
│   ├── Project.js            # Project schema (title, encrypted description, tech stack, reports)
│   ├── Request.js            # Partnership proposal schema (accept/decline state)
│   ├── Announcement.js       # Sitewide broadcast alert schema
│   └── CollaborationMessage.js # Real-time partner chat message schema
├── routes/
│   ├── auth.js               # JWT registration, login, session endpoint
│   ├── users.js              # User profile CRUD & stats
│   ├── projects.js           # Project catalog, bookmarks, idea masking, reports, chat
│   ├── requests.js           # Send, accept, decline partnership proposals
│   └── admin.js              # Anonymous account audit, platform metrics, moderation
├── middleware/
│   └── auth.js               # JWT bearer verification & adminOnly access control
├── server.js                 # Express server entry point (port 5000)
├── seed.js                   # Database seed script (npm run seed)
├── package.json              # Backend dependencies
├── .env                      # Environment configuration
├── index.html                # Modern responsive Single Page App
├── style.css                 # Clean LinkedIn-inspired UI styling
└── app.js                    # Intelligent dual-mode client controller
```

---

## 📡 REST API Endpoints Summary

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a verified student account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve active authenticated user

### 📁 Projects (`/api/projects`)
- `GET /api/projects` — Get projects (Descriptions scrubbed for non-partners)
- `POST /api/projects` — Create project with protected blueprint
- `GET /api/projects/:id` — View project details (Checks partner access)
- `POST /api/projects/:id/bookmark` — Toggle save to student watchlist
- `POST /api/projects/:id/report` — Report title to Anonymous Moderation
- `GET /api/projects/:id/messages` — Get partner collaboration chat messages
- `POST /api/projects/:id/messages` — Send partner collaboration chat message

### 🤝 Partnership Proposals (`/api/requests`)
- `POST /api/requests` — Dispatch partnership inquiry
- `GET /api/requests/received` — Inquiries awaiting approval
- `PUT /api/requests/:id` — Accept (reveals full blueprint) or decline

### 🛡️ Anonymous Administration (`/api/admin`)
- `GET /api/admin/metrics` — Sitewide KPI metrics (students, ideas, health)
- `GET /api/admin/accounts/anonymous` — **Anonymous Student Telemetry Audit** (Zero PII, returns tokens `STU_#`, department, metrics)
- `PATCH /api/admin/accounts/:id/status` — Suspend or restore accounts anonymously
- `POST /api/admin/announcements` — Broadcast alert to all student screens
- `DELETE /api/admin/projects/:id` — Moderate & remove violating project titles

---

## 🚀 How to Run

### Method 1: Instant Browser Test (Zero Setup)
Simply open [`index.html`](file:///c:/project/index.html) in your browser. Real students can register and post projects immediately.

### Method 2: Running with Node.js & MongoDB Server
When Node.js & MongoDB are installed on your environment:

```bash
# 1. Install dependencies
npm install

# 2. Initialize administrator account (Zero bot accounts)
npm run seed

# 3. Start the server
npm start
```
The server will start at `http://localhost:5000`.

---

## 🔑 Administrative Access

| Role | Email | Password | Access Details |
|---|---|---|---|
| **Administrator** | `admin@projectbuddy.edu` | `admin123` | Full control console with zero-knowledge anonymous student monitoring |

Students can create their own accounts via the **"Join Now"** registration form.
