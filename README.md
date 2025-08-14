# Medical Physics Toolkit

A modern web application for dynamically generating write-ups for medical physics consultations.

## Project Overview

This project is a migration of a Streamlit-based application to a modern architecture using:
- **Backend**: FastAPI (Python)
- **Frontend**: React with Next.js and Chakra UI

## Project Structure

```
├── backend/              # FastAPI backend
│   ├── app/              # Application package
│   │   ├── routers/      # API endpoints
│   │   ├── schemas/      # Data models
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helper functions
│   └── requirements.txt  # Python dependencies
│
└── frontend/             # React/Next.js frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Next.js pages
    │   └── services/     # API client services
    └── package.json      # Node.js dependencies
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Setting up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at http://localhost:8000. The API documentation is available at http://localhost:8000/docs.

### Setting up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The frontend will be available at http://localhost:3000.

## Running the Application

### 🚨 CRITICAL: Environment Setup First

**BEFORE running the application, ensure correct environment configuration:**

1. **Check your environment file**:
   ```bash
   cat frontend/.env.local
   ```

2. **For LOCAL development**:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > frontend/.env.local
   ```

3. **For PRODUCTION deployment** (⚠️ **REQUIRED BEFORE PUSHING TO GITHUB**):
   ```bash
   echo "NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api" > frontend/.env.local
   ```

### 🚨 DEPLOYMENT WORKFLOW - READ THIS BEFORE COMMITTING

**CRITICAL: Always update environment to production before pushing to GitHub!**

1. **Switch to Production Environment**:
   ```bash
   echo "NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api" > frontend/.env.local
   ```

2. **Verify Repository Configuration**:
   ```bash
   git remote -v  # Should show: https://github.com/Flep-Glop/residency-tk2.git
   git config user.name  # Should show: Flep-Glop
   git config user.email  # Should show: luke.lussier@gmail.com
   ```

3. **Commit and Push Changes**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

4. **Switch Back to Local Development** (after deployment):
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > frontend/.env.local
   ```

**Why This Matters**: The frontend .env.local file determines which backend the deployed app connects to. Forgetting to switch to production URL means your live app will try to connect to localhost and fail!

### Using Start/Stop Scripts
The easiest way to run both frontend and backend services:

```bash
# Start both services
./start.sh

# Stop both services
./stop.sh
```

**⚠️ After changing `.env.local`, always restart services to pick up new environment variables.**

### Manual Start

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API will be available at http://localhost:8000 with documentation at http://localhost:8000/docs

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at http://localhost:3000

## Features

Currently implemented:

- **Fusion Write-up Generator**: Create standardized documentation for multimodality image fusions
- Modern, responsive UI with tabs and form validation
- API endpoints for generating write-ups

Coming soon:

- DIBH write-up generator
- Prior Dose calculator and write-up generator
- Pacemaker/ICD documentation
- User settings and preferences

## Development

### 🚨 Essential Development Workflow

**BEFORE debugging any frontend/backend issues:**

1. **Verify API endpoint in browser DevTools**:
   - Open DevTools → Network tab
   - Look for API calls showing: `Full URL: http://localhost:8000/api/...`
   - ❌ If you see `https://...railway.app/api/...` → you're calling production!
   - ✅ Fix: Update `frontend/.env.local` and restart services

2. **Common debugging trap**:
   - ❌ "My backend changes don't work!" 
   - 🔍 Check: Are you calling the right backend?
   - ✅ This saved hours in our SBRT enhancement session!

### Adding a New Module

1. Create schema models in `backend/app/schemas/`
2. Create service logic in `backend/app/services/`
3. Create API endpoints in `backend/app/routers/`
4. Create React components in `frontend/src/components/`
5. Create the page in `frontend/src/pages/`
6. Add API client services in `frontend/src/services/` 