#!/bin/bash
# Start script for Medical Physics Toolkit

# Kill any existing servers on these ports
echo "Checking for existing processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Save original directory
SCRIPT_DIR=$(dirname "$(realpath "$0")")

echo "Starting backend server..."
cd "$SCRIPT_DIR/backend" && uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

echo "Starting frontend server..."
cd "$SCRIPT_DIR/frontend" && npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "==================== SERVICES STARTED ===================="
echo "Backend running at: http://localhost:8000"
echo "Frontend running at: http://localhost:3000"
echo "API documentation at: http://localhost:8000/docs"
echo ""
echo "Use ./stop.sh to stop all services"
echo "Press Ctrl+C to stop all services from this terminal"
echo "=========================================================="

# Save PIDs to file for the stop script
cd "$SCRIPT_DIR"
echo "$BACKEND_PID $FRONTEND_PID" > .service_pids

# Wait for both processes
wait 