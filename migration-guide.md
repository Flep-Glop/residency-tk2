# Medical Physics Toolkit Migration Checklist
## From Streamlit to FastAPI + React

A step-by-step checklist for migrating the Medical Physics Residency Toolkit from Streamlit to a modern FastAPI backend with a React frontend.

## Table of Contents
1. [Architecture Planning](#architecture-planning)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Module Migration](#module-migration)
5. [Deployment](#deployment)
6. [Testing](#testing)

## Architecture Planning
- [x] Analyze current application structure
- [x] Define separation of concerns between frontend and backend
- [x] Design RESTful API endpoints
- [x] Plan data flow between React and FastAPI
- [x] Choose UI component library (Chakra UI)

## Backend Implementation
- [x] Create basic FastAPI application structure
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py            # FastAPI app initialization
  │   ├── routers/           # API route definitions
  │   ├── schemas/           # Pydantic models
  │   ├── services/          # Business logic
  │   └── utils/             # Helper functions
  └── requirements.txt       # Python dependencies
  ```
- [x] Set up CORS for cross-domain communication
- [x] Define base Pydantic schemas for data validation
- [x] Implement dependency injection pattern for services
- [x] Create API documentation (FastAPI automatic docs)
- [x] Set up data persistence mechanism
- [x] Implement error handling middleware

## Frontend Implementation
- [x] Create Next.js project structure
  ```
  frontend/
  ├── src/
  │   ├── components/        # Reusable UI components
  │   ├── pages/             # Next.js pages
  │   ├── services/          # API client services
  │   └── styles/            # CSS/styling
  ├── package.json           # Node dependencies
  └── next.config.js         # Next.js configuration
  ```
- [x] Set up Chakra UI for styling
- [x] Create API client with Axios for backend communication
- [x] Implement form handling with react-hook-form
- [x] Create navigation system
- [x] Build responsive layout
- [ ] Add dark mode support
- [ ] Implement client-side validation

## Module Migration
### Fusion Module
- [x] Create backend schemas and models
- [x] Implement fusion generation service
- [x] Create fusion API endpoints
- [x] Build frontend form interface
- [x] Implement registration management UI
- [x] Connect form to backend API
- [x] Preserve business logic from original implementation

### DIBH Module
- [ ] Create backend schemas and models
- [ ] Implement DIBH generation service
- [ ] Create DIBH API endpoints
- [ ] Build frontend form interface
- [ ] Connect to backend API

### Prior Dose Module
- [ ] Create backend schemas and models
- [ ] Implement prior dose calculation service
- [ ] Create API endpoints
- [ ] Build frontend form and visualization

### Additional Modules
- [ ] Pacemaker documentation
- [ ] SBRT write-up generator
- [ ] SRS write-up generator

## Deployment
- [ ] Configure backend for production
  - [ ] Set up proper environment variables
  - [ ] Implement rate limiting
  - [ ] Enable HTTPS
- [ ] Prepare frontend for production
  - [ ] Optimize assets
  - [ ] Configure build settings
- [ ] Set up CI/CD pipeline
  - [ ] Backend deployment to Railway/Render
  - [ ] Frontend deployment to Vercel
- [ ] Configure domain and DNS

## Testing
- [ ] Implement backend unit tests
- [x] Create API integration tests
- [ ] Build frontend component tests
- [ ] Perform end-to-end testing
- [ ] Conduct user acceptance testing

## Running the Application

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
The API will be available at http://localhost:8000 with documentation at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at http://localhost:3000

## Next Steps

1. Complete the DIBH module migration
2. Add authentication if needed
3. Implement data persistence
4. Configure deployment environments
