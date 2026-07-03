# 🗓️ Smart Life Scheduler

An AI-powered full-stack productivity platform that combines task management, fitness tracking, gamification, and adaptive scheduling — helping users plan, track, and optimize their daily lives in one place.

🔗 **Live Demo:** [smart-life-scheduler.vercel.app](https://smart-life-scheduler.vercel.app/)

---

## ✨ Features

- **Smart Task Management** — Create, organize, and reschedule tasks with drag-and-drop boards
- **AI Assistant** — Chat-based AI coach powered by Google Gemini for planning help and suggestions
- **Adaptive Rescheduling** — Background jobs automatically re-plan your day based on behavior and missed tasks
- **Intelligence Engine** — Behavior, health, and scoring engines generate personalized insights and reports
- **Fitness Tracking** — Dedicated trackers for workouts, sleep, steps, water intake, weight, and habits
- **Notes** — Quick notes and short notes for capturing ideas on the fly
- **Gamification** — Streaks, scores, and rewards to keep users motivated
- **Analytics & Reports** — Visual dashboards (via Chart.js / Recharts) summarizing productivity and health trends
- **Google OAuth Login** — Secure sign-in alongside standard email/password auth (JWT-based)

---

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- React Router
- Chart.js / Recharts (data visualization)
- Framer Motion (animations)
- @hello-pangea/dnd (drag-and-drop)
- @react-oauth/google (Google Sign-In)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication with bcrypt password hashing
- Google Generative AI (Gemini) for the AI Assistant
- node-cron for scheduled/background jobs
- Helmet + express-rate-limit for security
- Winston for logging

**Deployment**
- Frontend hosted on Vercel

---

## 📁 Project Structure

```
Major-Project/
├── smart-life-scheduler-backend/
│   ├── controllers/       # Route logic (auth, tasks, fitness, AI, notes, intelligence)
│   ├── models/             # Mongoose schemas (User, Task, Habit, WorkoutLog, etc.)
│   ├── routes/              # Express route definitions
│   ├── intelligence/       # Adaptive rescheduler, behavior/health/scoring engines
│   ├── services/            # AI scheduling, analytics, gamification, sync services
│   ├── middleware/         # Auth guards, rate limiting, error handling
│   ├── Jobs/                  # Cron jobs (e.g. auto-rescheduler)
│   └── server.js              # App entry point
│
└── smart-life-scheduler-frontend/
    ├── src/
    │   ├── pages/            # Tasks, Health, Analytics, Notes, AI Assistant, Reports, Profile
    │   ├── components/    # Sidebar, Layout, TaskItem, AddTaskModal, FitnessTracker/, etc.
    │   ├── api.js              # Axios API client
    │   └── App.jsx
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local instance or a MongoDB Atlas connection string)
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone the repository
```bash
git clone https://github.com/Saathvik77/Major-Project.git
cd Major-Project
```

### 2. Set up the backend
```bash
cd smart-life-scheduler-backend
npm install
```

Create a `.env` file in `smart-life-scheduler-backend/` with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
GITHUB_CLIENT_SECRET=your_github_oauth_secret   # if using GitHub-based auth flows
```

Run the backend:
```bash
npm run dev      # development (with nodemon)
npm start        # production
```

### 3. Set up the frontend
```bash
cd ../smart-life-scheduler-frontend
npm install
```

Create a `.env` file in `smart-life-scheduler-frontend/` with:
```env
VITE_API_URL=http://localhost:5000
```

Run the frontend:
```bash
npm run dev
```

The app should now be running locally, with the frontend on Vite's default port and the API on port `5000`.

---

## 📡 API Overview

| Route | Purpose |
|---|---|
| `/api/auth` | Registration, login, Google OAuth |
| `/api/tasks` | Task CRUD and scheduling |
| `/api/intelligence` | AI-driven scheduling insights |
| `/api/intelligence/history` | Historical intelligence reports |
| `/api/ai` | AI Assistant / chatbot |
| `/api/notes` | Notes and short notes |
| `/api/fitness` | Workouts, sleep, steps, water, weight, habits |
| `/api/sync` | Data sync utilities |
| `/api/gamification` | Streaks, scores, rewards |
| `/api/health` | Server/DB health check |

---

## 👥 Contributors

- [Saathvik Dandi](https://github.com/Saathvik77)
- [Nettu Pehlaj](https://github.com/Thbny)

---

## 📄 License

No license file is currently included in this repository. Add one (e.g. MIT) if you intend for others to reuse this code.
