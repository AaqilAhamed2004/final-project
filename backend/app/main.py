from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

1. TEMPORARILY COMMENTED OUT UNTIL WE BUILD THEM:
from .routers import auth, requests, inventory, logic, public

app = FastAPI(
    title="AURA API",
    description="Automated Urgent Relief Allocation — FastAPI + MongoDB + SWI-Prolog",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

2. TEMPORARILY COMMENTED OUT UNTIL WE BUILD THEM:
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