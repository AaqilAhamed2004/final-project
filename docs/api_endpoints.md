# Project AURA - API Endpoints & Frontend Routes

This document provides a comprehensive list of the API endpoints (Backend) and Routing (Frontend) for Project AURA.

## Backend API Endpoints
The backend is built with FastAPI. All endpoints are prefixed with the base URL (default: `http://localhost:8000`).

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Login and receive a JWT token. |
| POST | `/api/auth/register` | Register a new user account. |
| GET | `/api/auth/me` | Get the currently logged-in user profile. |

### Requests (`/api/requests`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/requests` | List all relief requests. |
| POST | `/api/requests` | Create a new relief request. |
| GET | `/api/requests/my` | Get requests created by the current user. |
| PATCH | `/api/requests/{id}/status` | Update the status of a specific request. |

### Inventory (`/api/inventory`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/inventory` | List all available items in the inventory. |
| POST | `/api/inventory` | Add a new item to the inventory. |
| PATCH | `/api/inventory/{id}` | Update details of an inventory item. |
| DELETE | `/api/inventory/{id}` | Remove an item from the inventory. |

### Logic Engine (`/api/logic`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/logic/analyze/{id}` | Trigger the SWI-Prolog prioritization analysis for a request. |
| GET | `/api/logic/analysis/{id}` | Retrieve the analysis results for a request. |

### Public Board (`/api/public`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/public/board` | Get the list of requests available for public donation. |
| GET | `/api/public/stats` | Get high-level statistics for the dashboard. |
| POST | `/api/public/book` | Book a request for donation. |

---

## Frontend Routes
The frontend is built with React and Vite. The base URL is typically `http://localhost:5173`.

### Public Routes
| Path | Page Component | Description |
| :--- | :--- | :--- |
| `/` | Redirects to `/public` | Root path. |
| `/login` | `LoginPage` | User login screen. |
| `/public` | `DonorReliefBoard` | Public dashboard for donors to view and book requests. |

### Protected Routes (Requires Authentication)
| Path | Allowed Roles | Description |
| :--- | :--- | :--- |
| `/dashboard/admin` | `super_admin` | Management dashboard for system administrators. |
| `/dashboard/gn` | `gn_officer` | Dashboard for Grama Niladhari officers to manage local requests. |
| `/dashboard/donor` | `donor` | Personal dashboard for donors (currently shows the Relief Board). |
| `/dashboard` | Any | Generic dashboard path (redirects based on role). |

---

## Health Check
- `GET /` : Returns API status and version information.
- `GET /docs` : Interactive Swagger UI documentation for the API.
