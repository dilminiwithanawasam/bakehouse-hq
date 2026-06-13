# Bakehouse HQ

A fullstack bakery management app with Django DRF backend and React + Vite frontend.

## Project status

- Backend: Django + Django REST Framework with JWT auth, accounts, sales, inventory, dispatch, and reporting.
- Frontend: React + Vite + TypeScript + TanStack Router.
- Verified:
  - `python manage.py test` ✅
  - `cd frontend && npm run build` ✅
  - `cd frontend && npm run lint` ✅

## Installation

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
```

### Frontend

```powershell
cd frontend
npm install
```

## Run locally

### Start backend

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

### Start frontend

```powershell
cd frontend
npm run dev
```

The frontend should connect to the backend API under `/api/v1/`.

## Testing

### Backend tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py test
```

### Frontend lint

```powershell
cd frontend
npm run lint
```

### Frontend formatting

```powershell
cd frontend
npm run format
```

## Notable files

- `backend/apps/products/models.py` — dispatch and inventory behavior
- `backend/apps/products/serializers.py` — dispatch/dispatch request serializers
- `backend/apps/products/views.py` — dispatch endpoints
- `frontend/src/routes/app.index.tsx` — route redirect component
- `frontend/eslint.config.js` — frontend lint configuration

## Notes

- The frontend build and backend test suite are both passing.
- ESLint is configured to support the codebase constraints used in this project.
