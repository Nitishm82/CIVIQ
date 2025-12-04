@echo off
echo ========================================
echo   CiviQ Backend Server
echo ========================================
echo.
echo Starting backend server...
echo Server will run on http://localhost:3000
echo.
echo Keep this window open while using the app!
echo Press Ctrl+C to stop the server
echo.
cd backend
node server.js
pause
