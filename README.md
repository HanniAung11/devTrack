# DevTrack — Training Batch Management System

Full-stack app: **Django REST Framework** backend + **Next.js (App Router)** frontend.

## URLs (important)

Next.js cannot serve two different pages at the same path (e.g. two `/dashboard` routes). This project uses:

- **Admin UI:** `/admin/*` (e.g. `/admin/dashboard`, `/admin/batches`)
- **Developer UI:** `/developer/*` (e.g. `/developer/dashboard`)
- **Auth:** `/login`, `/register`

## Backend

- Path: `backend/`
- Django project package: **`config`** (`config/settings.py`, `config/urls.py`)
- Database: **SQLite** by default; set `DATABASE_ENGINE=postgres` and `POSTGRES_*` for PostgreSQL
- API base: `http://127.0.0.1:8000`

### Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Auth endpoints (trailing slash)

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register/` | Body: `full_name`, `email`, `password`, `confirm_password`, `role` (`ADMIN` \| `DEVELOPER`). Creates **Developer** profile when role is `DEVELOPER`. |
| POST | `/api/auth/login/` | Body: `email`, `password` |
| POST | `/api/auth/logout/` | Body: `refresh` (refresh token); works without valid access token |
| POST | `/api/auth/token/refresh/` | SimpleJWT refresh |
| GET/PUT | `/api/auth/profile/` | GET/PUT user + developer info |
| GET | `/api/auth/mentors/` | List admin users (mentor picker) |

Other API routes: `/api/batches/`, `/api/developers/`, `/api/sessions/`, `/api/sessions/generate/`, `/api/attendance/`, `/api/assignments/`, `/api/assignments/submissions/`, `/api/dashboard/admin/`, `/api/dashboard/developer/` (all paginated with `?page=` except mentors).

## Frontend

- Path: `frontend/`
- **Sign in** uses **email + password** (matches `CustomUser.USERNAME_FIELD = email`).
- **Zustand** persists auth; **cookies** (`accessToken`, `refreshToken`, `role`) are set for **middleware** role guards.
- Copy `frontend/.env.local.example` → `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Creating an admin for testing

1. Register with role **Admin / Mentor** on `/register`, or  
2. `python manage.py createsuperuser` then in Django admin set `role` to `ADMIN` for that user.

## Tech notes

- **django-filter**, **DRF** search/order on ViewSets, **IsAuthenticated** for reads / **ADMIN** for writes (custom permission).
- **Whitenoise** for static files in production.
- UI: Tailwind v4, Radix-based components, **Recharts** on dashboards, **React Hook Form + Zod** on auth and batch create.
