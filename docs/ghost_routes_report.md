# Project AURA: The "Ghost Route" Report

This analysis identifies **Backend Endpoints** that are fully functional but currently have **zero presence in the UI**. These are "Ghost Routes"—features the server supports but users cannot access through the dashboard.

---

## 🛑 Operational Ghost Routes (Critical Actions)

These are functional backend capabilities that have no buttons or controls in the React frontend.

### 1. Request Status Management
*   **Backend Route**: `PATCH /api/requests/{id}/status`
*   **What it does**: Allows a Super Admin or GN Officer to move a request from `Pending` to `Approved` or `Fulfilled`.
*   **The UI Gap**: There is currently **no button** in the "Active Log" or "Intel Stream" to change the status of a request. Users can see the status, but they cannot change it.

### 2. Manual AI Analysis Trigger
*   **Backend Route**: `POST /api/logic/analyze/{id}`
*   **What it does**: Force-triggers the SWI-Prolog engine to re-analyze a specific request (useful if data was updated).
*   **The UI Gap**: This is currently only triggered automatically during creation. There is **no "Re-analyze" button** on the dashboard for existing requests.

### 3. Detailed Risk Insight View
*   **Backend Route**: `GET /api/logic/analysis/{id}`
*   **What it does**: Fetches the raw JSON breakdown of Prolog risk flags and scores.
*   **The UI Gap**: The dashboards show the priority badge (Red/Orange/Yellow), but there is **no "View Analysis Details" screen** to see exactly *why* the AI flagged a request as critical.

---

## 📊 Management Ghost Routes (Missing Tables)

These are endpoints that provide data, but that data is not yet presented in a structured UI.

### 1. Master Relief List (Admin View)
*   **Backend Route**: `GET /api/requests`
*   **What it does**: Retrieves EVERY request in the system across all zones.
*   **The UI Gap**: While the Super Admin dashboard uses this data for "Stats" (the Donut chart), there is **no "Master Request Table"** where an admin can scroll through and manage every request globally.

### 2. Full Inventory Control Page
*   **Backend Route**: `GET /api/inventory`
*   **What it does**: Lists all warehouse items.
*   **The UI Gap**: The Inventory table currently only exists as a small widget inside the Admin Dashboard. There is **no dedicated `/inventory` page** (despite it being in the sidebar) where an admin can perform bulk updates or search the entire inventory.

---

## 🔐 Authentication Ghost Routes

### 1. User Profile Management
*   **Backend Route**: `GET /api/auth/me`
*   **What it does**: Returns the detailed profile of the logged-in user.
*   **The UI Gap**: There is **no "Settings" or "My Profile" page**. Users can log in and out, but they cannot view their own account details or update their profile information.

---

## 🛠️ Senior Developer Priority List

To bring the project to 100% full-stack completion, the next sprint should focus on:
1.  **Status Controls**: Adding an "Approve" button to the GN Officer's `ActiveLog`.
2.  **Analysis Modal**: Creating a screen that shows the `risk_flags` (e.g., "Isolated Zone", "Medicine Shortage") retrieved from the Logic Engine.
3.  **Dedicated Pages**: Implementing the `/requests` and `/inventory` routes in `App.jsx` and creating standalone page components for them.
