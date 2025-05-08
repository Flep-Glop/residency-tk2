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

### Using Start/Stop Scripts
The easiest way to run both frontend and backend services:

```bash
# Start both services
./start.sh

# Stop both services
./stop.sh
```

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

### Adding a New Module

1. Create schema models in `backend/app/schemas/`
2. Create service logic in `backend/app/services/`
3. Create API endpoints in `backend/app/routers/`
4. Create React components in `frontend/src/components/`
5. Create the page in `frontend/src/pages/`
6. Add API client services in `frontend/src/services/` 