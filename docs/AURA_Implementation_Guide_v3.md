# AURA — Complete Developer Implementation Guide (v3)
**Automated Urgent Relief Allocation**
*React + FastAPI + MongoDB + SWI-Prolog*

---

# ═══════════════════════════════════════════════════
# HOW TO USE THIS DOCUMENT — READ THIS FIRST
# ═══════════════════════════════════════════════════

This document is split into two sections:

## SECTION A — CODE
These are complete, ready-made files you create yourself and paste code into directly.
You do NOT need AI for these. They are short, critical, foundational files that must
be exact. If you get these wrong, nothing else works.

**How to use Section A:**
1. Create the file at the path shown
2. Copy the code block below the file path
3. Paste it in and save

Example:
  ┌─────────────────────────────────────────────────┐
  │ FILE: backend/app/database.py                   │
  │ → Create this file, paste the code, save it.   │
  └─────────────────────────────────────────────────┘

## SECTION B — PROMPTS
These are prompts you copy and paste into Antigravity.
Antigravity will generate the code for you.
You then take that generated code, create the file at the path shown,
and paste the generated code into it.

**How to use Section B:**
1. Read the "SAVE TO:" line — that tells you where the generated code will go
2. Copy the entire prompt box
3. Paste it into Antigravity and get the generated code
4. Create the file at the path shown in "SAVE TO:"
5. Paste the generated code into that file and save

Example:
  ┌─────────────────────────────────────────────────────────────────┐
  │ PROMPT FOR: backend/app/routers/auth.py                        │
  │ SAVE TO:    backend/app/routers/auth.py                        │
  │ → Copy the prompt → Paste into Antigravity → Get code back    │
  │ → Create the file → Paste generated code → Save               │
  └─────────────────────────────────────────────────────────────────┘

## The Order to Follow (Important)
Do not skip ahead. Build in this exact order:

  Week 1, Days 1-7:
    Day 1 → Install everything (Python, SWI-Prolog, MongoDB)
    Day 2 → Section A: database.py, auth.py, dependencies.py, main.py
    Day 3 → Section A: All three Prolog .pl files + test them
    Day 4 → Section A: prolog_engine.py + test it in isolation
    Day 5 → Section B Prompts: auth router, requests router
    Day 6 → Section B Prompts: inventory router, logic router, public router
    Day 7 → Section B Prompt: schemas.py

  Week 2, Days 8-14:
    Day 8  → Section A: AuthContext.jsx, App.jsx, api/index.js
    Day 9  → Section B Prompt: Login page
    Day 10 → Section B Prompt: NewRequest page
    Day 11 → Section B Prompt: Admin Dashboard
    Day 12 → Section B Prompt: Public Board
    Day 13 → Section B Prompt: Inventory page
    Day 14 → End-to-end testing, demo data, polish

---

# ═══════════════════════════════════════════════════
# MY OPINION: MONGODB vs MySQL FOR THIS PROJECT
# ═══════════════════════════════════════════════════

You asked for my honest opinion, so here it is.

## The honest case FOR MySQL (what your proposal originally said):

Your data in AURA is actually quite relational. A Request belongs to a User.
A Request has many Items. Each Item links to an Inventory entry. An Analysis
belongs to a Request. This is textbook relational data — exactly what MySQL
was designed for. Foreign keys would enforce data integrity automatically
(you cannot have a RequestItem pointing to a Request that doesn't exist).
Joins let you pull a request with its officer, items, and analysis in one
query. For a project where the panel will scrutinise the database design,
a well-normalised MySQL schema demonstrates solid Computer Science knowledge.

## The honest case FOR MongoDB (what you have decided):

MongoDB stores data as documents (like JSON objects), so you can embed
related data directly. For example, you can store request_items *inside* the
request document instead of in a separate table — no joins needed. This makes
reads faster and the code simpler for a solo developer on a tight deadline.
MongoDB also stores the Prolog analysis results (which are JSON-like arrays
and objects) very naturally — no need to serialize/deserialize JSON into SQL
columns. For a 2-week sprint, the flexibility of schema-less documents means
you can add fields without running ALTER TABLE migrations. It is also more
modern and used heavily in real-world Node/Python projects.

## My recommendation:

Since you have already decided on MongoDB, go with it. The tradeoffs are
manageable for a 2-week project and the flexibility will genuinely help you
move faster. Just be aware of one thing: MongoDB does NOT enforce relationships
between collections. This means you must be careful in your Python code to
maintain data consistency yourself (e.g. when you delete a request, also
delete its analysis document manually). The guide below accounts for this.

---

# ═══════════════════════════════════════════════════
# ARCHITECTURE OVERVIEW
# ═══════════════════════════════════════════════════

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER                                │
│             React + Vite + Tailwind (existing frontend)         │
│     Login / Dashboard / NewRequest / PublicBoard / Inventory    │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTP fetch
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI (Python)                           │
│  Routers: /auth  /requests  /inventory  /logic  /public        │
│  Middleware: JWT auth, CORS                                     │
└────────────┬──────────────────────────────┬─────────────────────┘
             │                              │
             ▼                              ▼
┌────────────────────────┐      ┌────────────────────────────────┐
│   MongoDB              │      │   SWI-Prolog Engine            │
│   Collections:         │      │   priority_rules.pl            │
│   - users              │      │   medicine_kb.pl               │
│   - inventory          │      │   risk_assessment.pl           │
│   - requests           │      │                                │
│   - prolog_analysis    │      │   Called via pyswip library    │
│   - donor_bookings     │      │   Returns: priority, subs,     │
└────────────────────────┘      │   risk flags                   │
                                └────────────────────────────────┘
```

## MongoDB Document Design

Unlike SQL tables, MongoDB stores flexible JSON-like documents.
Here is what each collection's documents look like:

**users collection:**
```json
{
  "_id": ObjectId("..."),
  "name": "Aakil Ahamad",
  "email": "aakil@example.com",
  "hashed_password": "$2b$12$...",
  "role": "gn_officer",
  "location": "Horana, Kalutara",
  "is_active": true,
  "created_at": "2026-03-26T10:00:00Z"
}
```

**inventory collection:**
```json
{
  "_id": ObjectId("..."),
  "item_name": "Paracetamol 500mg",
  "category": "medicine",
  "quantity": 5,
  "unit": "packets",
  "prolog_item_key": "paracetamol",
  "updated_at": "2026-03-26T10:00:00Z"
}
```

**requests collection** (items are embedded — no separate collection needed):
```json
{
  "_id": ObjectId("..."),
  "gn_officer_id": "ObjectId as string",
  "gn_officer_name": "Aakil Ahamad",
  "location": "Horana, Kalutara",
  "description": "Village flooded, 200 families need medicine",
  "road_status": "blocked",
  "population_size": "large",
  "status": "pending",
  "is_public": true,
  "items": [
    {
      "inventory_id": "ObjectId as string or null",
      "item_name": "Paracetamol 500mg",
      "category": "medicine",
      "prolog_item_key": "paracetamol",
      "quantity_needed": 50,
      "current_stock": 5
    }
  ],
  "created_at": "2026-03-26T10:00:00Z"
}
```

**prolog_analysis collection:**
```json
{
  "_id": ObjectId("..."),
  "request_id": "ObjectId as string",
  "priority_level": "red",
  "priority_score": 90,
  "reasoning": "Category: medicine. Road: blocked...",
  "suggested_substitutes": [
    { "requested": "paracetamol", "substitute": "ibuprofen", "reason": "..." }
  ],
  "risk_flags": ["Roads blocked — aerial delivery may be required"],
  "analyzed_at": "2026-03-26T10:00:00Z"
}
```

**donor_bookings collection:**
```json
{
  "_id": ObjectId("..."),
  "donor_id": "ObjectId as string",
  "donor_name": "Mohamed Muzaffer",
  "request_id": "ObjectId as string",
  "notes": "I have 30 packets of paracetamol",
  "status": "booked",
  "booked_at": "2026-03-26T10:00:00Z"
}
```

---

# ═══════════════════════════════════════════════════
# PROJECT FILE STRUCTURE
# ═══════════════════════════════════════════════════

```
aura/
│
├── frontend/                          ← Your existing React/Vite app
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js               ← [SECTION A] All fetch calls here
│   │   ├── components/
│   │   │   ├── PriorityBadge.jsx      ← [SECTION A] Small reusable component
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx              ← [SECTION B PROMPT]
│   │   │   ├── Dashboard.jsx          ← [SECTION B PROMPT]
│   │   │   ├── NewRequest.jsx         ← [SECTION B PROMPT]
│   │   │   ├── PublicBoard.jsx        ← [SECTION B PROMPT]
│   │   │   └── Inventory.jsx          ← [SECTION B PROMPT]
│   │   ├── context/
│   │   │   └── AuthContext.jsx        ← [SECTION A]
│   │   ├── App.jsx                    ← [SECTION A]
│   │   └── main.jsx
│   └── .env
│
├── backend/
│   ├── prolog/                        ← [SECTION A] All Prolog files
│   │   ├── priority_rules.pl
│   │   ├── medicine_kb.pl
│   │   └── risk_assessment.pl
│   ├── app/
│   │   ├── __init__.py                ← [SECTION A] Empty file
│   │   ├── main.py                    ← [SECTION A]
│   │   ├── database.py                ← [SECTION A]
│   │   ├── auth.py                    ← [SECTION A]
│   │   ├── dependencies.py            ← [SECTION A]
│   │   ├── prolog_engine.py           ← [SECTION A]
│   │   ├── schemas.py                 ← [SECTION B PROMPT]
│   │   └── routers/
│   │       ├── __init__.py            ← [SECTION A] Empty file
│   │       ├── auth.py                ← [SECTION B PROMPT]
│   │       ├── requests.py            ← [SECTION B PROMPT]
│   │       ├── inventory.py           ← [SECTION B PROMPT]
│   │       ├── logic.py               ← [SECTION B PROMPT]
│   │       └── public.py              ← [SECTION B PROMPT]
│   ├── test_prolog.py                 ← [SECTION B PROMPT]
│   ├── .env
│   └── requirements.txt               ← [SECTION A]
│
└── README.md
```

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION A — CODE
# Create these files yourself and paste the code directly.
# No AI needed for these.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## A-1 · Installation Steps

### Install Python 3.11+
Download from python.org. During install tick "Add Python to PATH."
```bash
python --version    # verify: should say 3.11+
```

### Install SWI-Prolog
Download from swi-prolog.org → Download. During install tick "Add SWI-Prolog to PATH."
```bash
swipl --version     # verify: should show version number
```
If `swipl` is not found after install on Windows, add `C:\Program Files\swipl\bin`
to your system's PATH environment variable manually.

### Install MongoDB
Download MongoDB Community Edition from mongodb.com/try/download/community.
Install with default settings. It runs as a background service automatically.

Also install MongoDB Compass (the free GUI tool) — it lets you see your
database visually, like phpMyAdmin for MySQL.
Download: mongodb.com/products/compass

Verify MongoDB is running:
```bash
mongosh          # opens MongoDB shell — type exit to close
```

### Create virtual environment
```bash
cd aura/backend
python -m venv venv

# Activate — do this every time you open a new terminal:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
# You will see (venv) at the start of your terminal prompt
```

---

## A-2 · FILE: backend/requirements.txt
→ Create this file, paste contents, then run: pip install -r requirements.txt

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
pymongo==4.8.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.1
python-multipart==0.0.12
pydantic[email]==2.9.0
pyswip==0.2.10
```

---

## A-3 · FILE: backend/.env
→ Create this file. NEVER commit it to git.

```
MONGODB_URL=mongodb://localhost:27017
DB_NAME=aura_db
SECRET_KEY=aura-secret-change-this-to-a-long-random-string-minimum-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
```

Also create backend/.gitignore immediately:
```
.env
venv/
__pycache__/
*.pyc
```

---

## A-4 · FILE: frontend/.env
→ Create this file inside your frontend folder.

```
VITE_API_URL=http://localhost:8000
```

---

## A-5 · FILE: backend/app/__init__.py
→ Create this file. Leave it completely empty.
   (Python needs this to treat the folder as a package.)

```python

```

## A-6 · FILE: backend/app/routers/__init__.py
→ Create this file. Leave it completely empty.

```python

```

---

## A-7 · FILE: backend/app/database.py
→ This connects FastAPI to MongoDB. All routers import from here.

```python
"""
database.py
MongoDB connection for AURA.
Import `db` and specific collection variables in your routers.
"""

from pymongo import MongoClient, DESCENDING
from dotenv import load_dotenv
import os

load_dotenv()

# Connect to MongoDB
client = MongoClient(os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
db = client[os.getenv("DB_NAME", "aura_db")]

# Collections — import these directly in routers
users_col    = db["users"]
inventory_col = db["inventory"]
requests_col  = db["requests"]
analysis_col  = db["prolog_analysis"]
bookings_col  = db["donor_bookings"]

# Create indexes for faster queries (run once on startup)
def create_indexes():
    users_col.create_index("email", unique=True)
    requests_col.create_index([("created_at", DESCENDING)])
    requests_col.create_index("is_public")
    requests_col.create_index("status")
    analysis_col.create_index("request_id", unique=True)

create_indexes()
```

---

## A-8 · FILE: backend/app/auth.py
→ JWT token helpers. Used by login and every protected route.

```python
"""
auth.py
Password hashing and JWT token creation/decoding.
"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY  = os.getenv("SECRET_KEY", "fallback-unsafe-key")
ALGORITHM   = os.getenv("ALGORITHM", "HS256")
EXPIRE_MINS = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain-text password. Always store the result, never the original."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Check if a plain password matches its stored hash."""
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    """Create a signed JWT. The token expires after EXPIRE_MINS minutes."""
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=EXPIRE_MINS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    """Decode a JWT. Returns the payload dict, or None if invalid/expired."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
```

---

## A-9 · FILE: backend/app/dependencies.py
→ FastAPI dependency injection. Protects routes by checking the JWT token.

```python
"""
dependencies.py
FastAPI dependencies for authentication and role checking.

Usage in a router:
    from ..dependencies import require_role

    @router.get("/admin-only")
    def admin_route(current_user = Depends(require_role("super_admin"))):
        ...
"""

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from .auth import decode_token
from .database import users_col
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Reads the JWT from the request's Authorization header.
    Returns the user document from MongoDB.
    Raises 401 if token is missing, expired, or invalid.
    """
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token",
                            headers={"WWW-Authenticate": "Bearer"})

    user = users_col.find_one({"_id": ObjectId(payload.get("sub"))})
    if not user:
        raise HTTPException(status_code=401, detail="User account not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    # Convert ObjectId to string so it can be serialised to JSON
    user["_id"] = str(user["_id"])
    return user


def require_role(*roles: str):
    """
    Dependency factory. Checks the user's role after authentication.

    Usage:
        Depends(require_role("super_admin"))
        Depends(require_role("gn_officer", "super_admin"))
    """
    def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"This action requires one of these roles: {', '.join(roles)}"
            )
        return current_user
    return checker
```

---

## A-10 · FILE: backend/app/main.py
→ The FastAPI application entry point. Registers all routers.

```python
"""
main.py
FastAPI application entry point for AURA.

Run with:
    uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, requests, inventory, logic, public

app = FastAPI(
    title="AURA API",
    description="Automated Urgent Relief Allocation — FastAPI + MongoDB + SWI-Prolog",
    version="1.0.0"
)

# Allow the React frontend (running on port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers with their URL prefixes
app.include_router(auth.router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(requests.router,  prefix="/api/requests",  tags=["Requests"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(logic.router,     prefix="/api/logic",     tags=["Prolog Logic Engine"])
app.include_router(public.router,    prefix="/api/public",    tags=["Public Board"])


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "AURA API is running",
        "prolog_engine": "SWI-Prolog via pyswip",
        "database": "MongoDB",
        "api_docs": "http://localhost:8000/docs"
    }
```

**Start the server:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs to see Swagger UI (free interactive API docs).

---

## A-11 · UNDERSTANDING PROLOG (Read Before Writing .pl Files)

Prolog uses two things: **facts** and **rules**.

**Facts** are things that are always true. You declare them.
**Rules** are logic that derives a conclusion from facts.
**Queries** are questions you ask Prolog.

```prolog
% FACT: a substitute for paracetamol is ibuprofen
substitute(paracetamol, ibuprofen, "Ibuprofen reduces fever similarly").

% RULE: if category is medicine AND roads are blocked → priority is red
assign_priority(medicine, blocked, _, _, red) :- !.
%                                               ^^^
%                                               The :- ! means "cut" —
%                                               stop here, don't try other rules.
%                                               This ensures ONE answer.

% QUERY (Python asks this via pyswip):
% assign_priority(medicine, blocked, large, empty, P)
% Prolog fills in P = red
```

The `_` means "I don't care what this value is" — a wildcard.
The `!` (cut) means "this rule matched, stop looking for other matches."
Always put `!` in priority rules. You want exactly one answer.

**Test your .pl files in the SWI-Prolog console BEFORE connecting Python:**
```bash
swipl backend/prolog/priority_rules.pl
# Then type queries manually:
?- assign_priority(medicine, blocked, large, empty, P).
# Expected: P = red.
?- assign_priority(food, clear, small, available, P).
# Expected: P = yellow.
?- halt.   # to exit
```

---

## A-12 · FILE: backend/prolog/priority_rules.pl
→ Core priority classification. The main AI logic of AURA.

```prolog
%% ============================================================
%% AURA — Priority Classification Rules
%% File: priority_rules.pl
%%
%% Determines the relief priority level for incoming requests.
%% Called from Python via pyswip.
%%
%% Predicate:
%%   assign_priority(+Category, +RoadStatus, +PopSize, +StockLevel, -Priority)
%%
%% Inputs:
%%   Category   : medicine | food | shelter | other
%%   RoadStatus : blocked | partial | clear
%%   PopSize    : large | medium | small
%%   StockLevel : empty | low | available
%%
%% Output:
%%   Priority   : red | orange | yellow
%% ============================================================


%% ─── RED RULES (Critical — act immediately) ────────────────

%% Medicine + roads blocked → RED (patients cannot reach hospital)
assign_priority(medicine, blocked, _, _, red) :- !.

%% Medicine + zero stock → RED (no supply available at all)
assign_priority(medicine, _, _, empty, red) :- !.

%% Medicine + large population + low stock → RED (will run out fast)
assign_priority(medicine, _, large, low, red) :- !.

%% Food + blocked roads + large population → RED (mass starvation risk)
assign_priority(food, blocked, large, _, red) :- !.

%% Any category + blocked roads + zero stock → RED
assign_priority(_, blocked, _, empty, red) :- !.


%% ─── ORANGE RULES (Urgent — act within hours) ───────────────

%% Medicine + low stock (roads clear) → ORANGE
assign_priority(medicine, _, _, low, orange) :- !.

%% Medicine + partially blocked roads → ORANGE
assign_priority(medicine, partial, _, _, orange) :- !.

%% Food + large population (roads not blocked) → ORANGE
assign_priority(food, _, large, _, orange) :- !.

%% Food + blocked roads (smaller population) → ORANGE
assign_priority(food, blocked, _, _, orange) :- !.

%% Food + partial roads → ORANGE
assign_priority(food, partial, _, _, orange) :- !.

%% Shelter + blocked roads → ORANGE (people exposed to elements)
assign_priority(shelter, blocked, _, _, orange) :- !.

%% Any category + partial roads + empty stock → ORANGE
assign_priority(_, partial, _, empty, orange) :- !.


%% ─── YELLOW RULES (Standard — schedule within days) ─────────

%% Shelter with accessible roads → YELLOW
assign_priority(shelter, _, _, _, yellow) :- !.

%% Food with clear roads and stock available → YELLOW
assign_priority(food, clear, _, available, yellow) :- !.

%% Other category → YELLOW
assign_priority(other, _, _, _, yellow) :- !.


%% ─── DEFAULT FALLBACK ────────────────────────────────────────
%% If no rule above matched, default to yellow (safe fallback)
assign_priority(_, _, _, _, yellow).


%% ─── TEST QUERIES (run manually in: swipl priority_rules.pl) ─
%% ?- assign_priority(medicine, blocked, large, empty, P).
%%    Expected: P = red.
%% ?- assign_priority(medicine, clear, small, low, P).
%%    Expected: P = orange.
%% ?- assign_priority(food, clear, medium, available, P).
%%    Expected: P = yellow.
%% ?- assign_priority(shelter, blocked, large, low, P).
%%    Expected: P = orange.
%% ?- halt.
```

---

## A-13 · FILE: backend/prolog/medicine_kb.pl
→ Medicine substitute knowledge base.

```prolog
%% ============================================================
%% AURA — Medicine Knowledge Base
%% File: medicine_kb.pl
%%
%% Encodes safe medicine substitutions for when an item is out
%% of stock. This is the "expert system" knowledge base.
%%
%% Predicates:
%%   substitute(+Requested, -Substitute, -Reason)
%%   no_substitute(+Drug)
%%   get_substitute(+Drug, -Result)
%% ============================================================


%% ─── Substitution Facts ─────────────────────────────────────
%% Each fact: substitute(requested_drug, substitute_drug, reason).
%% Drug names use underscores, all lowercase — must match prolog_item_key
%% values stored in MongoDB inventory documents.

substitute(paracetamol, ibuprofen,
    "Ibuprofen reduces fever and pain similarly. Avoid in children under 6 months.").

substitute(ibuprofen, paracetamol,
    "Paracetamol is safer for children and those with stomach sensitivity.").

substitute(amoxicillin, ampicillin,
    "Ampicillin covers a similar spectrum of bacterial infections.").

substitute(ampicillin, amoxicillin,
    "Amoxicillin is better absorbed orally and has similar coverage.").

substitute(oral_rehydration_salts, coconut_water,
    "Emergency hydration alternative. Also prepare home ORS: 1L water, 6 tsp sugar, 0.5 tsp salt.").

substitute(metronidazole, tinidazole,
    "Tinidazole is effective against similar anaerobic and parasitic infections.").

substitute(chloroquine, artemether,
    "Artemether-based therapy is recommended for malaria in Sri Lanka where resistance is present.").

substitute(cetirizine, loratadine,
    "Loratadine is a non-drowsy antihistamine effective for similar allergy symptoms.").

substitute(omeprazole, ranitidine,
    "Ranitidine reduces stomach acid through a different mechanism but is a viable short-term substitute.").


%% ─── No Substitute (critical drugs) ────────────────────────
%% These drugs have NO safe alternative — must be sourced urgently.

no_substitute(insulin).
no_substitute(epinephrine).
no_substitute(morphine).
no_substitute(warfarin).


%% ─── Combined Query Rule ────────────────────────────────────
%% get_substitute(+Drug, -Result)
%%   Returns result(Substitute, Reason) if a substitute exists.
%%   Returns no_substitute(Drug) if the drug is critical or unknown.

get_substitute(Drug, result(Substitute, Reason)) :-
    substitute(Drug, Substitute, Reason), !.

get_substitute(Drug, no_substitute(Drug)) :-
    no_substitute(Drug), !.

get_substitute(Drug, no_substitute(Drug)) :-
    \+ substitute(Drug, _, _), !.


%% ─── TEST QUERIES ────────────────────────────────────────────
%% ?- get_substitute(paracetamol, R).
%%    Expected: R = result(ibuprofen, "Ibuprofen reduces...").
%% ?- get_substitute(insulin, R).
%%    Expected: R = no_substitute(insulin).
%% ?- get_substitute(unknown_drug, R).
%%    Expected: R = no_substitute(unknown_drug).
%% ?- halt.
```

---

## A-14 · FILE: backend/prolog/risk_assessment.pl
→ Risk flag detection rules.

```prolog
%% ============================================================
%% AURA — Risk Assessment Rules
%% File: risk_assessment.pl
%%
%% Detects actionable risk factors from a request's parameters.
%% Returns a LIST of flags (multiple can fire for one request).
%%
%% Predicates:
%%   is_risk_flag(+Road, +Pop, +Category, +Stock, -Flag)
%%   get_all_flags(+Road, +Pop, +Category, +Stock, -Flags)
%% ============================================================


%% ─── Risk Flag Rules ────────────────────────────────────────
%% NOTE: Do NOT use ! (cut) here.
%% We WANT all matching rules to fire so we get all risk flags.

is_risk_flag(blocked, _, _, _,
    "ROAD BLOCKED: Consider aerial drop or boat delivery.").

is_risk_flag(_, large, medicine, _,
    "LARGE POPULATION + MEDICINE: Coordinate multiple distribution points.").

is_risk_flag(_, _, _, empty,
    "ZERO STOCK: Raise immediate resupply order — do not wait.").

is_risk_flag(partial, large, _, _,
    "PARTIAL ACCESS + LARGE CROWD: Deploy motorbike couriers for last mile.").

is_risk_flag(_, large, food, empty,
    "FOOD SHORTAGE (LARGE): Risk of civil unrest — prioritise security escort.").

is_risk_flag(blocked, large, _, _,
    "LARGE ISOLATED POPULATION: Notify District Secretariat and NDRRMC immediately.").

is_risk_flag(blocked, _, medicine, _,
    "MEDICINE + BLOCKED ROADS: Coordinate with nearest hospital for emergency dispatch.").


%% ─── Flag Collector ─────────────────────────────────────────
%% get_all_flags(+Road, +Pop, +Category, +Stock, -Flags)
%% Uses findall to collect ALL matching flags into a list.
%% If no flags match, Flags = [].

get_all_flags(Road, Pop, Category, Stock, Flags) :-
    findall(
        Flag,
        is_risk_flag(Road, Pop, Category, Stock, Flag),
        Flags
    ).


%% ─── TEST QUERIES ────────────────────────────────────────────
%% ?- get_all_flags(blocked, large, medicine, empty, F).
%%    Expected: F = [multiple flags list].
%% ?- get_all_flags(clear, small, food, available, F).
%%    Expected: F = [].
%% ?- halt.
```

---

## A-15 · FILE: backend/app/prolog_engine.py
→ The Python-to-Prolog bridge. The most important backend file.

```python
"""
prolog_engine.py
Connects FastAPI to SWI-Prolog using pyswip.

This module:
1. Loads all three .pl files once at startup
2. Provides analyze_request(request_id, db) which:
   - Reads the request from MongoDB
   - Calls Prolog to get priority level, substitutes, risk flags
   - Saves results to prolog_analysis collection
   - Returns a result dict
"""

import os
from datetime import datetime
from pyswip import Prolog
from bson import ObjectId
from .database import requests_col, analysis_col, inventory_col

# ── Load Prolog files ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRIORITY_PL   = os.path.join(BASE_DIR, "prolog", "priority_rules.pl")
MEDICINE_PL   = os.path.join(BASE_DIR, "prolog", "medicine_kb.pl")
RISK_PL       = os.path.join(BASE_DIR, "prolog", "risk_assessment.pl")

# Single global Prolog instance — loaded once when this module is first imported
prolog = Prolog()
prolog.consult(PRIORITY_PL)
prolog.consult(MEDICINE_PL)
prolog.consult(RISK_PL)


# ── Helper functions ───────────────────────────────────────────────────────────

def _stock_level(quantity: int) -> str:
    """Convert a raw quantity number to a Prolog stock level atom."""
    if quantity == 0:
        return "empty"
    elif quantity < 10:
        return "low"
    return "available"


def _priority_to_score(priority: str) -> int:
    """Map a priority level string to a numeric score for sorting."""
    return {"red": 90, "orange": 60, "yellow": 30}.get(priority, 30)


def _dominant_category(items: list) -> str:
    """
    Find the most urgent category in the request's item list.
    Order of urgency: medicine > food > shelter > other
    """
    order = ["medicine", "food", "shelter", "other"]
    categories = [item.get("category", "other") for item in items]
    for cat in order:
        if cat in categories:
            return cat
    return "other"


def _build_reasoning(priority: str, category: str, road: str, pop: str, stock: str) -> str:
    """Build a human-readable explanation of the Prolog decision."""
    level_text = {
        "red":    "CRITICAL (Red) — Immediate action required.",
        "orange": "URGENT (Orange) — Action needed within hours.",
        "yellow": "STANDARD (Yellow) — Schedule within days.",
    }.get(priority, "STANDARD (Yellow).")

    return (
        f"Prolog Analysis: {level_text} "
        f"Category: {category}. Road status: {road}. "
        f"Population: {pop}. Stock level: {stock}."
    )


# ── Main analysis function ─────────────────────────────────────────────────────

def analyze_request(request_id: str) -> dict:
    """
    Run Prolog analysis on a request.

    Steps:
    1. Load the request document from MongoDB
    2. Determine dominant category and stock level
    3. Query assign_priority → priority_level
    4. If medicine: query get_substitute for each item → substitutes list
    5. Query get_all_flags → risk_flags list
    6. Save/update the prolog_analysis document in MongoDB
    7. Return result dict

    Args:
        request_id: MongoDB ObjectId string of the request

    Returns:
        dict with priority_level, priority_score, reasoning,
        suggested_substitutes, risk_flags

    Raises:
        ValueError: if request not found
        RuntimeError: if Prolog query fails
    """
    # Step 1: Load the request
    request = requests_col.find_one({"_id": ObjectId(request_id)})
    if not request:
        raise ValueError(f"Request '{request_id}' not found in MongoDB")

    items = request.get("items", [])
    road  = request.get("road_status", "clear")
    pop   = request.get("population_size", "medium")

    # Step 2: Determine category and stock level
    category = _dominant_category(items)

    # Find the minimum stock level across category-matching items
    cat_stocks = [
        item.get("current_stock", 0)
        for item in items
        if item.get("category") == category
    ]
    min_stock = min(cat_stocks) if cat_stocks else 0
    stock_level = _stock_level(min_stock)

    # Step 3: Query priority classification
    priority_query = (
        f"assign_priority({category}, {road}, {pop}, {stock_level}, P)"
    )
    try:
        results = list(prolog.query(priority_query))
        priority_level = str(results[0]["P"]) if results else "yellow"
    except Exception as e:
        print(f"[Prolog ERROR] Priority query failed: {e}")
        priority_level = "yellow"   # safe fallback — never crash the API

    # Step 4: Medicine substitutes
    substitutes = []
    if category == "medicine":
        for item in items:
            key = item.get("prolog_item_key")
            if not key:
                continue
            try:
                sub_results = list(prolog.query(f"get_substitute({key}, Result)"))
                if sub_results:
                    term = sub_results[0].get("Result")
                    # pyswip returns compound terms — check it's a result/2 functor
                    if term and hasattr(term, "name") and term.name == "result":
                        args = term.args
                        substitutes.append({
                            "requested":  key,
                            "substitute": str(args[0]),
                            "reason":     str(args[1])
                        })
            except Exception as e:
                print(f"[Prolog WARNING] Substitute query failed for '{key}': {e}")

    # Step 5: Risk flags
    risk_flags = []
    try:
        flag_query = f"get_all_flags({road}, {pop}, {category}, {stock_level}, Flags)"
        flag_results = list(prolog.query(flag_query))
        if flag_results and "Flags" in flag_results[0]:
            risk_flags = [str(f) for f in flag_results[0]["Flags"]]
    except Exception as e:
        print(f"[Prolog WARNING] Risk flag query failed: {e}")

    # Step 6: Save to MongoDB (upsert — replace if exists)
    analysis_doc = {
        "request_id":           request_id,
        "priority_level":       priority_level,
        "priority_score":       _priority_to_score(priority_level),
        "reasoning":            _build_reasoning(priority_level, category, road, pop, stock_level),
        "suggested_substitutes": substitutes,
        "risk_flags":           risk_flags,
        "analyzed_at":          datetime.utcnow()
    }
    analysis_col.replace_one(
        {"request_id": request_id},
        analysis_doc,
        upsert=True
    )

    return {
        "priority_level":        priority_level,
        "priority_score":        _priority_to_score(priority_level),
        "reasoning":             analysis_doc["reasoning"],
        "suggested_substitutes": substitutes,
        "risk_flags":            risk_flags,
    }
```

---

## A-16 · FILE: frontend/src/context/AuthContext.jsx
→ Global auth state. Stores the logged-in user and token.

```jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('aura_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aura_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = (tokenValue, userData) => {
    localStorage.setItem('aura_token', tokenValue)
    localStorage.setItem('aura_user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('aura_token')
    localStorage.removeItem('aura_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

## A-17 · FILE: frontend/src/App.jsx
→ React Router setup with role-based protected routes.

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login      from './pages/Login'
import Dashboard  from './pages/Dashboard'
import NewRequest from './pages/NewRequest'
import PublicBoard from './pages/PublicBoard'
import Inventory  from './pages/Inventory'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role))
    return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"       element={<Navigate to="/public" replace />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/public" element={<PublicBoard />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/new-request" element={
            <ProtectedRoute allowedRoles={['gn_officer']}>
              <NewRequest />
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <Inventory />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

---

## A-18 · FILE: frontend/src/components/PriorityBadge.jsx
→ Small reusable badge. Used on every request card.

```jsx
const CONFIG = {
  red:    { label: 'CRITICAL', cls: 'bg-red-900/50 text-red-300 border border-red-600' },
  orange: { label: 'URGENT',   cls: 'bg-orange-900/50 text-orange-300 border border-orange-500' },
  yellow: { label: 'STANDARD', cls: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600' },
}

export default function PriorityBadge({ level }) {
  const c = CONFIG[level] || CONFIG.yellow
  return (
    <span className={`text-xs font-mono font-bold px-2 py-1 rounded tracking-widest uppercase ${c.cls}`}>
      {c.label}
    </span>
  )
}
```

---

## A-19 · FILE: frontend/src/api/index.js
→ Central API service layer. All fetch calls live here — never inside components.

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Core fetch helper.
 * Automatically attaches the JWT token from localStorage to every request.
 * Throws an error if the response is not OK.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('aura_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'An API error occurred')
  return data
}

// ── Authentication ──────────────────────────────────────────────────────
export const loginUser    = (email, password) =>
  apiFetch('/api/auth/login',    { method: 'POST', body: JSON.stringify({ email, password }) })

export const registerUser = (data) =>
  apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) })

export const getMe = () => apiFetch('/api/auth/me')

// ── Requests ────────────────────────────────────────────────────────────
export const createRequest  = (data)   => apiFetch('/api/requests', { method: 'POST', body: JSON.stringify(data) })
export const getAllRequests  = ()       => apiFetch('/api/requests')
export const getMyRequests  = ()       => apiFetch('/api/requests/my')
export const updateStatus   = (id, s)  => apiFetch(`/api/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: s }) })

// ── Prolog Logic ────────────────────────────────────────────────────────
export const triggerAnalysis = (id) => apiFetch(`/api/logic/analyze/${id}`, { method: 'POST' })
export const getAnalysis     = (id) => apiFetch(`/api/logic/analysis/${id}`)

// ── Inventory ───────────────────────────────────────────────────────────
export const getInventory       = ()       => apiFetch('/api/inventory')
export const addInventoryItem   = (data)   => apiFetch('/api/inventory', { method: 'POST', body: JSON.stringify(data) })
export const updateInventoryItem = (id, d) => apiFetch(`/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(d) })

// ── Public Board ────────────────────────────────────────────────────────
export const getPublicBoard = ()          => apiFetch('/api/public/board')
export const getPublicStats = ()          => apiFetch('/api/public/stats')
export const bookRequest    = (id, notes) => apiFetch('/api/public/book', { method: 'POST', body: JSON.stringify({ request_id: id, notes }) })
```

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION B — PROMPTS
# Copy each prompt → Paste into Antigravity → Get code back
# → Create the file shown in SAVE TO → Paste generated code → Save
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-1                                      │
## │ SAVE TO: backend/app/schemas.py                 │
## └─────────────────────────────────────────────────┘

```
I am building AURA (Automated Urgent Relief Allocation), a disaster relief web app.
Backend: FastAPI + MongoDB (pymongo) + SWI-Prolog.

Write the complete content of backend/app/schemas.py.

This file contains Pydantic models used for validating API request bodies.
Because we use MongoDB (not SQLAlchemy), these Pydantic models are also our
primary data shape definitions.

Write these Pydantic models:

1. UserCreate
   Fields: name (str), email (EmailStr), password (str),
           role (str — one of: super_admin, gn_officer, donor),
           location (Optional[str])

2. LoginRequest
   Fields: email (EmailStr), password (str)

3. RequestItemInput
   Fields: inventory_id (Optional[str] — MongoDB ObjectId as string),
           item_name (Optional[str] — used when no inventory match),
           category (Optional[str]),
           prolog_item_key (Optional[str]),
           quantity_needed (int — must be > 0),
           current_stock (Optional[int] — snapshot at time of request)

4. RequestCreate
   Fields: location (str — required, min 3 chars),
           description (str — required, min 20 chars),
           road_status (str — one of: clear, blocked, partial),
           population_size (str — one of: small, medium, large),
           is_public (bool — default False),
           items (List[RequestItemInput] — min 1 item)

5. StatusUpdate
   Fields: status (str — one of: pending, approved, fulfilled, cancelled)

6. InventoryCreate
   Fields: item_name (str), category (str — one of: medicine, food, shelter, other),
           quantity (int — default 0), unit (Optional[str]),
           prolog_item_key (Optional[str] — the Prolog atom for this item, e.g. "paracetamol")

7. InventoryUpdate
   Fields: all Optional — quantity (int), item_name (str), prolog_item_key (str)

8. DonorBookingCreate
   Fields: request_id (str), notes (Optional[str])

Requirements:
- Use Pydantic v2 syntax (model_config, @field_validator)
- Add a validator on RequestCreate that checks items list has at least 1 entry
- Add a validator on RequestCreate that checks road_status is valid
- Add a validator on RequestCreate that checks population_size is valid
- Add docstrings to each class explaining its purpose

Return only the Python code.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-2                                      │
## │ SAVE TO: backend/app/routers/auth.py            │
## └─────────────────────────────────────────────────┘

```
I am building AURA with FastAPI + MongoDB (pymongo). Write the complete content
of backend/app/routers/auth.py.

Available imports from the app package:
  from ..database import users_col           # pymongo Collection
  from ..schemas import UserCreate, LoginRequest
  from ..auth import hash_password, verify_password, create_access_token
  from ..dependencies import get_current_user
  from bson import ObjectId
  from datetime import datetime

MongoDB users_col document structure:
  { _id: ObjectId, name, email, hashed_password, role, location, is_active, created_at }

Write these three endpoints:

POST /register
  - Validate with UserCreate schema
  - Check users_col for existing email → 400 if found
  - Insert new user document with hashed password and is_active=True
  - Return: { message: "Account created", user_id: str(inserted_id) }

POST /login
  - Validate with LoginRequest schema
  - Find user by email → 401 if not found
  - Verify password → 401 if wrong
  - Check is_active → 403 if False
  - Create JWT with payload { sub: str(user._id), role: user.role }
  - Return: { access_token, token_type: "bearer",
              user: { id, name, role, location } }

GET /me
  - Protected with Depends(get_current_user)
  - Returns: { id, name, email, role, location, created_at }
  - The current_user dict already has _id converted to string

Important MongoDB note: when returning user data, convert ObjectId fields
to strings and remove hashed_password from the response.

Add a helper function serialize_user(doc) that converts a MongoDB user
document to a safe dict (removes password, converts ObjectId to str).

Requirements:
  - router = APIRouter()
  - Proper HTTPException for every error case with clear messages
  - Docstring on each endpoint

Return only the Python code.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-3                                      │
## │ SAVE TO: backend/app/routers/requests.py        │
## └─────────────────────────────────────────────────┘

```
I am building AURA with FastAPI + MongoDB + SWI-Prolog. Write the complete
content of backend/app/routers/requests.py.

Available imports:
  from ..database import requests_col, inventory_col, analysis_col
  from ..schemas import RequestCreate, StatusUpdate
  from ..dependencies import require_role, get_current_user
  from ..prolog_engine import analyze_request
  from bson import ObjectId
  from datetime import datetime

MongoDB collection structures:
  requests_col document:
    { _id, gn_officer_id (str), gn_officer_name (str), location, description,
      road_status, population_size, status, is_public, items: [...], created_at }

  Each item in items array:
    { inventory_id (str|null), item_name, category, prolog_item_key, quantity_needed, current_stock }

  analysis_col document (for response enrichment):
    { request_id (str), priority_level, priority_score, reasoning,
      suggested_substitutes, risk_flags, analyzed_at }

Write these endpoints:

POST /
  - Role: gn_officer or super_admin
  - Body: RequestCreate schema
  - For each item in req.items:
      If inventory_id is provided: look up inventory_col and snapshot
      item_name, category, prolog_item_key, current_stock into the item
  - Insert request document to requests_col
  - Call analyze_request(str(new_id)) from prolog_engine
      Wrap in try/except — if Prolog fails, continue (do not block the save)
  - Return: { message, request_id, prolog_result (or null if failed) }

GET /
  - Role: super_admin only
  - Fetch all requests from requests_col
  - For each request, look up its prolog_analysis and attach it
  - Sort by priority_score descending (highest urgency first), then by created_at desc
  - Return list of enriched request dicts

GET /my
  - Role: gn_officer only
  - Filter requests_col by gn_officer_id == str(current_user._id)
  - Attach prolog_analysis to each
  - Return sorted by created_at desc

PATCH /{request_id}/status
  - Role: super_admin only
  - Body: StatusUpdate schema
  - Update status field in requests_col
  - Return: { message }

Important: MongoDB returns ObjectId objects — convert all _id fields to
strings before returning JSON responses. Write a helper function
serialize_request(doc, analysis=None) that does this conversion and
optionally merges in the analysis document.

Requirements:
  - router = APIRouter()
  - 404 if request not found
  - Docstrings on each endpoint

Return only the Python code.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-4                                      │
## │ SAVE TO: backend/app/routers/inventory.py       │
## └─────────────────────────────────────────────────┘

```
I am building AURA with FastAPI + MongoDB. Write the complete content of
backend/app/routers/inventory.py.

Available imports:
  from ..database import inventory_col
  from ..schemas import InventoryCreate, InventoryUpdate
  from ..dependencies import require_role, get_current_user
  from bson import ObjectId
  from datetime import datetime

MongoDB inventory_col document:
  { _id, item_name, category, quantity, unit, prolog_item_key, updated_at }

Write these endpoints:

GET /
  - Any logged-in user (Depends get_current_user)
  - Return all inventory items sorted by category then item_name
  - Convert ObjectId to string in response

POST /
  - super_admin only
  - Body: InventoryCreate schema
  - Check for duplicate item_name → 400 if already exists
  - Insert and return the created document

PATCH /{item_id}
  - super_admin only
  - Body: InventoryUpdate schema (partial update)
  - Find by ObjectId → 404 if not found
  - Update only the fields provided (exclude_unset=True)
  - Always update updated_at to datetime.utcnow()
  - Return updated document

DELETE /{item_id}
  - super_admin only
  - Find by ObjectId → 404 if not found
  - Delete from collection
  - Return: { message: "Item deleted" }

Write a helper serialize_item(doc) that converts ObjectId to string.

Requirements:
  - router = APIRouter()
  - Docstrings on each endpoint

Return only the Python code.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-5                                      │
## │ SAVE TO: backend/app/routers/logic.py           │
## └─────────────────────────────────────────────────┘

```
I am building AURA with FastAPI + MongoDB + SWI-Prolog. Write the complete
content of backend/app/routers/logic.py.

Available imports:
  from ..database import analysis_col
  from ..dependencies import require_role, get_current_user
  from ..prolog_engine import analyze_request
  from bson import ObjectId

MongoDB analysis_col document:
  { _id, request_id (str), priority_level, priority_score, reasoning,
    suggested_substitutes (list), risk_flags (list), analyzed_at }

Write these endpoints:

POST /analyze/{request_id}
  - Role: super_admin only
  - Manually re-triggers Prolog analysis on an existing request
  - Calls analyze_request(request_id) from prolog_engine
  - If analyze_request raises ValueError: return 404
  - If it raises any other exception: return 500 with the error message
  - On success: return { message: "Prolog analysis complete", result: ... }
  - Add a docstring: "Super Admin can re-run Prolog analysis if inventory has changed"

GET /analysis/{request_id}
  - Role: super_admin or gn_officer
  - Find analysis document by request_id (stored as a string, not ObjectId)
  - Return 404 if not found
  - Convert ObjectId _id to string before returning
  - Add a docstring explaining what this returns

Requirements:
  - router = APIRouter()
  - All error cases have helpful detail messages

Return only the Python code.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-6                                      │
## │ SAVE TO: backend/app/routers/public.py          │
## └─────────────────────────────────────────────────┘

```
I am building AURA with FastAPI + MongoDB. Write the complete content of
backend/app/routers/public.py.

Available imports:
  from ..database import requests_col, analysis_col, bookings_col
  from ..schemas import DonorBookingCreate
  from ..dependencies import get_current_user
  from bson import ObjectId
  from datetime import datetime

Write these endpoints:

GET /board
  - NO authentication required (public endpoint)
  - Fetch requests where is_public=True AND status="pending"
  - For each request, attach its prolog_analysis document
  - Sort by priority_score descending
  - Return list of enriched request dicts with ObjectId converted to str

GET /stats
  - NO authentication required
  - Return:
    { total_requests: int,
      pending: int,
      critical_red: int (count where prolog_analysis.priority_level = "red"),
      fulfilled: int }
  - Each count is a separate MongoDB query

POST /book
  - Logged-in user of any role (Depends get_current_user)
  - Body: DonorBookingCreate schema
  - Check that the request exists and is still pending → 404/400 if not
  - Insert booking document:
      { donor_id, donor_name, request_id, notes, status: "booked", booked_at }
  - Return: { message: "Booking confirmed", booking_id }

Requirements:
  - router = APIRouter()
  - The /board and /stats endpoints are completely open — no token needed
  - Docstrings on each endpoint

Return only the Python code.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-7                                      │
## │ SAVE TO: backend/test_prolog.py                 │
## └─────────────────────────────────────────────────┘

```
I am building AURA with SWI-Prolog + pyswip. Write a standalone Python test
script saved at backend/test_prolog.py.

I need to run this script BEFORE connecting Prolog to FastAPI, to verify
that SWI-Prolog is installed correctly and all three .pl files work.

Prolog files are at:
  backend/prolog/priority_rules.pl
  backend/prolog/medicine_kb.pl
  backend/prolog/risk_assessment.pl

The script should:
1. Import Prolog from pyswip and load all three files using absolute paths
   derived from __file__

2. Run these 9 test cases and print PASS or FAIL for each:

   PRIORITY RULES:
   Test 1: assign_priority(medicine, blocked, large, empty, P) → expect red
   Test 2: assign_priority(medicine, clear,   small, low,   P) → expect orange
   Test 3: assign_priority(food,     clear,   small, available, P) → expect yellow
   Test 4: assign_priority(shelter,  blocked, small, available, P) → expect orange

   MEDICINE KB:
   Test 5: get_substitute(paracetamol, Result)
           → expect Result.name == "result" (has a substitute)
   Test 6: get_substitute(insulin, Result)
           → expect Result.name == "no_substitute"
   Test 7: get_substitute(unknown_xyz, Result)
           → expect Result.name == "no_substitute"

   RISK ASSESSMENT:
   Test 8: get_all_flags(blocked, large, medicine, empty, Flags)
           → expect Flags is a non-empty list
   Test 9: get_all_flags(clear, small, food, available, Flags)
           → expect Flags = []

3. Print output format:
   PASS ✓  |  Test 1 — assign_priority(medicine, blocked, large, empty, P)  |  Got: red
   FAIL ✗  |  Test 2 — ...                                                  |  Got: orange  Expected: red

4. Print a final summary: "Results: X/9 passed"

5. If pyswip import fails, print a clear step-by-step setup guide
   (install SWI-Prolog, add to PATH, pip install pyswip)

Run this script with: python test_prolog.py (from the backend/ folder)

Return only the Python script.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-8                                      │
## │ SAVE TO: frontend/src/pages/Login.jsx           │
## └─────────────────────────────────────────────────┘

```
I am building AURA, a disaster relief web app. Write the complete Login.jsx page.

Tech: React + Vite + Tailwind CSS.
Custom Tailwind colors defined in tailwind.config.js:
  aura-bg: #0D0905   (main background)
  aura-card: #1C1309  (card/panel background)
  aura-amber: #F59E0B (primary action color)
  aura-red: #DC2626
  aura-orange: #EA580C

Imports available:
  import { useState } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { useAuth } from '../context/AuthContext'
  import { loginUser } from '../api'

The loginUser(email, password) function returns:
  { access_token: string, user: { id, name, role, location } }

Build the Login page:
1. Full-screen dark page using aura-bg background
2. Centered card using aura-card background, rounded, subtle border
3. AURA logo/title at top (large, amber text, monospace font)
4. Tagline: "Automated Urgent Relief Allocation"
5. Email input field
6. Password input field
7. Submit button (amber background, dark text, full width)
8. Loading state: button shows spinner and is disabled while logging in
9. Error state: shows error message in red below the form
10. On success: calls login(data.access_token, data.user) then navigates to /dashboard
11. A small link at the bottom: "Public Board →" that navigates to /public

Design requirements:
- Monospace font for the AURA title
- Clean, minimal, dark terminal aesthetic
- Input fields: dark background (darker than card), amber focus ring
- No rounded-full buttons — use rounded-md

Return only the complete JSX component. Include all useState hooks.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-9                                      │
## │ SAVE TO: frontend/src/pages/Dashboard.jsx       │
## └─────────────────────────────────────────────────┘

```
I am building AURA, a disaster relief system. Write the complete Dashboard.jsx
page. This page renders different views based on the logged-in user's role.

Tech: React + Vite + Tailwind. Custom colors: aura-bg, aura-card (#1C1309),
aura-amber (#F59E0B), aura-red (#DC2626), aura-orange (#EA580C).

Imports available:
  import { useState, useEffect } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { useAuth } from '../context/AuthContext'
  import { getAllRequests, getMyRequests, updateStatus } from '../api'
  import PriorityBadge from '../components/PriorityBadge'

Each request object may have a prolog_analysis field:
  { priority_level: "red"|"orange"|"yellow",
    priority_score: number,
    reasoning: string,
    suggested_substitutes: [{requested, substitute, reason}],
    risk_flags: [string] }

Build Dashboard.jsx which renders:

── FOR SUPER_ADMIN (role === "super_admin"):
  1. Top bar: "AURA Command Centre" title + Logout button
  2. Stats summary row: Total | Pending | Critical (red) | Fulfilled
     (computed from the loaded requests array)
  3. Filter tabs: All | Critical | Urgent | Standard | Pending | Approved
  4. Request list sorted by priority_score descending (highest first)
     Each request card:
       - Left border colored by priority (red/orange/yellow border)
       - Priority badge, location, GN Officer name, created time (relative)
       - Description (show first 120 chars, "Show more" expands it)
       - Risk flags as small chips (amber/orange color) if any
       - Collapsed section "Prolog Analysis ▾" — click to expand:
           Shows reasoning text, substitutes table (if any)
       - Action button:
           If status=pending: "Approve" button
           If status=approved: "Mark Fulfilled" button
           If status=fulfilled or cancelled: grey "Completed" label
  5. Clicking action button calls updateStatus(id, newStatus) and refreshes
  6. Auto-refresh every 30 seconds

── FOR GN_OFFICER (role === "gn_officer"):
  1. Top bar: "My Requests" + "New Request" button (navigates to /new-request) + Logout
  2. My requests list from getMyRequests()
     Each card shows: location, description, priority badge, status badge, created time
     Click to expand: Prolog reasoning, substitutes, risk flags
  3. If no requests yet: empty state with "Submit your first request" CTA

── FOR DONOR (role === "donor"):
  1. Top bar: "Donor Portal" + Logout
  2. Show a message: "Visit the Public Board to see open relief requests"
  3. Button linking to /public

All roles:
  - Loading spinner while fetching
  - Error message if fetch fails with retry button
  - Logout calls useAuth().logout() then navigates to /login

Design: dark command-center aesthetic, monospace for data values and stats,
amber for interactive elements, left border color = priority level color.

Return only the complete JSX component with all hooks and sub-sections.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-10                                     │
## │ SAVE TO: frontend/src/pages/NewRequest.jsx      │
## └─────────────────────────────────────────────────┘

```
I am building AURA, a disaster relief system. Write the complete NewRequest.jsx
page where GN Officers submit relief requests.

Tech: React + Vite + Tailwind. Custom colors: aura-bg, aura-card (#1C1309),
aura-amber (#F59E0B).

Imports available:
  import { useState, useEffect } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { useAuth } from '../context/AuthContext'
  import { createRequest, getInventory } from '../api'

getInventory() returns: [{ _id, item_name, category, quantity, unit, prolog_item_key }]

createRequest(data) expects:
  {
    location: string,
    description: string,
    road_status: "clear"|"blocked"|"partial",
    population_size: "small"|"medium"|"large",
    is_public: boolean,
    items: [{
      inventory_id: string|null,
      item_name: string|null,
      category: string|null,
      prolog_item_key: string|null,
      quantity_needed: number,
      current_stock: number|null
    }]
  }

Build the form:

1. Page header: "Submit Relief Request" + Back button (navigates to /dashboard)

2. Location field — text input, pre-filled with user.location from useAuth()

3. Situation Description — textarea, placeholder:
   "Describe the emergency situation, number of people affected, and what is urgently needed."
   Min 20 chars. Character counter shown.

4. Road Status — dropdown with three options:
   "Roads are Clear", "Roads are Blocked", "Roads are Partially Accessible"
   Maps to values: clear, blocked, partial

5. Population Size — dropdown:
   "Small (under 50 families)", "Medium (50–200 families)", "Large (over 200 families)"
   Maps to: small, medium, large

6. Items Section — dynamic list. Initially one empty row.
   Each row has:
     - Toggle: "From Inventory" / "Custom Item" (default: From Inventory)
     - If From Inventory: searchable dropdown of inventory items
       When selected: auto-fills item_name, category, prolog_item_key, current_stock
       Show current stock level next to the selected item name
     - If Custom Item: text input for item name (inventory_id = null)
     - Quantity needed: number input (min 1)
     - Remove row button (show only if more than 1 row exists)
   Below the list: "+ Add Another Item" button

7. Make Public toggle (checkbox):
   Label: "Allow donors to see this request on the Public Board"

8. Submit button:
   - Disabled and shows spinner while submitting
   - Label: "Submit Request"

9. On success: show green alert:
   "Request submitted! Prolog is now analysing the priority level..."
   After 2 seconds: navigate to /dashboard

10. On error: show red alert with the error message below the form

Validation:
  - Location: required
  - Description: min 20 chars
  - At least 1 item
  - All quantity_needed values must be >= 1
  - Show inline validation errors on submit attempt

Design: dark, clean, monospace labels, amber accents.

Return only the complete JSX component with all hooks.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-11                                     │
## │ SAVE TO: frontend/src/pages/PublicBoard.jsx     │
## └─────────────────────────────────────────────────┘

```
I am building AURA, a disaster relief system. Write the complete PublicBoard.jsx
page. This page requires NO login — it is publicly accessible.

Tech: React + Vite + Tailwind. Custom colors: aura-bg (#0D0905), aura-card (#1C1309),
aura-amber (#F59E0B), aura-red (#DC2626), aura-orange (#EA580C).

Imports available:
  import { useState, useEffect } from 'react'
  import { getPublicBoard, getPublicStats, bookRequest } from '../api'
  import PriorityBadge from '../components/PriorityBadge'

getPublicBoard() returns array of requests, each may have prolog_analysis attached.
getPublicStats() returns { total_requests, pending, critical_red, fulfilled }
bookRequest(requestId, notes) → books a donor helping with a request

Build the page:

1. Full-width header:
   - "AURA" in large monospace amber text
   - "Live Relief Board" subtitle
   - Small pulsing green dot + "LIVE" text (animate-pulse)
   - Login link top-right (navigates to /login)

2. Stats bar — auto refreshes every 30 seconds:
   4 stat boxes: Total Requests | Pending | Critical (red) | Fulfilled
   Critical box has red background tint

3. Filter tabs: All | Critical | Urgent | Standard
   Filters the displayed cards client-side

4. Cards grid — 2 columns on desktop, 1 on mobile:
   Each card:
     - Top-left: PriorityBadge
     - Location name (bold)
     - Description text (truncated at 100 chars)
     - Items list (bullet list of item names + quantity needed)
     - Risk flags: show as small amber/orange warning chips (if any)
     - Prolog reasoning: collapsible (hidden by default, "Details ▾" toggle)
     - Bottom: "I Can Help" button (amber, full width)

5. "I Can Help" modal:
   Opens when "I Can Help" is clicked
   Shows: request location and description at top
   Fields: Your Name (text), Phone Number (text), Notes (textarea optional)
   "Confirm I Can Help" button
   On submit: calls bookRequest(requestId, notes)
   On success: close modal, replace card's button with green "Booking Confirmed ✓"
   On error: show error inside modal

6. Empty state (no public requests):
   "No open requests at this time. Check back soon."

7. Loading skeleton while fetching initial data

Design: urgent, real-time situation board feel. Critical cards have subtle red
left border glow. Dark theme throughout. Pulsing animations on the LIVE badge.

Return only the complete JSX component with all useState/useEffect hooks.
```

---

## ┌─────────────────────────────────────────────────┐
## │ PROMPT B-12                                     │
## │ SAVE TO: frontend/src/pages/Inventory.jsx       │
## └─────────────────────────────────────────────────┘

```
I am building AURA, a disaster relief system. Write the complete Inventory.jsx
page for super_admin users.

Tech: React + Vite + Tailwind. Custom colors: aura-bg, aura-card (#1C1309),
aura-amber (#F59E0B), aura-red (#DC2626).

Imports:
  import { useState, useEffect } from 'react'
  import { getInventory, addInventoryItem, updateInventoryItem } from '../api'

Each inventory item from getInventory():
  { _id, item_name, category, quantity, unit, prolog_item_key }

Build:

1. Page header: "Inventory Management" + Back to Dashboard link

2. Stats row (computed from loaded items):
   Total Items | Out of Stock (qty=0) | Low Stock (qty<10) | Well Stocked (qty>=10)

3. Search input: filters items by item_name client-side (case insensitive)

4. Category filter tabs: All | Medicine | Food | Shelter | Other

5. Inventory table:
   Columns: Item Name | Category | Quantity | Unit | Prolog Key | Status | Actions
   Status badge: red "OUT" if qty=0, amber "LOW" if qty<10, green "OK" if qty>=10
   Row background: slight red tint if qty=0, slight amber tint if qty<10

6. Inline quantity editing:
   - Quantity cell shows the number with a small pencil icon button
   - Click pencil: quantity becomes an input[type=number], Save and Cancel buttons appear
   - Save: calls updateInventoryItem(id, { quantity: newValue }) and updates list
   - Cancel: restores original display without API call
   - Only one row can be in edit mode at a time

7. Add New Item form — always visible below the table, not a modal:
   Fields: Item Name (text), Category (dropdown), Quantity (number, min 0),
           Unit (text, placeholder "e.g. packets, kg, units"),
           Prolog Key (text, placeholder "e.g. paracetamol — must match medicine_kb.pl")
   A small info tooltip or helper text: "Prolog Key must match the atom name in
   medicine_kb.pl for medicine substitutes to work"
   Submit button: "Add Item"
   On success: item appears in list, form clears

8. Loading state, error state

Design: data table feel, monospace for quantities and prolog keys, dark terminal style.

Return only the complete JSX component.
```

---

*End of AURA Implementation Guide v3*
*MongoDB + FastAPI + SWI-Prolog + React*
*NIBM DCSAI-25.2-F Academic Project*
