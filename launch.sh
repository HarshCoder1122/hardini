#!/bin/bash
echo "========================================"
echo "       HARDINI AGRICULTURE APP"
echo "========================================"
echo ""
echo "Starting Hardini Backend Server..."
echo ""

# Start backend server in background
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend server to start..."
sleep 3

echo ""
echo "Opening Hardini App in browser..."
echo ""

# Try different commands to open HTML file
if command -v xdg-open > /dev/null; then
    xdg-open index.html
elif command -v open > /dev/null; then
    open index.html
elif command -v start > /dev/null; then
    start index.html
else
    echo "Please manually open index.html in your browser"
fi

echo ""
echo "========================================"
echo "Backend server should be running on:"
echo "http://localhost:3001"
echo ""
echo "Backend process ID: $BACKEND_PID"
echo "Hardini App should be open in your browser!"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop the server..."
echo ""

# Wait for user interrupt
trap "echo 'Stopping server...'; kill $BACKEND_PID; exit" INT
wait $BACKEND_PID
