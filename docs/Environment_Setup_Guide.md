# 🌟 AURA Project: Beginner-Friendly Environment Setup Guide

Welcome to the AURA project! This guide is written specifically for team members who might not be very technical. Don't worry, we'll go through everything step-by-step to get your computer ready for coding.

---

## 🐍 Step 1: Installing Python

Our backend is built with Python. The project requires **Python 3.11 or newer**.

### What if I already have Python installed? (e.g., Python 3.14.4)
If you already have a newer version like Python 3.14.4, **you are perfectly fine!** The requirement "Python 3.11+" means version 3.11 *or any version higher than that*. You do not need to uninstall your current version or downgrade.

### How to Install Python (if you don't have it):
1. Open your web browser and go to: [python.org/downloads](https://www.python.org/downloads/)
2. Click the big yellow button that says **"Download Python"** (it will show the latest version).
3. Once the `.exe` file is downloaded, double-click it to run the installer.
4. **⚠️ CRITICAL STEP:** At the very bottom of the installer window, **check the box that says "Add Python.exe to PATH"** (or "Add python to environment variables"). If you forget this, Python won't work in your terminal!
5. Click **"Install Now"** and wait for it to finish.
6. To verify, open your computer's "Command Prompt" (press the Windows key, type `cmd`, and hit Enter) and type:
   ```cmd
   python --version
   ```
   It should reply with your Python version.

---

## 🦉 Step 2: Installing SWI-Prolog

Our project uses a special logic engine called Prolog to make intelligent decisions.

1. Go to: [swi-prolog.org/download/stable](https://www.swi-prolog.org/download/stable)
2. Download the **"SWI-Prolog for Windows (64 bit)"** installer.
3. Run the installer.
4. **⚠️ CRITICAL STEP:** During installation, it will ask about the system PATH. Choose the option: **"Add SWI-Prolog to the system PATH for all users"**.
5. Finish the installation by clicking Next/Install.
6. To verify, open Command Prompt and type:
   ```cmd
   swipl --version
   ```

---

## 🍃 Step 3: Installing MongoDB & MongoDB Compass

We use MongoDB as our database to save all user and request data.

### Will MongoDB conflict if I already have SQL (MySQL/SQL Server) installed?
**No, it will not conflict at all!** SQL databases (like MySQL) and MongoDB operate on completely different "ports" (channels on your computer). MySQL usually uses port 3306, while MongoDB uses port 27017. They can both run at the same time happily without bothering each other.

### How to Install:
1. Go to: [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Scroll down to the "MongoDB Community Server" section and click **Download**.
3. Run the downloaded installer. Choose the **"Complete"** setup type.
4. Leave the default setting to **"Install MongoDB as a Service"**. This means MongoDB will automatically start in the background when you turn on your PC so you don't have to launch it manually every time.
5. In the next steps, make sure **"Install MongoDB Compass"** is checked (it usually is by default).
6. Click Install.

*Note: MongoDB Compass is a graphical app that will open up after installation. It lets you see inside your database easily, just like Excel or phpMyAdmin!*

---

## 💻 Step 4: Setting up Visual Studio Code (VS Code)

VS Code is the program we use to write and edit our code.

1. Go to: [code.visualstudio.com](https://code.visualstudio.com/) and click **Download for Windows**.
2. Run the installer and click through (the default settings are all good).

### Recommended VS Code Extensions:
Once VS Code is open, click on the **Extensions** icon on the far left sidebar (it looks like 4 blocks). Search for and install these helpful extensions:
- **Python** (by Microsoft)
- **Prettier - Code formatter** (helps keep code looking neat automatically)
- **Tailwind CSS IntelliSense** (helps when writing frontend styles)

---

## 📂 Step 5: Opening the Project in VS Code

1. Download or clone the AURA project folder to your computer (e.g., on your Desktop).
2. Open VS Code.
3. Click on **File > Open Folder...**
4. Select the `final project` (or `aura`) folder and click "Select Folder".
5. You will now see all the project files on the left side of your screen.

---

## ⚙️ Step 6: Setting up the Python Virtual Environment

A "virtual environment" is like a safe, isolated bubble for our project's Python add-ons, so they don't mess with other projects on your PC.

1. In VS Code, go to the top menu and click **Terminal > New Terminal**.
2. In the terminal at the bottom, navigate to the backend folder by typing:
   ```cmd
   cd backend
   ```
3. Create the virtual environment bubble by typing:
   ```cmd
   python -m venv venv
   ```
4. **Activate** the bubble (you must do this every time you open a new terminal to work on the backend!):
   ```cmd
   venv\Scripts\activate
   ```
   *(You will know it worked if you see `(venv)` appear at the start of your terminal line).*
5. Install all the required project packages by typing:
   ```cmd
   pip install -r requirements.txt
   ```

---

## 🔄 Step 7: What About Database Migrations?

In older SQL projects, if you added a new column (like adding an "age" column to a user table), you had to write a complex "Migration" script (e.g., `ALTER TABLE users ADD age INT`).

**Because we are using MongoDB, we do NOT need to do this!** 
MongoDB is a "NoSQL" database. It stores data as flexible JSON-like documents. If we want to add a new field to our data, we simply update our Python code to start saving that new field. MongoDB will accept it immediately without any table structure errors or migration commands. 

If you want to modify what data is saved, you just need to update the `backend/app/schemas.py` file to include the new field, and you are good to go!

---

## 🎉 You're All Set!
You now have Python, Prolog, MongoDB, and VS Code installed, and your project environment is fully prepared. You are ready to start coding!
