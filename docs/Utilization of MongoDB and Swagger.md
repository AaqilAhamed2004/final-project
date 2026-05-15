# 🛠️ Project AURA: Developer Tools Guide
### (MongoDB Compass & Swagger API Docs)

This guide is designed to help you and your team visualize your data and test your backend efficiently.

---

## 1. MongoDB Compass: "The Window into Your Data"

### What is it?
Think of MongoDB Compass as **Excel for your Database**. Instead of typing complex commands, you can see your data in tables and edit it with a few clicks.

### How to use it for Project AURA:
1.  **Connect**: Open Compass. In the "New Connection" screen, use this connection string: `mongodb://localhost:27017`. Click **Connect**.
2.  **Create the Database**: 
    - Click the **"+"** icon next to "Databases".
    - Name the database: `aura_db`.
    - Create a few "Collections" (like folders): `users`, `requests`, `inventory`.
3.  **Manually Adding Data (The "Secret Trick")**: 
    - Since your backend "Create" functions aren't finished yet, you can manually add data to see it appear in your React UI!
    - Go to the `requests` collection.
    - Click **Add Data** -> **Insert Document**.
    - Paste a sample JSON like this:
      ```json
      {
        "title": "Need Dry Rations",
        "location": "Colombo 07",
        "priority": "high",
        "status": "active",
        "description": "Urgent need for rice and dhal for 10 families."
      }
      ```
    - **Refresh your frontend**: You should now see this request appear on the Relief Board!

---

## 2. Swagger API Docs: "The Remote Control for your Backend"

### What is it?
FastAPI automatically creates a website that lists every "door" (endpoint) in your backend. It allows you to "knock" on those doors and see what the server says back.

### How to access it:
1.  Start your backend (`uvicorn app.main:app --reload`).
2.  Open your browser and go to: `http://localhost:8000/docs`.

### How to utilize it for testing:
1.  **"Try it out"**: Click on any endpoint (like `GET /api/requests`).
2.  Click the blue **"Try it out"** button.
3.  Click **"Execute"**.
4.  **Analyze the Result**:
    - **Code 200**: Success! The backend is working.
    - **Code 404**: The backend doesn't have this "door" built yet.
    - **Code 500**: The backend crashed while trying to answer you.

**Senior Tip**: Always test a new API in Swagger **first** before writing the React code. If it doesn't work in Swagger, it will never work in React!

---

## 3. Workflow for your Team (The "Senior" Approach)

When building a new feature (e.g., "Delete an Item"), follow this order:

1.  **Backend**: Write the code in FastAPI.
2.  **Swagger**: Go to `/docs` and try to delete a test item. Ensure it returns a "Success" message.
3.  **MongoDB Compass**: Refresh your database to verify the item is actually gone.
4.  **Frontend**: Only now, write the React code to call that API.

---

## 4. Troubleshooting
- **Compass won't connect?** Make sure the MongoDB Service is "Running" in your Windows Services (Task Manager -> Services).
- **Swagger is empty?** Check your `backend/app/main.py`. Ensure your routers are "included" using `app.include_router(...)`.
