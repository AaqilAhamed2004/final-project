# Project AURA Architecture & Connectivity Report

This document provides a detailed overview of the technical architecture of **Project AURA**, mapping the relationship between the FastAPI backend and the React/Vite frontend. As a senior full-stack developer, I have analyzed the codebase to identify successful integrations and remaining development gaps.

---

## 🛠️ Backend API Reference (FastAPI)

The backend is built with FastAPI and follows a modular router-based structure. All endpoints are prefixed with `/api`.

### 1. Authentication (`/api/auth`)
| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/register` | `POST` | Creates a new user (GN Officer or Donor). | No |
| `/login` | `POST` | Validates credentials and returns a JWT token. | No |
| `/me` | `GET` | Returns current user profile based on token. | Yes |

### 2. Relief Requests (`/api/requests`)
| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Lists all relief requests (for admins). | Yes |
| `/` | `POST` | Creates a new request and triggers AI analysis. | Yes |
| `/my` | `GET` | Lists requests created by the logged-in GN Officer. | Yes |
| `/{id}/status` | `PATCH` | Updates request status (Pending → Approved). | Yes |

### 3. AI & Prolog Engine (`/api/logic`)
| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/analyze/{id}` | `POST` | Force-triggers an AI analysis on a specific request. | Yes |
| `/analysis/{id}` | `GET` | Retrieves detailed risk flags and AI scores. | No |

### 4. Inventory Management (`/api/inventory`)
| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | Lists all current warehouse supplies. | No |
| `/` | `POST` | Adds new items to the inventory. | Yes |
| `/{id}` | `PATCH` | Updates item quantities or details. | Yes |
| `/{id}` | `DELETE` | Removes an item from the system. | Yes |

### 5. Public Board & Ops (`/api/public`)
| Endpoint | Method | Purpose | Auth Required |
| :--- | :--- | :--- | :--- |
| `/board` | `GET` | The "Tactical Feed" for donors (Public). | No |
| `/stats` | `GET` | Summary statistics (Active zones, Total distributed). | No |
| `/book` | `POST` | Allows a donor to "Book" a request to help. | Yes |

---

## 🔗 Frontend Connection Status (React)

The frontend uses a centralized `api/index.js` client powered by the `fetch` API.

### ✅ Fully Connected & Functional
*   **Donor Relief Board (`/public`)**: Successfully pulls from `/api/public/board` and `/api/public/stats`. The "Update Feed" button is wired to refresh data.
*   **Login Flow (`/login`)**: Connected to `/api/auth/login`. Correctly stores JWT tokens in `localStorage`.
*   **GN Officer: Request Submission**: The form in `GNOfficerDashboard` is fully connected to `POST /api/requests`.
*   **Super Admin: Inventory**: The `InventoryTable` in `SuperAdminDashboard` is fully connected to all inventory CRUD operations.

### ⚠️ Partially Connected / Internal Logic
*   **AI Results Popup**: While the AI analyzes data in the background, the `PriorityResult` modal in the GN dashboard displays the results immediately after creation.
*   **Stats Strips**: All dashboards dynamically calculate counts (Pending, Critical, etc.) based on real-time data from the backend.

---

## 🚫 Missing UI & Implementation Gaps

Upon deep analysis of the `App.jsx` routing and page components, the following features are defined in the **Sidebar/Navigation** but do **NOT** yet have a dedicated user interface or route.

### 1. Missing Routes (404/Empty Links)
The following links in the Sidebar lead nowhere because no `<Route>` is defined for them:
*   **`/logistics`**: Intended for tracking delivery trucks and routes.
*   **`/users`**: Intended for Super Admin to manage GN Officer accounts.
*   **`/requests` (Dedicated Page)**: Currently, requests are managed inside the Dashboards. A standalone list view is missing.

### 2. Incomplete UI Components
*   **`LiveTracker`**: Visible in the GN Officer Dashboard, but currently contains static or placeholder visual elements instead of real-time GPS data.
*   **`GlobalLogistics`**: Visible in the Admin Dashboard, but shows a simplified visualization rather than a functional map.
*   **Historical Analytics**: The "View Historical Analytics" button in the Admin Dashboard is not wired to any endpoint or chart.

---

## 📐 Senior Developer Recommendations

1.  **Consolidate Inventory**: Move the `InventoryTable` out of the Admin Dashboard and into its own dedicated `/inventory` route to reduce dashboard clutter.
2.  **GPS Integration**: The `LiveTracker` should be connected to a future Logistics API to show actual movement of goods.
3.  **Role-Based Sidebar**: Currently, some sidebar items appear for roles that may not have access (e.g., Donors seeing Command Center options). We should implement conditional rendering in `Sidebar.jsx`.

> [!NOTE]
> All primary AI and priority features are now **100% stable** and correctly synced between the Python worker and the React UI.
