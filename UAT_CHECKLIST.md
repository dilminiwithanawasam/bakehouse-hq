# Frontend-Backend Integration — UAT Checklist

**Status:** Ready for User Acceptance Testing (UAT)  
**Date:** May 31, 2026

---

## Authentication & Authorization

### Test Cases
- [ ] **TC-AUTH-001:** Login with valid credentials
  - Input: manager@bakery.com / demo1234
  - Expected: Redirected to dashboard, tokens in localStorage
  - Actual: _______________

- [ ] **TC-AUTH-002:** Login with invalid credentials
  - Input: manager@bakery.com / wrongpassword
  - Expected: Error message displayed
  - Actual: _______________

- [ ] **TC-AUTH-003:** Session persistence after page refresh
  - Step: Login, refresh page
  - Expected: User remains logged in
  - Actual: _______________

- [ ] **TC-AUTH-004:** Token auto-refresh on expiry
  - Setup: Wait for access token to expire (simulated)
  - Expected: Silent refresh, no user interruption
  - Actual: _______________

- [ ] **TC-AUTH-005:** Logout clears session
  - Step: Logout
  - Expected: Tokens cleared, redirected to login
  - Actual: _______________

- [ ] **TC-AUTH-006:** Role-based access control
  - Test each role (salesperson, manager, admin)
  - Expected: User pages match role permissions
  - Actual: _______________

---

## Product Management

### Test Cases
- [ ] **TC-PROD-001:** Product list loads on dashboard
  - Expected: All 12 sample products displayed
  - Actual: _______________

- [ ] **TC-PROD-002:** Product categories filtered
  - Step: Select category filter
  - Expected: Products filtered correctly
  - Actual: _______________

- [ ] **TC-PROD-003:** Stock levels accurate
  - Compare frontend display with backend database
  - Expected: Real-time sync
  - Actual: _______________

- [ ] **TC-PROD-004:** Low stock alerts shown
  - Expected: Products with stock ≤ min_stock highlighted
  - Actual: _______________

---

## Sales Flow

### Test Cases
- [ ] **TC-SALES-001:** Create new sale
  - Step: New Sale → Select product → Enter qty → Save
  - Expected: Sale recorded, stock decremented, receipt shown
  - Actual: _______________

- [ ] **TC-SALES-002:** Stock auto-decrement
  - Before: Product stock = 20
  - Create sale: 2 units
  - After: Product stock = 18
  - Expected: Automatic decrement
  - Actual: _______________

- [ ] **TC-SALES-003:** Sales appear in recent list
  - Step: Create sale, view dashboard
  - Expected: Sale appears in "Recent Sales" section
  - Actual: _______________

- [ ] **TC-SALES-004:** Tax & discount calculation
  - Step: Create sale with tax/discount
  - Expected: Total = subtotal + tax - discount
  - Actual: _______________

- [ ] **TC-SALES-005:** Multiple items per sale
  - Step: Create sale with 3+ different products
  - Expected: All items recorded, all stocks decremented
  - Actual: _______________

---

## Wastage Tracking

### Test Cases
- [ ] **TC-WASTE-001:** Record new wastage
  - Step: Record Wastage → Select product → Enter qty/reason → Save
  - Expected: Wastage recorded, loss calculated
  - Actual: _______________

- [ ] **TC-WASTE-002:** Wastage reasons tracked
  - Step: Record wastage with each reason (Expired, Damaged, Returned, Overproduction)
  - Expected: All reasons saved correctly
  - Actual: _______________

- [ ] **TC-WASTE-003:** Total loss calculated
  - Create 2 wastage records: $100 + $50
  - Expected: Dashboard shows total loss = $150
  - Actual: _______________

- [ ] **TC-WASTE-004:** Wastage report accurate
  - Expected: Report shows all records with correct breakdown
  - Actual: _______________

---

## User Management

### Test Cases
- [ ] **TC-USER-001:** View user list (admin only)
  - Step: Login as admin, go to Users page
  - Expected: All users displayed
  - Actual: _______________

- [ ] **TC-USER-002:** Create new user
  - Step: New User → Name/Email/Role → Save
  - Expected: User created, appears in list
  - Actual: _______________

- [ ] **TC-USER-003:** Edit user details
  - Step: Select user → Edit name/email → Save
  - Expected: Changes persisted
  - Actual: _______________

- [ ] **TC-USER-004:** Toggle user status
  - Step: Disable user → Try to login as that user
  - Expected: Login denied for disabled user
  - Actual: _______________

- [ ] **TC-USER-005:** Reset password
  - Step: Reset Password → Check email (or verify backend call)
  - Expected: Reset email sent successfully
  - Actual: _______________

- [ ] **TC-USER-006:** Manager cannot view/edit all users
  - Step: Login as manager, go to Users page
  - Expected: Permission denied or users page hidden
  - Actual: _______________

---

## Reporting & Analytics

### Test Cases
- [ ] **TC-REPORT-001:** Dashboard KPIs load
  - Expected: Today's sales, items, wastage, net revenue, top product
  - Actual: _______________

- [ ] **TC-REPORT-002:** Sales report by date
  - Step: Set date range → View report
  - Expected: Sales aggregated by date, chart shows trend
  - Actual: _______________

- [ ] **TC-REPORT-003:** Sales by payment method
  - Expected: Report shows cash vs. card breakdown
  - Actual: _______________

- [ ] **TC-REPORT-004:** Sales by category
  - Expected: Revenue breakdown by product category
  - Actual: _______________

- [ ] **TC-REPORT-005:** Wastage trend chart
  - Expected: Chart shows daily loss over time
  - Actual: _______________

- [ ] **TC-REPORT-006:** Product ranking (sold vs. wasted)
  - Expected: Chart shows top 8 products with sold vs. wasted units
  - Actual: _______________

- [ ] **TC-REPORT-007:** Export reports (PDF/CSV)
  - Step: Click Export button
  - Expected: Download triggered or notification shown
  - Actual: _______________

---

## Error Handling

### Test Cases
- [ ] **TC-ERROR-001:** Backend offline
  - Step: Stop backend server, try to load page
  - Expected: Error message, retry button
  - Actual: _______________

- [ ] **TC-ERROR-002:** Network timeout
  - Step: Slow network (DevTools throttle), try to fetch products
  - Expected: Timeout error, retry available
  - Actual: _______________

- [ ] **TC-ERROR-003:** Invalid data submitted
  - Step: Create sale without selecting product
  - Expected: Validation error shown
  - Actual: _______________

- [ ] **TC-ERROR-004:** Permission denied (403)
  - Step: Manager tries to delete product
  - Expected: "Insufficient permissions" message
  - Actual: _______________

- [ ] **TC-ERROR-005:** Server error (500)
  - Expected: User-friendly error message, no crash
  - Actual: _______________

---

## Performance & UX

### Test Cases
- [ ] **TC-PERF-001:** Page load time < 3 seconds
  - Measure: Dashboard initial load
  - Expected: < 3 seconds on 4G
  - Actual: _______________

- [ ] **TC-PERF-002:** Search/filter responsive
  - Step: Type in search box
  - Expected: Results filter in real-time, no lag
  - Actual: _______________

- [ ] **TC-PERF-003:** Charts render smoothly
  - Expected: Recharts visualizations smooth, no jank
  - Actual: _______________

- [ ] **TC-PERF-004:** No console errors
  - Step: Open DevTools, perform workflow
  - Expected: Zero errors/warnings
  - Actual: _______________

- [ ] **TC-UX-001:** Loading indicators shown
  - Expected: Spinners while fetching data
  - Actual: _______________

- [ ] **TC-UX-002:** Toast notifications clear
  - Expected: Success/error messages brief and informative
  - Actual: _______________

- [ ] **TC-UX-003:** Responsive design (mobile/tablet)
  - Expected: UI adapts to screen size
  - Actual: _______________

---

## Cross-Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if macOS available)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Data Integrity

### Test Cases
- [ ] **TC-DATA-001:** Stock levels consistent
  - Create 3 sales, check stock manually in DB
  - Expected: Frontend + DB match
  - Actual: _______________

- [ ] **TC-DATA-002:** No duplicate records
  - Create sale, refresh page
  - Expected: Sale appears once (no double-entry)
  - Actual: _______________

- [ ] **TC-DATA-003:** Transaction isolation
  - Two users create sales simultaneously
  - Expected: Both recorded correctly, stock accurate
  - Actual: _______________

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| QA Lead | ___________________ | __________ | ☐ Pass / ☐ Fail |
| Product Manager | ___________________ | __________ | ☐ Pass / ☐ Fail |
| Client | ___________________ | __________ | ☐ Pass / ☐ Fail |

### Issues Logged
- Issue 1: _______________________________________________
- Issue 2: _______________________________________________
- Issue 3: _______________________________________________

### Recommendations
_________________________________________________________________
_________________________________________________________________

**UAT Status:** ☐ Approved for Production | ☐ Requires Fixes | ☐ Rejected

---

**Test Date:** May 31, 2026  
**Tested By:** _______________  
**Environment:** Development (localhost)  
**Build Version:** [See git commit hash]
