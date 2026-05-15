# Project AURA - Backend Connectivity & Status Report

This document outlines the current state of the integration between the React frontend and the FastAPI backend. It identifies which features are functional, which are placeholders, and what is missing.

## 1. Summary of the Issue
The frontend is built to a high level of detail, but the **Backend is in a "Skeleton" state**. Most router files in `backend/app/routers/` contain only basic placeholders (stubs) that return empty arrays or static messages. Consequently, the UI appears "empty" and buttons do not trigger any real actions in the database.

---

## 2. API Endpoint Status

### 🟢 Connected (But returning Stubs/Empty)
These endpoints exist in the backend but do not perform real logic yet.

| Endpoint | Method | Backend File | Status | Reason for Failure |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | `routers/auth.py` | Stubbed | Returns `{"message": "Auth stub"}` instead of a JWT token. |
| `/api/requests` | GET | `routers/requests.py` | Empty | Returns `[]`. No database fetch implemented. |
| `/api/inventory` | GET | `routers/inventory.py` | Empty | Returns `[]`. No database fetch implemented. |
| `/api/logic/analyze/{id}` | POST | `routers/logic.py` | Stubbed | Returns `{"status": "analyzing"}` but doesn't trigger Prolog. |
| `/api/public/board` | GET | `routers/public.py` | Empty | Returns `[]`. This is why the Relief Board is empty. |

### 🔴 Missing (Not implemented in Backend)
The frontend expects these endpoints (defined in `frontend/src/api/index.js`), but they **do not exist** in the FastAPI routers.

| Feature | Method | Missing Endpoint | Why it's not working |
| :--- | :--- | :--- | :--- |
| **User Registration** | POST | `/api/auth/register` | `404 Not Found`. Route not defined. |
| **Profile Management** | GET | `/api/auth/me` | `404 Not Found`. |
| **Create Request** | POST | `/api/requests` | Only the GET method is defined. |
| **Update Status** | PATCH | `/api/requests/{id}/status` | Route not defined. |
| **Inventory Management** | POST/PATCH | `/api/inventory` | Only the GET method is defined. |
| **Public Stats** | GET | `/api/public/stats` | Route not defined. This is why stats show "0". |
| **Booking** | POST | `/api/public/book` | Route not defined. |

---

## 3. Developer Guidance: How to Fix

To make the application functional, the following steps are required in the `backend` code:

### Step 1: Hook up Authentication
The `backend/app/auth.py` file already contains logic for JWT tokens and password hashing. You need to update `backend/app/routers/auth.py` to import these functions and verify users against the MongoDB database.

### Step 2: Implement CRUD Logic
You need to update the routers (`requests.py`, `inventory.py`, etc.) to use the `backend/app/database.py` logic. Instead of `return []`, they should perform a `find()` operation on the MongoDB collections.

### Step 3: Connect the Prolog Engine
The `backend/app/prolog_engine.py` is a complex logic system already written. The `logic.py` router needs to be updated to actually call the `PrologEngine` class to analyze requests.

### Step 4: Add Missing Routes
Create the missing `@router` methods in your Python files for POST, PATCH, and DELETE operations as defined in the "Missing" table above.

---

## 4. Technical Diagnosis (Connectivity)
- **CORS**: The backend is correctly configured to allow requests from `http://localhost:5173`.
- **Environment**: The `.env` file is present, but the application code is not yet fully utilizing the database connection strings within the routers.
