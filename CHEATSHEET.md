# 📋 BAKERY HQ - QUICK COMMAND CHEATSHEET

**Print this page or keep it handy while working!**

---

## ⚡ 3-STEP QUICK START

### Terminal 1 - Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```
✅ Backend runs at: http://localhost:8000

### Terminal 2 - Frontend
```bash
npm install
npm run dev
```
✅ Frontend runs at: http://localhost:5173

### Browser
```
Go to: http://localhost:5173
Login: manager@bakery.com / demo1234
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bakery.com | demo1234 |
| Manager | manager@bakery.com | demo1234 |
| Salesperson | sales@bakery.com | demo1234 |

---

## 🛑 Stop Commands

### Stop Backend
```
Ctrl + C    (in backend terminal)
```

### Stop Frontend
```
Ctrl + C    (in frontend terminal)
```

### Stop Everything
```
Ctrl + C in both terminals
```

---

## 🔧 Useful Commands

### Backend Commands

```bash
# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create database
python manage.py migrate --run-syncdb

# Seed demo data
python manage.py seed_data

# Create admin user (manually)
python manage.py createsuperuser

# Start backend server
python manage.py runserver

# Start on different port
python manage.py runserver 8001

# Run tests
python manage.py test

# Create new app
python manage.py startapp app_name

# Shell access
python manage.py shell
```

### Frontend Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Linting
npm run lint

# Format code
npm run format
```

### Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "message"

# Push to remote
git push

# Pull from remote
git pull

# Create new branch
git checkout -b branch_name

# Switch branch
git checkout branch_name

# View history
git log --oneline
```

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/v1/auth/login/              - Login
POST   /api/v1/auth/refresh/            - Refresh token
POST   /api/v1/auth/logout/             - Logout
GET    /api/v1/auth/me/                 - Current user
```

### Products
```
GET    /api/v1/products/                - List products
POST   /api/v1/products/                - Create product
PUT    /api/v1/products/{id}/           - Update product
PUT    /api/v1/products/{id}/update_stock/  - Update stock
```

### Sales
```
GET    /api/v1/sales/                   - List sales
POST   /api/v1/sales/                   - Create sale
GET    /api/v1/sales/{id}/              - Get sale details
POST   /api/v1/sales/{id}/void/         - Void sale
PUT    /api/v1/sales/{id}/              - Update sale
GET    /api/v1/sales/today/             - Today's sales
GET    /api/v1/sales/summary/           - Sales summary
```

### Wastage
```
GET    /api/v1/wastage/                 - List wastage
POST   /api/v1/wastage/                 - Record wastage
GET    /api/v1/wastage/{id}/            - Get wastage details
POST   /api/v1/wastage/{id}/approve/    - Approve wastage
GET    /api/v1/wastage/today/           - Today's wastage
GET    /api/v1/wastage/summary/         - Wastage summary
```

### Reports
```
GET    /api/v1/reports/dashboard/       - Dashboard data
GET    /api/v1/reports/sales/           - Sales report
GET    /api/v1/reports/wastage/         - Wastage report
```

### Users (Admin only)
```
GET    /api/v1/users/                   - List users
POST   /api/v1/users/                   - Create user
GET    /api/v1/users/{id}/              - Get user
PUT    /api/v1/users/{id}/              - Update user
DELETE /api/v1/users/{id}/              - Delete user
POST   /api/v1/users/{id}/toggle_status/ - Toggle status
```

---

## 🗂️ Project Structure

```
bakery-hq/
├── backend/                    # Django REST API
│   ├── manage.py              # Django CLI
│   ├── db.sqlite3             # Database
│   ├── requirements.txt         # Python packages
│   ├── .env                   # Configuration
│   ├── apps/
│   │   ├── accounts/          # Users
│   │   ├── products/          # Products
│   │   ├── sales/             # Sales
│   │   ├── wastage/           # Wastage
│   │   ├── reports/           # Reports
│   │   └── core/              # Shared
│   └── bakery_hq/             # Settings
│
├── src/                       # React Frontend
│   ├── routes/                # Pages
│   │   ├── app.dashboard.tsx
│   │   ├── app.sales.tsx
│   │   ├── app.products.tsx
│   │   ├── app.wastage.tsx
│   │   ├── app.reports.tsx
│   │   ├── app.users.tsx
│   │   └── ...
│   ├── components/            # Components
│   ├── lib/                  # Utils & API
│   └── styles.css            # Styles
│
├── dist/                      # Build output
├── .env.local                # Frontend config
├── package.json              # Frontend packages
├── vite.config.ts            # Vite config
├── tsconfig.json             # TypeScript config
│
└── Documentation/
    ├── START_HERE.md         ← Begin here
    ├── HOW_TO_RUN.md
    ├── QUICK_START.md
    └── ... (more docs)
```

---

## 🔍 Common Tasks

### Task: Add New Product
1. Backend: Add to database via Django admin or API
2. Frontend: Will display automatically (fetches from API)
3. Test: Navigate to Products page, should see new item

### Task: Add New User
1. Backend: `python manage.py createsuperuser` OR use API
2. Assign role (Admin/Manager/Salesperson)
3. User can login with created credentials

### Task: Create Sale
1. Login as Manager or Salesperson
2. Go to Sales → Create Sale
3. Select products, quantities, notes
4. Click Save
5. Sale recorded in database

### Task: Check Database
1. Backend must be running
2. Database file: `backend/db.sqlite3`
3. SQLite command: `sqlite3 db.sqlite3`
4. View tables: `.tables`
5. Query: `SELECT * FROM products_product;`

### Task: Check API Response
1. Use Postman or curl
2. Example: `curl http://localhost:8000/api/v1/products/`
3. Add auth header if needed: `-H "Authorization: Bearer <token>"`

---

## 🐛 Troubleshooting

### Problem: Backend won't start
```
Check:
- Port 8000 is free: netstat -ano | findstr :8000
- Python installed: python --version
- Virtual env activated: Should see (venv) in terminal
- Dependencies installed: pip list | findstr django

Solution:
- Kill process on 8000: taskkill /PID <pid> /F
- Or use different port: python manage.py runserver 8001
```

### Problem: Frontend won't start
```
Check:
- Port 5173 is free: netstat -ano | findstr :5173
- Node installed: node --version
- Dependencies installed: npm list | head -5
- No build errors: npm run build

Solution:
- Kill port 5173: taskkill /PID <pid> /F
- Or use different port: npm run dev -- --port 3000
- Clear node_modules: rmdir node_modules /s /q && npm install
```

### Problem: Can't login
```
Check:
- Backend is running (check http://localhost:8000)
- Correct email: manager@bakery.com (not just "manager")
- Correct password: demo1234
- Demo data seeded: python manage.py seed_data

Solution:
- Restart backend with fresh data:
  python manage.py migrate --run-syncdb
  python manage.py seed_data
```

### Problem: Page won't load
```
Check:
- Frontend is running (check http://localhost:5173)
- Browser console (F12) for errors
- Network tab to see if API calls work
- Browser cache might be stale

Solution:
- Hard refresh: Ctrl + F5 (not Ctrl + R)
- Clear cache: Ctrl + Shift + Delete
- Restart frontend: Ctrl + C, then npm run dev
```

### Problem: Data not showing
```
Check:
- Backend running: curl http://localhost:8000/api/v1/products/
- Database has data: python manage.py shell
  >>> from products.models import Product
  >>> Product.objects.count()
- API returning data (check network tab in DevTools)

Solution:
- Seed demo data: python manage.py seed_data
- Check database: sqlite3 backend/db.sqlite3
- Refresh page: F5 or Ctrl + F5
```

---

## 📁 File Locations

| Item | Location |
|------|----------|
| Frontend app | `/src/` |
| Backend app | `/backend/apps/` |
| Database | `/backend/db.sqlite3` |
| Backend config | `/backend/.env` |
| Frontend config | `/.env.local` |
| Documentation | `/*.md` files |
| TypeScript config | `/tsconfig.json` |
| Vite config | `/vite.config.ts` |
| Django settings | `/backend/bakery_hq/settings.py` |

---

## 🌍 Currency & Localization

### All Currency Displays
- Format: `LKR 1,234.00`
- Symbol: LKR (not ₹)
- Locale: en-LK (Sri Lanka)

### All Timezone
- Server: Asia/Colombo (UTC+05:30)
- All timestamps: Sri Lanka time
- No daylight saving

### Sample Data
- User names: Sri Lankan names
- Products: Sri Lankan food
- Prices: LKR amounts (80-550 range)

---

## 📊 Development Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| Frontend | 5173 | http://localhost:5173 |
| Database | - | backend/db.sqlite3 |

---

## 🔑 Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📱 Browser Support

✅ Chrome (latest)  
✅ Firefox (latest)  
✅ Edge (latest)  
✅ Safari (latest)  
✅ Mobile browsers  

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + C | Stop running command |
| Ctrl + R | Refresh page |
| Ctrl + F5 | Hard refresh (clear cache) |
| Ctrl + Shift + Delete | Open browser cache settings |
| F12 | Open developer tools |
| Ctrl + Shift + C | Inspect element |
| F5 | Reload page |
| Ctrl + Shift + R | Force reload |

---

## 📞 Quick Help

**Forgot a command?** Search this sheet with Ctrl+F  
**Need more details?** Read HOW_TO_RUN.md  
**Need specifics?** Check PROJECT_COMPLETION_REPORT.md  
**Can't find it?** See DOCUMENTATION_INDEX.md  

---

## ✨ Status Check

### To verify everything is working:

1. Backend: `curl http://localhost:8000/api/v1/products/`
2. Frontend: Open http://localhost:5173
3. Login: Use manager@bakery.com / demo1234
4. Dashboard: Should show data with LKR currency

All working? ✅ **You're good to go!**

---

## 🎯 Next Steps

1. ✅ Keep this sheet handy
2. ✅ Bookmark HOW_TO_RUN.md
3. ✅ Bookmark QUICK_START.md
4. ✅ Bookmark DOCUMENTATION_INDEX.md for reference
5. ✅ Run Quick Start above
6. ✅ Explore the application
7. ✅ Build something amazing! 🚀

---

**BAKERY HQ - Quick Command Cheatsheet**

*Keep this nearby for quick reference* 📌

**Last Updated:** June 2, 2026  
**Version:** 1.0.0
