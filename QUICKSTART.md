# Development Quick Start Guide

## Prerequisites
- Python 3.11+ with venv
- Node.js 20+ with npm
- Django 6 backend running on port 8000
- Vite frontend running on port 5173+

---

## Starting the Servers

### Backend (Django)
```bash
cd backend
source venv/Scripts/activate  # Windows: venv\Scripts\activate
python manage.py runserver 8000
```
- **API Base:** http://127.0.0.1:8000/api/v1
- **Admin Panel:** http://127.0.0.1:8000/admin
- **Credentials:** admin@bakery.com / admin1234

### Frontend (Vite)
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- **App:** http://127.0.0.1:5173
- **Test Login:** manager@bakery.com / demo1234

---

## Configuration

### Frontend (`.env.local`)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Backend (running migrations if needed)
```bash
python manage.py migrate
python manage.py seed_data  # Load sample data
```

---

## Key Endpoints

### Authentication
```
POST   /auth/login/        - Login (email, password)
POST   /auth/refresh/      - Refresh access token
POST   /auth/logout/       - Logout
```

### Products
```
GET    /products/          - List all products
PUT    /products/{id}/     - Update product
```

### Sales
```
GET    /sales/             - List sales
POST   /sales/             - Create sale
```

### Wastage
```
GET    /wastage/           - List wastage records
POST   /wastage/           - Record wastage
```

### Users (admin-only)
```
GET    /users/             - List users
POST   /users/             - Create user
PUT    /users/{id}/        - Update user
POST   /users/{id}/toggle_status/   - Enable/disable user
```

### Reports
```
GET    /reports/dashboard/  - Dashboard KPIs
GET    /reports/sales/      - Sales report (by date, payment, category)
GET    /reports/wastage/    - Wastage report (trend, products, reasons)
```

---

## Testing

### Run Integration Test
```bash
cd backend
python integration_test.py
```
Validates: Login → Products → Sale (with stock auto-decrement)

### Run Frontend Build
```bash
cd frontend
npm run build
```
Outputs to `frontend/dist/` for production deployment

---

## Architecture Overview

### Frontend Stack
- React 19 + TypeScript + Vite
- TanStack Router + Query for state/data
- Tailwind + Radix UI for components
- Zod for validation
- Axios for HTTP client

### Backend Stack
- Django 6 + Django REST Framework
- SimpleJWT for authentication
- PostgreSQL (or SQLite for dev)
- Celery for async tasks

### Authentication
- JWT tokens with 8-hour expiry
- Auto-refresh via axios interceptor
- Token stored in localStorage
- Role-based access control (admin, manager, salesperson)

---

## Development Workflow

### Adding a New API Endpoint
1. Create serializer in backend `apps/{module}/serializers.py`
2. Create viewset in `apps/{module}/views.py`
3. Add to `apps/{module}/urls.py`
4. Add function to `frontend/src/services/api.ts`
5. Export through the `api` object inside `frontend/src/services/api.ts`
6. Use in frontend with `useQuery` / `useMutation`

### Modifying Backend Models
```bash
python manage.py makemigrations
python manage.py migrate
```

### Common Issues

**"401 Unauthorized"**
- Token expired; manually refresh or logout/login
- Check localStorage for `bakery_auth_v2`

**"403 Forbidden"**
- User lacks permission for endpoint
- Check user role (admin, manager, salesperson)

**"CORS Error"**
- Backend CORS not configured for frontend origin
- Update `CORS_ALLOWED_ORIGINS` in `bakery_hq/settings.py`

**"API_BASE_URL undefined"**
- Missing `.env.local` with `VITE_API_BASE_URL`
- Create file and restart Vite dev server

---

## Debugging

### View Network Requests
- Open browser DevTools (F12)
- Network tab shows all API calls
- Check request/response headers + body

### Check Backend Logs
- Terminal where Django is running shows request logs
- Use Python `print()` or `logger.debug()` in views

### React Query DevTools
- Add `@tanstack/react-query-devtools` package
- Inspect query state + refetch manually

---

## Production Deployment

1. Update `VITE_API_BASE_URL` to production backend URL
2. Run `npm run build`
3. Deploy `dist/` to static hosting (Vercel, Netlify, AWS S3, etc.)
4. Configure backend for production:
   - Set `DEBUG=False`
   - Use production database
   - Configure CORS for production domains
   - Enable HTTPS + secure cookies

---

## Support

For integration issues, check:
- [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md) — Full technical summary
- [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) — Backend setup details
- Backend logs in `backend/logs/` folder
- Frontend console (DevTools) for errors

---

**Last Updated:** May 31, 2026  
**Status:** Production-Ready ✅
