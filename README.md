# Yarana LifeOS 🚀

**Your Personal Life Operating System** — A full-stack SaaS application for managing daily tasks, clients, finances, and personal growth all in one place.

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router) + TypeScript |
| **Styling** | Tailwind CSS v4 + Custom Design System |
| **State** | Zustand (auth) + React Query (server state) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL (via XAMPP) |
| **Auth** | JWT (mobile number + password) |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **PWA** | manifest.json + service worker |
| **Reminders** | node-cron (every minute) |

---

## 📁 Project Structure

```
yarana-lifeos/
├── backend/                    # Express.js API
│   └── src/
│       ├── config/
│       │   ├── database.js     # MySQL connection pool
│       │   └── setupDatabase.js # DB schema creator
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── dashboardController.js
│       │   ├── taskController.js
│       │   ├── clientController.js
│       │   ├── ledgerController.js
│       │   └── noteController.js
│       ├── middleware/
│       │   └── auth.js         # JWT verification
│       ├── routes/
│       │   ├── auth.js
│       │   ├── dashboard.js
│       │   ├── tasks.js
│       │   ├── clients.js
│       │   ├── ledger.js
│       │   └── notes.js
│       ├── jobs/
│       │   └── reminderJob.js  # Cron-based push notifications
│       └── server.js           # Express entry point
│
└── frontend/                   # Next.js App
    └── src/
        ├── app/
        │   ├── login/page.tsx
        │   ├── register/page.tsx
        │   ├── dashboard/page.tsx
        │   ├── tasks/page.tsx
        │   ├── clients/page.tsx
        │   ├── ledger/page.tsx
        │   └── notes/page.tsx
        ├── components/
        │   └── layout/
        │       ├── AppLayout.tsx  # Sidebar + topbar
        │       └── Providers.tsx  # React Query + Toasts
        ├── lib/
        │   └── api.ts             # Axios client
        └── store/
            └── authStore.ts       # Zustand auth store
```

---

## 🚀 Getting Started

### Prerequisites
- XAMPP running (MySQL on port 3306)
- Node.js 18+
- npm

### 1. Database Setup
```bash
cd backend
npm install
node src/config/setupDatabase.js
```

### 2. Start Backend (port 5050)
```bash
cd backend
npm run dev
```

### 3. Start Frontend (port 3007)
```bash
cd frontend
npm run dev -- --port 3007
```

### 4. Open the app
Go to: **http://localhost:3007**

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/fcm-token` | Update FCM token |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filters: date, status, priority, search) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/toggle` | Toggle status |
| DELETE | `/api/tasks/:id` | Delete task |

### Clients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List clients |
| GET | `/api/clients/stats` | Client stats |
| POST | `/api/clients` | Add client |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |

### Ledger
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ledger` | List entries |
| GET | `/api/ledger/summary` | Total lena/dena |
| POST | `/api/ledger` | Add entry |
| PATCH | `/api/ledger/:id/settle` | Mark settled |
| DELETE | `/api/ledger/:id` | Delete entry |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List notes |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

---

## 🔥 Firebase FCM Setup (Optional)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Download service account JSON
4. Update `backend/.env` with Firebase credentials
5. Update `frontend/.env.local` with Firebase web config

---

## 📱 PWA Installation

The app supports "Add to Home Screen" on mobile:
- Open in Chrome/Safari
- Tap Share → Add to Home Screen

---

## 🗃️ Database Schema

- **users** — Authentication (mobile + password)
- **tasks** — Daily task manager with reminders
- **clients** — Client CRM with payment tracking
- **ledger** — Hisaab Kitab (credit/debit tracking)
- **notes** — Personal notes with lock & categories
- **reminders** — Scheduled push notification queue

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```
PORT=5050
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=yarana_lifeos
JWT_SECRET=your-secret
FRONTEND_URL=http://localhost:3007
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
NEXT_PUBLIC_APP_NAME=Yarana LifeOS
```

---

*Yarana LifeOS v1.0 — Built with ❤️*
