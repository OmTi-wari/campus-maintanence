# Resolve AI

**Smart Campus Maintenance Complaint Management System**

## 1. Problem Statement
In large campus environments, maintenance departments struggle with:
*   **High Volume**: Hundreds of complaints received daily.
*   **Spam/Irrelevant Requests**: "My exam is tomorrow", "I'm stressed" mixed with genuine "Water leak" issues.
*   **Manual Triage**: Staff waste hours manually categorizing and assigning tickets.
*   **Lack of Prioritization**: Critical safety hazards (Fire, Gas Leak) get buried under routine requests (Chair broken).

## 2. Our Solution
*Resolve AI* is an intelligent ticketing system that automates the triage process using Machine Learning.
*   **Auto-Validation**: Instantly rejects personal/non-maintenance spam using a Hybrid Rule+ML engine.
*   **Smart Categorization**: Automatically tags issues (Electrical, Plumbing, IT) and assigns Priority (Critical, High, Medium).
*   **Efficiency**: Reduces response time by ensuring maintainers only see valid, categorized, and prioritized tickets.

---

## 3. Tech Stack

### Frontend (User Interface)
*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Routing**: React Router (HashRouter for compatibility)

### Backend (API & Intelligence)
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Machine Learning**: Scikit-Learn (TF-IDF Vectorization, Logistic Regression)
*   **Database**: SQLite (via SQLAlchemy)

---

## 4. Key Features

### For Students
*   **Smart Complaint Box**: Simple form to report issues.
*   **Instant Feedback**: Immediate "Accepted" or "Rejected" status with an explanation (e.g., "Rejected: Non-maintenance issue").
*   **Ticket Tracking**: View status of past tickets (Open, In Progress, Resolved).

### For Maintainers (Dashboard)
*   **URL**: `/maintainer/dashboard` (e.g., `http://localhost:8081/#/maintainer/dashboard`)
*   **Kanban/List View**: See all validated tickets prioritized by urgency.
*   **Interactive Checklists**: Specific tasks generated based on category (e.g., "Turn off power" for Electrical).
*   **Work Logging**: Log actions taken on specific tickets.

---

## 5. Installation & Setup

### Prerequisites
*   **Node.js** (v18+)
*   **Python** (v3.9+)

### Step 1: Clone the Repository
```bash
git clone https://github.com/OmTi-wari/campus-maintanence.git
cd campus-maintanence
```

### Step 2: Setup Backend
Navigate to the `resolve` directory:
```bash
cd resolve
```
Install dependencies:
```bash
pip install -r requirements.txt
```
*Note: Ensure you have `joblib`, `scikit-learn`, `fastapi`, `uvicorn`, `sqlalchemy`, `pydantic` installed.*

### Step 3: Setup Frontend
Open a new terminal and navigate to the `campus-fix-portal` directory:
```bash
cd campus-fix-portal
```
Install dependencies:
```bash
npm install
```

---

## 6. How to Run

You need to run **two separate terminals** simultaneously.

**Terminal 1 (Backend):**
```bash
cd resolve
python -m uvicorn backend.main:app --reload
```
*Server runs at: `http://127.0.0.1:8000`*

**Terminal 2 (Frontend):**
```bash
cd campus-fix-portal
npm run dev
```
*Frontend runs at: `http://localhost:8081` (or similar)*

Access the application in your browser at the Frontend URL.
