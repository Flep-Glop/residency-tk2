#!/bin/bash
# Stop script for Medical Physics Toolkit

echo "Stopping all services..."

# Try to read the PIDs from the file
if [ -f .service_pids ]; then
    read -r BACKEND_PID FRONTEND_PID < .service_pids
    
    # Kill by specific PIDs if available
    if [ -n "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || echo "Backend already stopped"
    fi
    
    if [ -n "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || echo "Frontend already stopped"
    fi
    
    # Remove the PID file
    rm .service_pids
else
    # Fallback: Kill by port/process name if specific PIDs not available
    echo "Stopping backend server..."
    pkill -f "uvicorn app.main:app" || echo "Backend not running"
    
    echo "Stopping frontend server..."
    pkill -f "npm run dev" || echo "Frontend not running"
    
    # Additional cleanup for ports
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:3000 | xargs kill -9 2>/dev/null
fi

echo "All services stopped successfully!" 