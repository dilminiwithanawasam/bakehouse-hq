# 🎂 Bakery HQ - Beginner's Guide to Running the Project

Welcome! This guide will teach you how to run the Bakery HQ application step-by-step. No technical knowledge required!

## What is Bakery HQ?

Bakery HQ is a simple application that helps bakeries manage their:
- **Sales** - Track what customers buy
- **Stock** - Keep track of inventory
- **Wastage** - Record spoiled or unsold items
- **Users** - Create logins for staff members
- **Reports** - See business statistics and trends

The application has two parts:
1. **Backend** - The "brain" that stores data and does calculations (built with Django/Python)
2. **Frontend** - The "face" that you see in your browser (built with React/TypeScript)

---

## Part 1: Installing Required Software

### Step 1.1: Install Python

Python is the programming language used by the backend.

**On Windows:**
1. Go to https://www.python.org/downloads/
2. Click "Download Python 3.13" (or latest 3.x version)
3. Run the installer
4. **IMPORTANT:** Check the box "Add Python to PATH" before clicking Install
5. Click "Install Now"
6. Wait for installation to complete

**Verify Python is installed:**
- Open Command Prompt (Windows key + R, type `cmd`)
- Type: `python --version`
- You should see something like: `Python 3.13.7`

### Step 1.2: Install Node.js

Node.js is required to build and run the frontend.

1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Click "Next" through all screens
5. At the end, check all optional tools boxes
6. Click "Install"
7. Wait for installation to complete

**Verify Node.js is installed:**
- Open Command Prompt again
- Type: `node --version`
- You should see something like: `v20.19.6`

### Step 1.3: Install Git (Optional, but recommended)

Git helps you manage code versions.

1. Go to https://git-scm.com/download/win
2. Download and run the installer
3. Click "Next" through all screens using default options
4. Click "Install"

---

## Part 2: Setting Up the Project

### Step 2.1: Extract or Clone the Project

If you have a ZIP file:
1. Right-click the ZIP file
2. Click "Extract All..."
3. Choose a folder (e.g., `C:\bakery-hq`)
4. Click "Extract"

If you're using Git:
1. Open Command Prompt
2. Navigate to where you want the project (e.g., Desktop)
3. Run: `git clone <repository-url>`

### Step 2.2: Navigate to the Project Folder

1. Open Command Prompt
2. Type: `cd C:\bakery-hq` (or wherever you extracted it)
3. Press Enter

---

## Part 3: Setting Up the Backend (Django/Python)

The backend is like the restaurant's kitchen where all the cooking (data processing) happens.

### Step 3.1: Create a Virtual Environment

A virtual environment is like a container that isolates the project's Python packages.

1. In Command Prompt (in the project folder), type:
   ```
   cd backend
   ```
2. Press Enter
3. Type:
   ```
   python -m venv venv
   ```
4. Press Enter and wait for the folder `venv` to be created

### Step 3.2: Activate the Virtual Environment

1. Still in the `backend` folder, type:
   ```
   venv\Scripts\activate
   ```
2. Press Enter
3. You should now see `(venv)` at the start of your Command Prompt line

### Step 3.3: Install Python Dependencies

Dependencies are extra software libraries the backend needs.

1. Type:
   ```
   pip install -r requirements.txt
   ```
2. Press Enter
3. **This will take 3-5 minutes** - you'll see lots of text scrolling. This is normal!
4. When it's done, you'll see a message like "Successfully installed..."

### Step 3.4: Set Up the Database

The database is where all the data gets stored.

1. Type:
   ```
   python manage.py migrate
   ```
2. Press Enter
3. You'll see several lines showing migrations being applied. This is normal.

### Step 3.5: Create Demo Data

This adds sample products, users, and sales so you can test the application.

1. Type:
   ```
   python manage.py seed_data
   ```
2. Press Enter
3. You should see messages like "Created user: admin@bakery.com"

**Demo Accounts Created:**
- **Admin Account**
  - Email: `admin@bakery.com`
  - Password: `demo1234`

- **Manager Account**
  - Email: `manager@bakery.com`
  - Password: `demo1234`

- **Salesperson Account**
  - Email: `sales@bakery.com`
  - Password: `demo1234`

### Step 3.6: Start the Backend Server

The backend server is what listens for requests from the frontend.

1. Type:
   ```
   python manage.py runserver
   ```
2. Press Enter
3. You should see:
   ```
   Starting development server at http://127.0.0.1:8000/
   ```

**Keep this Command Prompt window open!** The backend server must stay running.

---

## Part 4: Setting Up the Frontend (React/JavaScript)

The frontend is like the restaurant's dining room where customers see and interact with the system.

### Step 4.1: Open a NEW Command Prompt Window

1. Press Windows Key + R
2. Type: `cmd`
3. Press Enter

### Step 4.2: Navigate to the Project Root

1. Type:
   ```
   cd C:\bakery-hq
   ```
   (or wherever you extracted the project, but do NOT go into the `backend` folder)
2. Press Enter

### Step 4.3: Install Frontend Dependencies

1. Type:
   ```
   npm install
   ```
2. Press Enter
3. **This will take 2-3 minutes** - you'll see lots of text scrolling
4. When done, you should see "added XXX packages"

### Step 4.4: Start the Frontend Development Server

1. Type:
   ```
   npm run dev
   ```
2. Press Enter
3. You should see something like:
   ```
   ➜  Local:   http://localhost:5173/
   ```

**Keep this window open too!** The frontend server must keep running.

---

## Part 5: Using the Application

### Step 5.1: Open Your Web Browser

1. Open **Google Chrome**, **Firefox**, or any web browser
2. Go to: `http://localhost:5173`
3. You should see the Bakery HQ login screen

### Step 5.2: Log In

1. Enter email: `manager@bakery.com`
2. Enter password: `demo1234`
3. Click "Sign in"
4. You should now see the Dashboard!

### Step 5.3: Explore the Application

**Navigation Menu (Left Side):**
- **Dashboard** - See business overview and key numbers
- **Sales** - Record customer purchases
- **Stock** - Check inventory levels
- **Wastage** - Record spoiled or damaged items
- **Reports** - View analytics and trends
- **Users** (Admin only) - Create new staff accounts
- **Settings** - Change preferences

### Step 5.4: Try Creating a Sale

1. Click "Sales" in the left menu
2. Click "Create sale" (blue button)
3. Select a product from the dropdown
4. Enter quantity (how many)
5. Click "Create"
6. You'll see the sale recorded!

---

## Part 6: Stopping the Application

When you're done using the application:

### To Stop the Backend:
1. Go to the first Command Prompt (where backend is running)
2. Press `Ctrl + C`
3. Type `y` and press Enter

### To Stop the Frontend:
1. Go to the second Command Prompt (where frontend is running)
2. Press `Ctrl + C`
3. Type `y` and press Enter

---

## Part 7: Restarting the Application

The next time you want to use Bakery HQ:

### Restart Backend:
1. Open Command Prompt
2. Type: `cd C:\bakery-hq\backend`
3. Type: `venv\Scripts\activate`
4. Type: `python manage.py runserver`

### Restart Frontend:
1. Open a NEW Command Prompt
2. Type: `cd C:\bakery-hq`
3. Type: `npm run dev`

Then open browser to: `http://localhost:5173`

---

## Common Problems and Solutions

### Problem: "Python is not recognized"

**Solution:**
- Python is not installed, OR
- Python wasn't added to PATH
- **Fix:** Reinstall Python and CHECK "Add Python to PATH" box

### Problem: "npm is not recognized"

**Solution:**
- Node.js is not installed
- **Fix:** Install Node.js from https://nodejs.org/

### Problem: Port 8000 is already in use

**Solution:**
- Another application is using port 8000
- **Fix:** Kill the process or use a different port:
  ```
  python manage.py runserver 8001
  ```
  Then update frontend to use port 8001

### Problem: Port 5173 is already in use

**Solution:**
- Another development server is running
- **Fix:** The system will tell you what port to use instead, check the output

### Problem: Login doesn't work

**Solution:**
- Make sure backend server is running (first Command Prompt)
- Check email and password are typed correctly
- Try: `manager@bakery.com` / `demo1234`

### Problem: "Database is locked"

**Solution:**
- Multiple instances of the application are running
- **Fix:** Close all Command Prompt windows and restart

### Problem: Dependency installation fails

**Solution:**
- Your internet connection may be unstable
- **Fix:** Try again:
  ```
  pip install -r requirements.txt
  ```
  or
  ```
  npm install
  ```

---

## Useful Keyboard Shortcuts

- `Ctrl + C` - Stop a running server
- `Ctrl + Shift + Delete` - Clear browser cache (if things look weird)
- `F5` - Refresh the page in browser
- `F12` - Open browser Developer Tools (for debugging)

---

## Getting Help

If something goes wrong:

1. **Read the error message** - It usually tells you what's wrong
2. **Check the Common Problems section above**
3. **Make sure both Command Prompt windows are running**
4. **Try stopping and restarting everything**
5. **Restart your computer** (classic fix that often works!)

---

## Project Structure (For Curious Users)

```
bakery-hq/
├── backend/                    ← Python/Django backend
│   ├── manage.py              ← Command to run backend
│   ├── db.sqlite3             ← Database with all data
│   └── apps/                  ← Business logic
│
├── src/                        ← React/JavaScript frontend
│   ├── routes/                ← Different pages (Dashboard, Sales, etc.)
│   └── components/            ← Reusable parts (Buttons, Tables, etc.)
│
├── package.json               ← Frontend configuration
├── .env.local                 ← Frontend settings
└── README.md                  ← Detailed documentation
```

---

## Summary

**To run Bakery HQ:**

1. ✅ Install Python (with PATH added)
2. ✅ Install Node.js
3. ✅ Extract project to a folder
4. ✅ Open Command Prompt in `backend` folder
5. ✅ Run:
   ```
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py seed_data
   python manage.py runserver
   ```
6. ✅ Open NEW Command Prompt in project root folder
7. ✅ Run:
   ```
   npm install
   npm run dev
   ```
8. ✅ Open browser to: `http://localhost:5173`
9. ✅ Login with: `manager@bakery.com` / `demo1234`

---

## What's Working?

✅ User login and authentication  
✅ Sales recording and tracking  
✅ Stock/Inventory management  
✅ Wastage tracking with reasons  
✅ Real-time dashboard with charts  
✅ User account management (admin only)  
✅ Reports and analytics  
✅ Role-based access (Admin, Manager, Salesperson)  
✅ Sri Lankan Rupee (LKR) currency  
✅ Asia/Colombo timezone  
✅ Sri Lankan product examples  

---

## Tips for Success

1. **Keep both servers running** - Backend AND Frontend must be running at the same time
2. **Check the demo credentials** - Use the exact email and password provided
3. **Be patient with installation** - Dependencies take time to download
4. **Read error messages carefully** - They tell you what to fix
5. **Try stopping and restarting** if something breaks
6. **Clear browser cache** (Ctrl+Shift+Delete) if pages look wrong
7. **Check your internet connection** - It's needed for npm install

---

## Next Steps After Learning the Basics

Once you're comfortable:
- Create your own user accounts (Users > Create User)
- Add your own products (Requires admin login)
- Record real sales
- Check the Reports for insights
- Explore all pages and features

---

**Enjoy using Bakery HQ! 🎉**

Made with ❤️ for bakery businesses in Sri Lanka.
