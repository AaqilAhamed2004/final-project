"""
# This connects the fastapi backend to the MongoDB database. 
# It sets up the connection, defines the collections, and creates indexes for efficient querying. 
# The `db` variable can be imported in other parts of the application to access the database, and specific collection variables can be imported in routers for direct access to those collections.

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