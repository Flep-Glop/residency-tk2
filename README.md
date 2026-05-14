# Medical Physics Toolkit

A web application for generating write-ups for medical physics consultations.

## Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: React with Next.js and Chakra UI

```
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── schemas/      # Pydantic models
│   │   └── services/     # Business logic
│   └── requirements.txt
│
└── frontend/             # React/Next.js frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Next.js pages
    │   └── services/     # API client services
    └── package.json
```

## Quick Start

```bash
./start.sh    # Start both services
./stop.sh     # Stop everything
```

### Environment Setup

```bash
# For local development
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > frontend/.env.local

# For production (REQUIRED before pushing to GitHub)
echo "NEXT_PUBLIC_API_URL=https://residency-tk2-production.up.railway.app/api" > frontend/.env.local
```

### Manual Start

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API at http://localhost:8000, docs at http://localhost:8000/docs

# Frontend
cd frontend
npm install
npm run dev
# Available at http://localhost:3000
```

## Modules

- **Fusion** - Multimodality image fusion write-ups
- **DIBH** - Deep inspiration breath hold documentation
- **SBRT** - Stereotactic body radiotherapy write-ups
- **SRS/SRT** - Stereotactic radiosurgery documentation
- **TBI** - Total body irradiation write-ups
- **HDR** - High dose rate brachytherapy documentation
- **Pacemaker** - Cardiac device risk assessment and write-ups
- **Prior Dose** - Prior radiation dose summation and documentation

## Adding a New Module

1. Create schema models in `backend/app/schemas/`
2. Create service logic in `backend/app/services/`
3. Create API endpoints in `backend/app/routers/`
4. Create React components in `frontend/src/components/`
5. Create the page in `frontend/src/pages/`
6. Add API client services in `frontend/src/services/`
