# Project AURA: Full-Stack Completion Guide

**Your Starting Point:** The AI engine works, the database stores data, and the Donor Relief Board shows live requests with correct priority badges. However, users are stuck — they can only register via Swagger, they land on the wrong page, and critical buttons do nothing.

**Your Finish Line:** Every user — a GN Officer in the field, a Super Admin in headquarters, or a Donor online — can fully operate the system through the UI alone. No Swagger needed.

---

## 📌 How to Read This Guide

Each step is self-contained and safe. Follow them **in order**. Each step tells you:
- **What you will build**
- **Which file(s) to change**
- **Which backend endpoint it connects to**
- **How to verify it worked**

---

## PHASE 1: Fix the Entry Point (Authentication)
> **Goal:** Users should land on a Login page that has a "Register" button, not the public board.

### Step 1.1 — Add Registration Form to the Login Page

**Problem:** `LoginPage.jsx` has no registration form. Users who visit for the first time have no way to create an account through the UI.

**What to Build:** A toggle on the login page that switches between a "Login" form and a "Register" form. When a user fills in their name, email, password, and role (Donor or GN Officer) and clicks submit, it calls the backend.

**Files to change:**
- `frontend/src/pages/LoginPage.jsx` — Add a "Don't have an account? Register" toggle that reveals a registration form.
- `frontend/src/api/index.js` — The `registerUser` function already exists. You just need to call it.

**Backend Endpoint Connected:** `POST /api/auth/register`

**Backend Request Body:**
```json
{
  "full_name": "Ananda Perera",
  "email": "ananda@aura.gov",
  "password": "secure123",
  "role": "gn_officer"
}
```

**How to verify:** After registering through the UI, open MongoDB Compass. You should see a new document in the `users` collection with a `hashed_password` field (not the plain password).

---

### Step 1.2 — Fix the Login API Call Format

**Problem:** The backend login endpoint (`POST /api/auth/login`) uses `OAuth2PasswordRequestForm`, which means it expects `multipart/form-data` with `username` and `password` fields — NOT a JSON body with `email`.

**Current broken code in `api/index.js`:**
```js
// WRONG — sends JSON with "email"
export const loginUser = (email, password) =>
  apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
```

**What to Fix:** Change the login API call to send `application/x-www-form-urlencoded` format with `username` (the backend reads email from this field) and `password`.

**Files to change:**
- `frontend/src/api/index.js` — Rewrite the `loginUser` function to use `URLSearchParams` instead of `JSON.stringify`.

**Fixed code:**
```js
export const loginUser = (email, password) => {
  const body = new URLSearchParams();
  body.append('username', email); // backend reads email from 'username' field
  body.append('password', password);
  return apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
};
```

**How to verify:** Log in from the UI. You should be redirected to the correct dashboard based on your role. No more 422 errors.

---

### Step 1.3 — Implement Role-Based Redirect on App Load

**Problem:** When you open `http://localhost:5173/`, it redirects to `/public` (the Donor Board) whether you are logged in or not. A Super Admin should be taken to their admin dashboard.

**What to Build:** Update `App.jsx` so that the root path `/` checks if a user is already logged in. If yes, redirect them to their role's dashboard. If no, redirect to `/login`.

**Files to change:**
- `frontend/src/App.jsx` — Change the root route from `<Navigate to="/public" />` to a smart redirect component that reads the user's role from `AuthContext`.

**How to verify:** Log in as a GN Officer, close the tab, reopen the app. You should land directly on the GN Officer Dashboard.

---

## PHASE 2: Fix the GN Officer Dashboard
> **Goal:** A GN Officer can submit requests and see their own request history, including correct priority badges.

### Step 2.1 — Fix Priority Badge in ActiveLog

**Problem:** `ActiveLog.jsx` line 29 still reads the priority from the wrong field:
```js
// WRONG — this nested object doesn't exist
<Badge priority={row.prolog_analysis?.priority_level || 'yellow'} />
```

**What to Fix:** Change it to read from the top-level `priority_level` field, just like you fixed `RequestCard.jsx`.

**Files to change:**
- `frontend/src/components/gn-officer/ActiveLog.jsx` — Line 29

**Fixed code:**
```js
<Badge priority={row.priority_level || null} />
```

**How to verify:** Log in as a GN Officer. The Active Log table should show "CRITICAL PRIORITY" or "URGENT PRIORITY" badges instead of the default "UNKNOWN PRIORITY".

---

### Step 2.2 — Fix Critical Alerts Counter in GN Dashboard

**Problem:** `GNOfficerDashboard.jsx` line 57 calculates "CRITICAL ALERTS" using the same broken field path:
```js
const criticalCount = requests.filter(r => r.prolog_analysis?.priority_level === 'red').length;
```
This will always return 0.

**What to Fix:** Update to use the top-level `priority_level` field with the correct string value.

**Files to change:**
- `frontend/src/pages/GNOfficerDashboard.jsx` — Line 57

**Fixed code:**
```js
const criticalCount = requests.filter(r => r.priority_level === 'Critical').length;
```

---

### Step 2.3 — Add "Approve" Button to ActiveLog

**Problem:** GN Officers can see their request statuses, but they cannot change them. The backend has a `PATCH /api/requests/{id}/status` endpoint that is never used by the UI.

**What to Build:** Add a small dropdown or button in the `ActiveLog` table's "ACTION" column. When clicked, it calls the backend to update the status. The table should refresh automatically.

**Files to change:**
- `frontend/src/components/gn-officer/ActiveLog.jsx` — Add an "Update Status" action button.
- You need to pass an `onStatusUpdate` callback prop from `GNOfficerDashboard.jsx`.

**Backend Endpoint Connected:** `PATCH /api/requests/{id}/status`
**Backend Request Body:** `{ "status": "approved" }`

**How to verify:** Find a "Pending" request in the Active Log. Click the status button. It should change to "Approved" and you should see the update in MongoDB Compass.

---

### Step 2.4 — Wire the "View Details" Eye Button

**Problem:** The `ActiveLog` has an `<Eye>` icon button in every row, but it does nothing when clicked. It calls `() =>` with an empty function.

**What to Build:** When the Eye button is clicked, open a modal that fetches and displays the full AI analysis for that request (risk flags, priority score, etc.).

**Files to change:**
- `frontend/src/components/gn-officer/ActiveLog.jsx` — Wire the Eye button to open a details modal.
- Create a new component: `frontend/src/components/gn-officer/RequestDetailModal.jsx`

**Backend Endpoint Connected:** `GET /api/logic/analysis/{id}`

**Response data to display:**
```json
{
  "priority_level": "Critical",
  "priority_score": 90,
  "risk_flags": ["isolated_zone", "medicine_empty", "large_population"],
  "analyzed_at": "2026-05-16T06:00:00Z"
}
```

---

## PHASE 3: Fix the Super Admin Dashboard
> **Goal:** A Super Admin can manage all requests globally and see accurate statistics.

### Step 3.1 — Fix IntelStream Priority Filter

**Problem:** `IntelStream.jsx` line 11 reads `r.prolog_analysis?.priority_level === 'red'` — the same broken field path that causes the Intel Stream to show zero critical alerts.

**Files to change:**
- `frontend/src/components/super-admin/IntelStream.jsx` — Lines 11 and 39
- Import `PRIORITY_LEVELS` from constants.

**Fixed code (lines 11 and 39):**
```js
// Line 11
requests.filter(r => r.priority_level === PRIORITY_LEVELS.CRITICAL)
// Line 39
requests.filter(r => r.status === 'pending' && r.priority_level !== PRIORITY_LEVELS.CRITICAL)
```

---

### Step 3.2 — Add Master Request Management Table

**Problem:** There is no page where the Super Admin can see ALL requests across ALL zones and manage them. The sidebar has a "Relief Requests" link but it leads to a blank page.

**What to Build:** Create a new page `frontend/src/pages/RequestsPage.jsx` with a full table showing all requests. Each row should have a "Change Status" dropdown.

**Files to change:**
- `frontend/src/pages/RequestsPage.jsx` — Create new page.
- `frontend/src/App.jsx` — Add `<Route path="/requests" element={<RequestsPage />} />`

**Backend Endpoints Connected:**
- `GET /api/requests` — Fetch all requests.
- `PATCH /api/requests/{id}/status` — Update a request's status.

---

### Step 3.3 — Create Dedicated Inventory Management Page

**Problem:** The Inventory is currently a small widget cramped inside the Admin Dashboard. There is no `/inventory` route despite it being in the sidebar.

**What to Build:** Move the `InventoryTable`, `AddSupplyModal`, and related logic into a dedicated `InventoryPage.jsx`. The Admin Dashboard can keep a small summary widget, but the full management experience should be at its own route.

**Files to change:**
- `frontend/src/pages/InventoryPage.jsx` — Create new page.
- `frontend/src/App.jsx` — Add `<Route path="/inventory" element={<InventoryPage />} />`

**Backend Endpoints Connected:**
- `GET /api/inventory` — Load all items.
- `POST /api/inventory` — Add a new item.
- `PATCH /api/inventory/{id}` — Edit item quantity.
- `DELETE /api/inventory/{id}` — Remove an item.

---

### Step 3.4 — Fix PriorityDonut to Use Correct Data

**Problem:** The priority donut chart in the Admin Dashboard calculates its segments using data directly from MongoDB. If the chart uses the same broken `prolog_analysis?.priority_level` field path, it will always show everything as "Unknown".

**Files to check and fix:**
- `frontend/src/components/super-admin/PriorityDonut.jsx` — Verify it uses `r.priority_level` and compares against `"Critical"`, `"Urgent"`, `"Standard"`.

---

## PHASE 4: Fix the Donor View
> **Goal:** Donors can see real request data, filter it correctly, and book requests.

### Step 4.1 — Connect the Public Stats Bar

**Problem:** The backend has a `GET /api/public/stats` endpoint that returns total request counts, active zones, and items distributed. This data is NOT currently fetched or displayed anywhere on the Donor Board.

**What to Build:** Fetch the public stats on page load in `DonorReliefBoard.jsx` and display the numbers.

**Backend Endpoint Connected:** `GET /api/public/stats`

**Response:**
```json
{
  "total_requests": 12,
  "active_relief_zones": 5,
  "total_donors": 3,
  "items_distributed": 0
}
```

---

### Step 4.2 — Fix the "My Contributions" Page

**Problem:** The "My Contributions" nav link in the Donor view points to nothing. A donor has no way to see the requests they have booked.

**What to Build:** Create a simple page that shows the donor a list of requests they have booked.

> [!NOTE]
> This requires a backend change. Currently, there is no endpoint that returns a donor's booking history. You would need to add a `GET /api/public/my-bookings` endpoint to the backend.

---

## PHASE 5: Application-Wide Polish
> **Goal:** No broken buttons, no dead links, professional production-grade UX.

### Step 5.1 — Fix All "Reset Cipher" Link in Login

**Problem:** The "Reset Cipher" (Forgot Password) button on the login page has no functionality. Clicking it does nothing.

**What to Build (Simple Version):** Show a message that says "Please contact your system administrator." This is honest and prevents user confusion.

---

### Step 5.2 — Role-Based Sidebar Rendering

**Problem:** Currently, both the GN Officer and Admin sidebars show links like "User Management" and "Logistics" which lead to blank/empty pages.

**What to Build:** Add conditional rendering to `Sidebar.jsx` so only links that have real routes are shown. Disable or hide links that don't have pages yet.

---

### Step 5.3 — Add a User Profile Page

**Problem:** There is no "My Account" or "Settings" page. The `GET /api/auth/me` endpoint is never used by the UI.

**What to Build:** A simple profile page that shows the logged-in user's name, email, and role. Connect it to the user avatar/name in the Navbar.

**Backend Endpoint Connected:** `GET /api/auth/me`

---

## 🗺️ Complete Task Checklist

### Phase 1: Authentication (Start Here)
- `[ ]` Add Registration form to `LoginPage.jsx`
- `[ ]` Fix `loginUser()` in `api/index.js` to use form-encoded format
- `[ ]` Fix root `/` redirect to be role-aware in `App.jsx`

### Phase 2: GN Officer Dashboard
- `[ ]` Fix priority badge field path in `ActiveLog.jsx`
- `[ ]` Fix Critical Alerts counter in `GNOfficerDashboard.jsx`
- `[ ]` Add "Update Status" action in `ActiveLog.jsx`
- `[ ]` Wire Eye button to open a Request Detail modal

### Phase 3: Super Admin Dashboard
- `[ ]` Fix `IntelStream.jsx` priority field path
- `[ ]` Create `RequestsPage.jsx` at `/requests` route
- `[ ]` Create `InventoryPage.jsx` at `/inventory` route
- `[ ]` Verify `PriorityDonut.jsx` uses correct field paths

### Phase 4: Donor View
- `[ ]` Fetch and display `/api/public/stats`
- `[ ]` Build "My Contributions" page

### Phase 5: Polish
- `[ ]` Fix "Reset Cipher" link behaviour
- `[ ]` Implement role-based sidebar rendering
- `[ ]` Build User Profile page connected to `/api/auth/me`

---

> [!IMPORTANT]
> **Start with Phase 1.** Every other phase depends on users being able to log in through the UI correctly. The login API format fix (Step 1.2) is the single highest-priority item in this entire guide.
