# PROJECT AURA: COMPREHENSIVE SYSTEM DOCUMENTATION

---

## SECTION 1 — PROJECT OVERVIEW

### Introduction
AURA stands for **Automated Urgent Relief Architecture**. It is a modern, full-stack disaster management system designed to solve a critical real-world problem: the chaotic, delayed, and uncoordinated distribution of relief supplies during natural disasters in Sri Lanka, such as floods and landslides. 

During emergencies, decision-makers are often overwhelmed by hundreds of concurrent requests for food, medicine, and shelter. AURA solves this by using an Artificial Intelligence (AI) engine to automatically read incoming requests, assess the risks (like blocked roads or large isolated populations), and assign a strict priority level (Critical, Moderate, or Low). This ensures that the people who need help the most get it first, without relying on slow manual human sorting.

### System Users
The system is built for three distinct types of users, each with a specific role:

1. **GN Officers (Grama Niladhari):** Local government officials on the ground in disaster zones. They use the system to submit live "Relief Requests" detailing exactly what supplies their village needs, the population size, and current road conditions.
2. **Super Admins (NGO Coordinators / Government Hubs):** The central command. They monitor the system, manage the physical inventory of warehouses, and dispatch supplies based on the AI's priority sorting.
3. **Donors (Public Citizens / Organizations):** Generous individuals or corporate entities who can view a public board of approved relief requests and "book" them, committing to provide the requested funds or supplies.

### One-Paragraph Summary for Presentation
*"AURA is an intelligent disaster relief platform that connects ground officials in Sri Lanka with central NGO command centers and public donors. When a local official submits a request for emergency supplies, AURA’s built-in Prolog AI engine instantly analyzes road conditions, population sizes, and current stock levels to automatically categorize the request as Critical, Moderate, or Low priority. This ensures that in the chaos of a natural disaster, life-saving resources are always routed to the most desperate areas first, saving time, optimizing inventory, and ultimately saving lives."*

---

## SECTION 2 — SYSTEM ARCHITECTURE

AURA uses a modern, **decoupled architecture**. This means the system is built as two completely separate applications (Frontend and Backend) that talk to each other over the internet, rather than being tangled up in one massive program.

### Architecture Diagram

```text
       [ USER / BROWSER ]
               |
               v
+------------------------------+
|       REACT FRONTEND         |  <-- Displays UI, manages user state,
|  (Vite, Tailwind, React)     |      validates forms, sends HTTP requests
+------------------------------+
               |
         (REST API via HTTP/JSON)
               |
               v
+------------------------------+       +------------------------------+
|      FASTAPI BACKEND         | ----> |       PROLOG AI ENGINE       |
|  (Python, Pydantic, Auth)    | <---- |  (priority_rules, logic)     |
+------------------------------+       +------------------------------+
               |
         (PyMongo connection)
               |
               v
+------------------------------+
|      MONGODB DATABASE        |  <-- Stores JSON-like documents
|  (users, requests, inventory)|
+------------------------------+
```

### Why This Architecture Was Chosen
A **decoupled design** means the visual interface (React) and the brain/database (FastAPI + MongoDB) run independently. We chose this because:
1. **Scalability:** If millions of people visit the public donor board, we can upgrade just the React frontend without touching the heavy AI backend.
2. **Specialization:** React is the best tool in the world for building fast, beautiful user interfaces, while Python (FastAPI) is the best tool for talking to AI engines like Prolog. By decoupling, we use the best tool for every job.

**How They Communicate:** The frontend and backend talk using a **REST API**. When a user clicks a button in React, React sends an HTTP request containing data formatted in **JSON** (a simple text-based data format) to a specific URL on the FastAPI server. The server processes it and sends JSON back.

**JWT Authentication:** JWT stands for JSON Web Token. It is a digital "VIP pass". When a user logs in, the backend verifies their password and gives them a scrambled string of text (the JWT). The frontend attaches this VIP pass to every subsequent request to prove who the user is without having to send the password every time.

---

## SECTION 3 — COMPLETE FILE AND FOLDER STRUCTURE

### File Tree

```text
project-root/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── inventory.py
│   │   │   ├── logic.py
│   │   │   ├── public.py
│   │   │   └── requests.py
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── models.py
│   │   └── prolog_engine.py
│   ├── prolog/
│   │   ├── medicine_kb.pl
│   │   ├── priority_rules.pl
│   │   └── risk_assessment.pl
│   ├── main.py
│   ├── prolog_worker_cli.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── donor/
│   │   │   ├── gn-officer/
│   │   │   └── super-admin/
│   │   ├── constants/
│   │   │   └── index.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── AdminInventoryPage.jsx
│   │   │   ├── DonorReliefBoard.jsx
│   │   │   ├── GNOfficerDashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ...
│   │   ├── utils/
│   │   │   └── priorityHelpers.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── PROJECT_DOCUMENTATION.md
```

### Explanation of Folders and Files

#### Frontend Files (`frontend/src/`)
*   **`pages/`**: These are the main screens the user sees (e.g., `LoginPage.jsx`, `DonorReliefBoard.jsx`). *If deleted, the user would just see a blank white screen because there are no screens to load.* Think of these as the rooms in a house.
*   **`components/`**: Reusable building blocks like buttons, cards, and navbars. Grouped by who uses them (donor, admin, common). *If deleted, the pages would have no buttons or text boxes.* Think of these as the furniture inside the rooms.
*   **`hooks/`**: Custom React functions (like `useAuth.js`) that let components access shared data easily. *Hooks* are simply shortcuts for standard tasks. Think of them as power tools.
*   **`utils/` and `constants/`**: Small helper files. `priorityHelpers.js` contains functions that decide what color "CRITICAL" should be (red). `constants/index.js` holds fixed lists like user roles. *If deleted, colors and labels would break.* Think of these as the rulebooks and paint palettes.
*   **`api/index.js`**: The single file where ALL communication to the backend happens. *If deleted, the app becomes completely offline and cannot fetch any data.* Think of this as the telephone line connecting the house to the outside world.
*   **`context/AuthContext.jsx`**: Remembers if you are logged in as you move from page to page. *If deleted, you would have to log in every single time you clicked a new link.* Think of this as the bouncer checking your VIP pass at every door.

#### Backend Files (`backend/`)
*   **`main.py`**: The entry point that starts the server. *If deleted, the backend simply cannot boot up.* Think of this as the ignition switch of a car.
*   **`app/routers/`**: Splits the API into logical sections (auth, requests, inventory). Each file handles URLs specific to that topic. *If deleted, the frontend's API calls would get a "404 Not Found" error.* Think of these as different departments in a business (HR, Sales, Logistics).
*   **`app/database.py`**: Connects Python to the MongoDB database. *If deleted, the app cannot save or retrieve any data.* Think of this as the filing cabinet key.
*   **`app/models.py`**: Uses Pydantic to strictly validate that incoming data has the correct shape (e.g., ensuring "quantity" is a number, not text). *If deleted, malicious or broken data could crash the database.* Think of this as a strict spell-checker.
*   **`prolog_engine.py` & `prolog_worker_cli.py`**: The bridge that passes Python data into the Prolog AI, runs the AI, and brings the result back. Think of this as a translator between English (Python) and a highly logical alien language (Prolog).

#### Prolog AI Files (`backend/prolog/`)
*   **`priority_rules.pl`**: Contains the logic rules that decide if a request is Critical, Moderate, or Low.
*   **`medicine_kb.pl`**: A knowledge base of medicines and their safe substitutes.
*   **`risk_assessment.pl`**: Rules that detect dangers (like large populations trapped behind flooded roads).
*   *In Prolog, "facts" are absolute truths (e.g., "paracetamol can substitute ibuprofen"), and "rules" are conditional logic (e.g., "IF road is blocked AND medicine is empty THEN priority is red").*

---

## SECTION 4 — DATABASE DESIGN

### 4a. ER Diagram

```text
 +-------------------+        +-------------------+
 |       USERS       | 1    * |     REQUESTS      |
 |-------------------|--------|-------------------|
 | _id (PK)          |        | _id (PK)          |
 | full_name         |        | creator_id (FK)   |
 | email             |        | location          |
 | hashed_password   | 1    * | status            |
 | role              |--------| priority_level    |
 +-------------------+        +-------------------+
          | 1                           | 1
          |                             |
          | *                           | 1
 +-------------------+        +-------------------+
 |  DONOR_BOOKINGS   | *    1 |  PROLOG_ANALYSIS  |
 |-------------------|--------|-------------------|
 | _id (PK)          |        | _id (PK)          |
 | request_id (FK)   |        | request_id (FK)   |
 | donor_id (FK)     |        | priority_label    |
 | quantity_booked   |        | risk_flags        |
 +-------------------+        | substitutes       |
                              +-------------------+
 
 +-------------------+
 |     INVENTORY     |
 |-------------------|
 | _id (PK)          |
 | item_name         |
 | category          |
 | quantity          |
 +-------------------+
```

### 4b. Collection Schemas

**Collection: users**
| Field Name | Data Type | Required | Plain Language Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Unique ID assigned by MongoDB | `64a1b2c3d4e5` |
| `email` | String | Yes | The user's login email | `"admin@aura.org"` |
| `hashed_password` | String | Yes | Scrambled version of password | `"$2b$12$x8a..."` |
| `full_name` | String | Yes | The user's display name | `"John Doe"` |
| `role` | String | Yes | Their access level | `"super_admin"` |

**Collection: requests**
| Field Name | Data Type | Required | Plain Language Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Unique ID of the request | `64a1b2c3d4e6` |
| `creator_id` | String | Yes | The ID of the GN Officer who made it | `"64a1b2..."` |
| `location` | String | Yes | Where the disaster is | `"Colombo 07"` |
| `status` | String | Yes | Current state (pending/approved) | `"pending"` |
| `priority_level`| String | Yes | Set by AI (CRITICAL/MODERATE/LOW)| `"CRITICAL"` |

**Collection: prolog_analysis**
| Field Name | Data Type | Required | Plain Language Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Unique ID of the analysis | `64a1b2c3d4e7` |
| `request_id` | String | Yes | The request this analysis belongs to | `"64a1b2..."` |
| `priority_label`| String | Yes | The final AI decision | `"CRITICAL"` |
| `risk_flags` | Array | No | List of warnings detected by AI | `["ROAD BLOCKED"]` |
| `substitutes` | Array | No | Suggested alternative medicines | `[{"item": "paracetamol"}]` |

**Collection: inventory**
| Field Name | Data Type | Required | Plain Language Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Unique ID of the supply | `64a1b2c3d4e8` |
| `item_name` | String | Yes | What the item is | `"Paracetamol"` |
| `category` | String | Yes | Type of item | `"medicine"` |
| `quantity` | Number | Yes | How many are left in the warehouse | `5000` |

**Collection: bookings (donor_bookings)**
| Field Name | Data Type | Required | Plain Language Description | Example Value |
|---|---|---|---|---|
| `_id` | ObjectId | Yes | Unique ID of the booking | `64a1b2c3d4e9` |
| `request_id` | String | Yes | The request being fulfilled | `"64a1b2..."` |
| `donor_id` | String | Yes | The user who promised the donation | `"64a1b2..."` |
| `amount_pledged`| Number | Yes | The amount of money/items promised | `500` |

### 4c. MongoDB Plain Language Explanation
*   **Why MongoDB over SQL:** SQL databases use rigid tables (like Excel), which are hard to change if we suddenly need to track a new data point during a disaster. MongoDB stores data as flexible "documents" (like a digital filing cabinet full of customizable forms). This allows us to adapt rapidly without breaking the database.
*   **What a Collection is:** A collection is just a digital folder holding a specific type of document. The `users` collection holds user files; the `inventory` collection holds supply files.
*   **What an ObjectId is:** Instead of numbering items 1, 2, 3 (which causes issues if two servers try to make item #4 at the exact same millisecond), MongoDB automatically generates a complex alphanumeric string based on time and machine ID. It guarantees absolute uniqueness across the globe.
*   **Linking:** Documents link to each other by storing these ObjectIds. A `Request` document stores the `creator_id` of the user who made it. To find out who made the request, the backend simply looks up the user with that matching ID.

---

## SECTION 5 — AI COMPONENT EXPLANATION (Prolog)

### 5a. What is Prolog
Prolog is a "logic programming language." Unlike Python or JavaScript, where you write step-by-step instructions on *how* to solve a problem, in Prolog you simply declare facts and rules about the world, and ask Prolog a question. Prolog then uses mathematical logic to figure out the answer on its own. 

It is the perfect tool for an **expert system**—a type of AI designed to mimic the decision-making ability of a human expert. Instead of a human staring at a request and trying to remember if a blocked road means it's critical, AURA uses Prolog to instantly apply predefined expert rules with zero human error.

### 5b. How Prolog is Connected to the Backend
Because Prolog and Python are different languages, we use a tool called **pyswip**. Pyswip is a bridge that allows Python code to start up a Prolog engine, ask it a question, and read the answer back into Python.

**The Flow:**
1. A GN Officer submits a relief request via the browser.
2. The FastAPI Python server receives it and saves it to MongoDB.
3. Python wakes up the Prolog engine (via pyswip) and feeds it the facts of the request (e.g., "road is blocked", "population is large").
4. Prolog applies its rules and calculates the priority ("CRITICAL") and any risk flags.
5. Python reads the result from Prolog, updates the database, and the frontend instantly turns the request card RED.

### 5c. The Three Prolog Files

**`priority_rules.pl`**
This file dictates how urgent a request is.
*   **Rule Example:** `assign_priority(medicine, blocked, _, _, red) :- !.`
*   **Plain English:** "If the request is for medicine, AND the roads are blocked, assign the priority 'red' immediately (ignore population or stock levels, people will die without medicine if roads are blocked)."
*   **Example Input 1:** Medicine, Roads Blocked → Result: CRITICAL (Red)
*   **Example Input 2:** Shelter, Roads Blocked → Result: MODERATE (Orange)
*   **Example Input 3:** Food, Roads Clear, Stock Available → Result: LOW (Yellow)

**`medicine_kb.pl`**
This is a "Knowledge Base"—a dictionary of medical facts compiled by doctors. 
*   **Safe Substitutes:** It states that if `paracetamol` is empty, `ibuprofen` can be used. If `oral_rehydration_salts` are empty, `coconut_water` can be used. 
*   **Critical Drugs:** It explicitly states that `insulin` and `epinephrine` have `no_substitute`. 
*   **How get_substitute works:** If Python asks Prolog "What is a substitute for ampicillin?", Prolog searches the facts, finds `substitute(ampicillin, amoxicillin)`, and returns "Amoxicillin is better absorbed orally."

**`risk_assessment.pl`**
This file looks for hidden dangers by combining data points.
*   **Risk Flags:** It detects things like mass starvation risk or civil unrest.
*   **Example Scenario:** A GN Officer requests Food for a Large population, but the warehouse stock is Empty.
*   **Triggered Flag:** Prolog detects this combination and throws the flag: *"FOOD SHORTAGE (LARGE): Risk of civil unrest — prioritise security escort."*

### 5d. AI Results Stored in the Database
Once Prolog finishes, the Python backend saves a new document in the `prolog_analysis` collection.
*   **priority_label:** It transforms the Prolog "red" output into `CRITICAL`. This strict label ensures the frontend colors the UI accurately.
*   **priority_score:** An integer representation (e.g., 100 for Critical, 50 for Moderate). This allows the MongoDB database to mathematically sort thousands of requests instantly, putting the 100s at the very top of the Admin's screen.

---

## SECTION 6 — FEATURE LIST WITH EXPLANATIONS

1. **User Registration and Login (JWT Auth)**
   * **Used By:** Everyone.
   * **Problem Solved:** Keeps unauthorized users out and secures sensitive data.
   * **How it works:** User types email/password. Backend hashes password, compares it, and issues a JWT VIP pass. The React app stores this pass in localStorage.
2. **Role-based Access Control**
   * **Used By:** System Router.
   * **Problem Solved:** Prevents a GN Officer from accidentally deleting warehouse inventory meant for Admins.
   * **How it works:** The JWT token contains the user's role. React Router checks this role and explicitly blocks access to pages the user doesn't own, redirecting them to their respective dashboard.
3. **GN Officer Relief Request Submission**
   * **Used By:** GN Officers.
   * **Problem Solved:** Standardizes how requests are made so data is clean.
   * **How it works:** Officer fills out a React form (population, road status, items). On submit, it hits the FastAPI `/requests` endpoint and saves to MongoDB.
4. **Automatic Prolog AI Analysis**
   * **Used By:** Background System.
   * **Problem Solved:** Removes human bias and slowness from triage.
   * **How it works:** A FastAPI "Background Task" triggers `prolog_worker_cli.py` silently in the background, updating the priority level without making the user wait.
5. **Admin Priority Dashboard**
   * **Used By:** Super Admins.
   * **Problem Solved:** Shows Admins what to fix first.
   * **How it works:** Fetches requests sorted by `priority_score` descending. Maps 'CRITICAL' to red pulsing badges using Tailwind CSS.
6. **Inventory Management**
   * **Used By:** Super Admins & GN Officers.
   * **Problem Solved:** Tracks what is physically in the warehouse.
   * **How it works:** Users can add, edit, or delete items via a data table. A backend patch endpoint updates the quantity in MongoDB.
7. **Medicine Substitute Suggestions**
   * **Used By:** Prolog Engine.
   * **Problem Solved:** Saves lives when exact medical supplies run out.
   * **How it works:** If a requested item's stock is zero, Python queries `medicine_kb.pl` and attaches the substitute to the request details.
8. **Risk Flag Detection**
   * **Used By:** Super Admins.
   * **Problem Solved:** Highlights dangers that aren't obvious at first glance.
   * **How it works:** Prolog `risk_assessment.pl` returns an array of strings (warnings), which React renders as high-visibility alerts on the Request Card.
9. **Public Donor Board**
   * **Used By:** Unregistered Donors.
   * **Problem Solved:** Allows the public to help transparently.
   * **How it works:** A special `/public/board` endpoint returns only requests marked `is_public=True`, stripping away sensitive backend data.
10. **Donor Booking System**
    * **Used By:** Donors.
    * **Problem Solved:** Prevents double-donations where two people buy the same thing.
    * **How it works:** Donor clicks "Pledge Support". Backend creates a record in `donor_bookings` and changes the main request status to `ongoing`.
11. **Status Lifecycle Updates**
    * **Used By:** Super Admins.
    * **Problem Solved:** Tracks the logistics pipeline.
    * **How it works:** Admin changes dropdown from "Pending" to "Dispatched" to "Completed". The API `PATCH` endpoint updates MongoDB instantly.
12. **Real-time Statistics Display**
    * **Used By:** All dashboards.
    * **Problem Solved:** Gives an at-a-glance health check of the crisis.
    * **How it works:** The `StatsStrip.jsx` component filters the local request arrays (e.g., `requests.filter(r => r.status === 'pending').length`) to show live counts of Critical/Moderate/Low emergencies.

---

## SECTION 7 — DESIGN DIAGRAMS

### 7a. USE CASE DIAGRAM

```text
Actor: GN Officer
  ├── Submit Relief Request
  └── View Own Requests

Actor: Super Admin
  ├── View All Requests (Priority Sorted)
  ├── Update Request Status
  └── Manage Inventory (Add/Edit/Delete)

Actor: Donor
  ├── View Public Relief Board
  └── Book/Pledge Donation

Actor: Prolog System (Automated)
  ├── <<includes>> Analyze Request Priority
  ├── <<includes>> Detect Risk Flags
  └── <<includes>> Suggest Medicine Substitutes
```

### 7b. SEQUENCE DIAGRAM (Request Submission & AI Analysis)

```text
GN Officer       React UI       FastAPI Server      MongoDB      Prolog Engine
    |               |                 |                |               |
    |-- Fills form->|                 |                |               |
    |               |-- POST JSON --->|                |               |
    |               |                 |-- Insert ----> |               |
    |               |                 |<-- success --- |               |
    |               |<-- 201 Created--|                |               |
    |<-- UI updates |                 |                |               |
    |               |                 |-- Query facts----------------->|
    |               |                 |                |               |
    |               |                 |<-- Returns CRITICAL, Flags ----|
    |               |                 |                |               |
    |               |                 |-- Update priority/score -----> |
    |               |                 |<-- success --- |               |
```

### 7c. CLASS DIAGRAM

```text
+----------------------+        +-------------------------+
|       User           |        |      ReliefRequest      |
+----------------------+        +-------------------------+
| - id: ObjectId       | 1    * | - id: ObjectId          |
| - email: String      |--------| - creator_id: String    |
| - password: String   |        | - location: String      |
| - role: String       |        | - status: String        |
+----------------------+        | - priority_level: String|
                                +-------------------------+
                                            | 1
                                            |
                                            | 1
+----------------------+        +-------------------------+
|    InventoryItem     |        |      PrologAnalysis     |
+----------------------+        +-------------------------+
| - id: ObjectId       |        | - id: ObjectId          |
| - item_name: String  |        | - request_id: String    |
| - quantity: Number   |        | - priority_label: String|
| - category: String   |        | - risk_flags: List      |
+----------------------+        +-------------------------+
```

### 7d. ER DIAGRAM (Detailed)

```text
ENTITY: USERS
  - _id (PK)
  - email (UNIQUE)
  - hashed_password
  - full_name
  - role (ENUM: super_admin, gn_officer, donor)
  - is_active (BOOLEAN)

ENTITY: REQUESTS
  - _id (PK)
  - creator_id (FK -> USERS._id)
  - location
  - road_accessibility (ENUM: clear, partial, blocked)
  - population_size (ENUM: small, medium, large)
  - status (ENUM: pending, ongoing, completed)
  - priority_level (ENUM: CRITICAL, MODERATE, LOW)
  - is_public (BOOLEAN)

ENTITY: INVENTORY
  - _id (PK)
  - item_name
  - category
  - quantity
  - condition
  - location

ENTITY: BOOKINGS
  - _id (PK)
  - donor_id (FK -> USERS._id)
  - request_id (FK -> REQUESTS._id)
  - amount_pledged
  - booked_at (TIMESTAMP)

RELATIONSHIPS:
  - USERS (1) to REQUESTS (Many)
  - USERS (1) to BOOKINGS (Many)
  - REQUESTS (1) to BOOKINGS (Many)
```

---

## SECTION 8 — API ENDPOINTS REFERENCE

### Authentication Endpoints
| Method | URL Path | Access | Plain Language | Request Body | Response | Errors |
|---|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Creates a new user account | Email, Password, Name, Role | User info (no password) | 400 Email exists |
| `POST` | `/api/auth/login` | Public | Checks password, returns VIP JWT | Email, Password | JWT Access Token | 401 Invalid creds |
| `GET` | `/api/auth/me` | Auth | Gets logged-in user profile | None | User profile | 401 Unauthorized |

### Request Endpoints
| Method | URL Path | Access | Plain Language | Request Body | Response | Errors |
|---|---|---|---|---|---|---|
| `POST` | `/api/requests` | Admin, GN | Submits a new relief request | Location, Items, Pop size | Created Request | 500 DB error |
| `GET` | `/api/requests` | Admin, GN | Gets all requests | None | List of Requests | 401 Unauthorized |
| `GET` | `/api/requests/my` | Auth | Gets requests created by current user | None | List of Requests | 401 Unauthorized |
| `PATCH`| `/api/requests/{id}/status` | Admin | Changes status (e.g., to "completed") | Status string | Updated Request | 404 Not Found |

### Inventory Endpoints
| Method | URL Path | Access | Plain Language | Request Body | Response | Errors |
|---|---|---|---|---|---|---|
| `GET` | `/api/inventory` | Auth | Lists all warehouse stock | None | List of Items | 401 Unauthorized |
| `POST` | `/api/inventory` | Admin | Adds a new item to stock | Name, Category, Qty | Created Item | 500 DB Error |
| `PATCH`| `/api/inventory/{id}` | Admin | Edits stock levels/details | Edit fields | Updated Item | 404 Not found |
| `DELETE`| `/api/inventory/{id}` | Admin | Removes item entirely | None | Success message | 404 Not found |
| `POST`| `/api/inventory/{id}/book`| Admin, GN| Books specific quantity of an item| Quantity | Success & Remaining Qty | 400 Insufficient stock |

### Logic / Prolog Endpoints
| Method | URL Path | Access | Plain Language | Request Body | Response | Errors |
|---|---|---|---|---|---|---|
| `POST` | `/api/logic/analyze/{id}` | Admin, GN | Manually triggers Prolog AI on request | None | Priority & Flags | 404 Request missing |
| `GET` | `/api/logic/analysis/{id}` | Auth | Views past AI analysis results | None | Analysis Data | 404 No analysis |

### Public Board Endpoints
| Method | URL Path | Access | Plain Language | Request Body | Response | Errors |
|---|---|---|---|---|---|---|
| `GET` | `/api/public/board` | Public | Gets approved, public requests only | None | List of Requests | None |
| `GET` | `/api/public/stats` | Public | Gets live numbers for homepage counters | None | Stats Object | None |
| `POST` | `/api/public/book` | Donor | Donor pledges to fulfill a request | Request ID, Amount | Success & ID | 500 Booking fail |
| `GET` | `/api/public/my-contributions` | Donor | Gets the donor's past bookings | None | List of Contributions | 401 Unauthorized |

---

## SECTION 9 — HOW THE FRONTEND AND BACKEND CONNECT

### 9a. The API Service Layer
All network communication is isolated inside `frontend/src/api/index.js`. We do this so that if the backend URL changes, we only have to update one file, not 50 different React components.
**Example:** When a component wants data, it imports `getInventory()`. Inside `index.js`, `getInventory()` runs the Javascript `fetch()` command, attaches the JWT token, waits for the JSON response, and hands it back to the component.

### 9b. Authentication Flow
1. User types password on `LoginPage.jsx`.
2. React calls `loginUser(email, password)` in the API layer.
3. Backend validates password and sends back a JWT (e.g., `eyJhb...`).
4. React passes this token to `AuthContext.jsx`.
5. AuthContext saves the token in `localStorage` (so it survives page refreshes) and updates the global state.
6. Now, every single time `api/index.js` sends a fetch request, it reads the token from localStorage and adds it to the HTTP Headers (`Authorization: Bearer eyJhb...`).
7. If the token expires, the backend replies with a 401 error. The API layer catches this, clears the localStorage, and dispatches a forced logout event.

### 9c. Data Transformation Layer
Sometimes, systems speak different languages. The Prolog AI thinks in basic colors (`red`, `orange`, `yellow`), but our React frontend expects strict enterprise constants (`CRITICAL`, `MODERATE`, `LOW`). 
To fix this, the backend `prolog_worker_cli.py` contains a transformation function `_map_priority_label(color)` that automatically converts "red" to "CRITICAL" before saving it to the database. This ensures the frontend receives exactly what it expects without having to write messy conversion logic in React.

### 9d. Protected Routes
`ProtectedRoute.jsx` acts like a bouncer. It wraps around sensitive pages in `App.jsx`.
If a Donor tries to visit `/dashboard/admin`, the `ProtectedRoute` component intercepts the load. It checks the JWT token to see the user's role. It notices `"donor"` is not in the `allowedRoles` array (`["super_admin"]`). It immediately cancels the load and forcibly redirects the user's browser back to their own dashboard using React Router's `<Navigate>` component.

---

## SECTION 10 — UI COMPONENTS GUIDE

AURA uses a sleek, dark-mode "command centre" aesthetic. The color palette utilizes deep grays (`aura-bg`), neon accents (`aura-amber`, `aura-accent`), and semantic status colors (`aura-red` for critical danger). This dark theme was chosen specifically to reduce eye strain for operators working 24/7 shifts in disaster command centers.

*   **Badge:** A small pill-shaped indicator. Used to show priority levels. *Accepts:* `text`, `variant`. *Example:* `<Badge variant="critical">CRITICAL</Badge>` renders a glowing red box with text.
*   **Button:** Interactive click targets. *Accepts:* `onClick`, `variant` (primary, ghost, outline). *Example:* The "Submit" button on forms.
*   **Card:** A rounded, border-styled container that separates content blocks from the background. *Used in:* Request lists, Inventory tables.
*   **Input & Textarea:** Styled form elements for typing text.
*   **LoadingSpinner:** An animated SVG circle that spins to indicate network activity.
*   **Modal:** A pop-up overlay window that darkens the background. *Used in:* "Add New Supply" form.
*   **Navbar:** The top horizontal bar showing the user's name and a glowing "OPS ACTIVE" indicator.
*   **Sidebar:** The left vertical navigation menu. Collapses on mobile devices.
*   **Select:** A styled dropdown menu. *Used for:* Picking "pending" vs "completed" status.
*   **RequestCard:** A large, complex card displaying a specific disaster relief request, its location, and required items. *It accepts a `request` object prop and automatically formats dates and truncates long strings.*
*   **StatsStrip:** A horizontal row of 4 KPI boxes (Total, Critical, Moderate, Low). *Accepts a `requests` array prop and mathematically calculates the totals.*
*   **Table:** Displays tabular data with columns and rows.
*   **ToggleSwitch:** A switch element to toggle boolean states.
*   **FilterBar:** A row containing inputs and selects to filter results.
*   **StatusBadge:** Similar to Badge but visually specific for "pending", "ongoing", "completed" text.

---

## SECTION 11 — TESTING EVIDENCE

### Testing Strategy
We utilized **Comprehensive Manual Systems Testing**, simulating worst-case scenarios and malicious user behavior. We heavily tested edge cases: what happens if the backend returns null data? What happens if strings are 2,000 characters long? What happens if a token expires mid-session? We patched all identified crashes to ensure robust stability. We used browser developer tools to artificially manipulate network speeds and responses to guarantee the UI handles loading and error states safely.

### Testing Table

| Test ID | Feature Tested | Test Action / Input | Expected Result | Status |
|---|---|---|---|---|
| T-01 | Auth Login | Login with valid credentials for each role | User routed to correct dashboard | PASS |
| T-02 | Auth Fail | Login with wrong password | "Invalid credentials" error, no crash | PASS |
| T-03 | Roles | GN Officer accessing admin page | Redirected back to GN Dashboard | PASS |
| T-04 | Request Submit | Submitting a request with all fields filled | API returns 201 Created | PASS |
| T-05 | Validation | Submitting a request with missing fields | UI blocks submission, shows error | PASS |
| T-06 | AI Logic | Prolog returning CRITICAL for medicine + blocked roads | AI flags request as CRITICAL immediately | PASS |
| T-07 | AI Logic | Prolog returning LOW for shelter + clear roads | AI flags request as LOW priority | PASS |
| T-08 | AI Knowledge | Medicine substitute returned when stock is zero | UI displays substitute text from Prolog | PASS |
| T-09 | Public Board | Public board showing only public requests | Requests marked private do not appear | PASS |
| T-10 | Bookings | Donor booking a request | DB creates donor_booking, status updates | PASS |
| T-11 | Admin Ops | Admin updating request status | DB updates status to "dispatched" | PASS |

---

## SECTION 12 — Q&A PREPARATION GUIDE

**1. Why was Prolog chosen as the AI engine instead of Machine Learning?**
*Answer:* Machine Learning requires massive amounts of historical data to guess the right answer, and it can hallucinate. Prolog is an expert system that relies on absolute, human-defined rules. In disaster relief, we cannot afford guesses; we need guaranteed, predictable logic.

**2. How does the priority system work?**
*Answer:* When a request is made, the Python backend sends the road conditions, population, and supply category to Prolog. Prolog checks these facts against its rules. If it sees "Medicine + Blocked Roads", a rule fires that forces a Critical priority.

**3. How do the frontend and backend communicate?**
*Answer:* They communicate over the internet using a REST API. The React frontend sends HTTP requests carrying JSON data to the FastAPI backend, which processes it and sends JSON back.

**4. What is JWT and how does it work?**
*Answer:* JWT is a digital VIP pass. Instead of sending a password with every click, the server gives you a token when you log in. The frontend attaches this token to all future requests to prove you are authenticated.

**5. Why use MongoDB instead of SQL?**
*Answer:* Disasters are chaotic. If we suddenly need to track a new data point (like "flood water height"), SQL requires us to rewrite rigid table schemas. MongoDB stores flexible documents, letting us adapt on the fly.

**6. What happens if Prolog fails or crashes?**
*Answer:* The backend is designed with graceful fallbacks. If Prolog fails, the system defaults the request priority to "LOW" (Standard) so that the request isn't lost, and Admins can manually triage it.

**7. How are roles enforced securely?**
*Answer:* Roles are checked in two places: The React frontend hides pages from unauthorized users, and more importantly, the FastAPI backend verifies the JWT token on every API call. Even if a user hacks the frontend, the backend will reject their request.

**8. What exactly does pyswip do?**
*Answer:* It's the bridge. Python doesn't naturally speak Prolog. Pyswip is a library that allows Python to spin up a Prolog instance, send it strings of logic, and read the results.

**9. Why did you use React for the frontend?**
*Answer:* React allows us to build Single Page Applications (SPAs). This means the page never refreshes. In a command center where seconds matter, navigating between tabs instantly is a massive UX advantage.

**10. How does a GN Officer submit a request?**
*Answer:* They log in, fill out a simple React form with the location, population, road status, and items needed, and hit submit. The data is validated and saved to MongoDB.

**11. What is a "Knowledge Base" in this context?**
*Answer:* It is the `medicine_kb.pl` file. It acts as a digital doctor. It stores hard facts, like "Ibuprofen is a substitute for Paracetamol", so the system can automatically suggest alternatives when stock runs out.

**12. What does a Sequence Diagram show that a Class Diagram doesn't?**
*Answer:* A Class Diagram shows how things are structured statically (like a blueprint of a house). A Sequence Diagram shows how things *act* over time (like a video of a person walking through the house).

**13. How do medicine substitutes work?**
*Answer:* If the inventory shows zero stock for a requested item, Python asks Prolog for a substitute. Prolog checks its facts, finds the match, and returns the substitute name along with a medical reason why it is safe.

**14. What is the Public Board for?**
*Answer:* It creates transparency and crowdsources relief. Citizens and foreign donors can see exactly what is needed (e.g., 50 tents in Colombo) and pledge to fulfill it without needing a government login.

**15. How is inventory managed?**
*Answer:* Super Admins and GN Officers use the Inventory page to Add, Edit, or Delete supplies. The backend updates the total quantity in the MongoDB `inventory` collection in real-time.

**16. What is CORS and why is it needed?**
*Answer:* Cross-Origin Resource Sharing. Because our React frontend runs on port 5173 and FastAPI runs on port 8000, browsers naturally block communication between them for security. CORS is the backend policy that explicitly allows the frontend to talk to it.

**17. What happens if the token expires?**
*Answer:* The backend rejects the next API call with a 401 error. The frontend catches this, deletes the expired token, and redirects the user back to the login screen automatically.

**18. How does data flow from the form to the database?**
*Answer:* The user types in React -> React creates a JSON object -> React sends an HTTP POST request via `fetch` -> FastAPI receives it -> Pydantic validates the data shape -> PyMongo inserts it into the database.

**19. What is Pydantic validation?**
*Answer:* It's an automated bouncer for data. If the database expects a number for "population size" but a hacker sends the text "hello", Pydantic blocks the request before it crashes the database.

**20. What would you improve if you had more time?**
*Answer:* We would implement WebSockets for true real-time UI updates (no page refreshes needed when new requests arrive), and add Google Maps integration to visually plot the disaster zones.

---

## SECTION 13 — PRESENTATION SCRIPT

**Opening (30 seconds):**
"Good morning evaluators. We are excited to present Project AURA: The Automated Urgent Relief Architecture. AURA is a full-stack, AI-driven disaster management system built specifically for crisis response in Sri Lanka."

**Problem Statement (1 minute):**
"During floods and landslides, Grama Niladhari officers on the ground are overwhelmed. They request supplies, but central command centers receive hundreds of these requests simultaneously. Historically, humans have to manually read and sort them. This is slow, prone to human error, and costs lives because critical situations aren't prioritized fast enough."

**Solution Overview (1 minute):**
"AURA solves this by taking the human out of the triage process. We built an application where ground officers submit requests, and an integrated Artificial Intelligence engine instantly analyzes the road conditions and population size. It automatically classifies the request as Critical, Moderate, or Low priority, guaranteeing that command centers deploy resources to the most desperate areas first."

**Architecture Walkthrough (2 minutes):**
"To achieve this, we utilized a decoupled architecture. 
Our frontend is a blazing-fast React interface built with Tailwind CSS, ensuring a responsive, dark-mode 'command center' aesthetic.
Our backend is built on FastAPI, which handles all data validation and communicates with a flexible MongoDB database. 
Crucially, our backend is connected to SWI-Prolog via pyswip. Prolog acts as our expert system, running the heavy logical deductions independently from the web server."

**Live Demo Script (3 minutes):**
*(Step 1: Open the public board)*
"Here is the public donor board. Any citizen can view approved requests and pledge support transparently."
*(Step 2: Login as GN Officer)*
"Now, we will log in as a GN Officer on the ground. Notice how JWT authentication instantly routes us to the local dashboard."
*(Step 3: Submit a request)*
"We are submitting a request for medicine. We will mark the roads as 'blocked' due to flooding."
*(Step 4: Show Prolog result)*
"The moment we hit submit, the Prolog engine runs in the background. It detects the blocked roads and instantly flags this request with a CRITICAL priority."
*(Step 5: Login as Admin)*
"Switching over to the Super Admin command center..."
*(Step 6: Show priority sorting)*
"You can see the request we just made is pinned directly to the top of the board in red, mathematically sorted above standard requests, waiting for immediate dispatch."

**AI Explanation (1 minute):**
"Why did we use Prolog instead of Machine Learning? Because in disaster relief, we need guarantees, not guesses. Prolog is a logic engine. We programmed it with hard facts and rules from medical and logistical experts. If a road is blocked and people need medicine, Prolog doesn't 'guess' it's critical—it mathematically proves it based on absolute rules. It also checks our `medicine_kb` to suggest safe substitutes if our warehouse is empty."

**Closing (30 seconds):**
"In conclusion, AURA bridges the gap between chaotic ground zeroes and organized command centers. It is scalable, secure, fully tested, and ready to save lives. Thank you, we are now open for Q&A."
