# CiviQ API Test Script
# This script tests if your backend API is working correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CiviQ Backend API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test if server is running
Write-Host "Testing backend connection..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/requests" -Method Get -ErrorAction Stop
    
    Write-Host "✓ Backend is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Found $($response.Count) service requests in database:" -ForegroundColor Green
    Write-Host ""
    
    foreach ($request in $response) {
        Write-Host "  ID: $($request.id)" -ForegroundColor White
        Write-Host "  Service: $($request.service)" -ForegroundColor White
        Write-Host "  Location: $($request.location)" -ForegroundColor White
        Write-Host "  Status: $($request.status)" -ForegroundColor $(
            switch ($request.status) {
                "submitted" { "Yellow" }
                "assigned" { "Cyan" }
                "in-progress" { "Magenta" }
                "completed" { "Green" }
                default { "White" }
            }
        )
        Write-Host "  Priority: $($request.priority)" -ForegroundColor White
        Write-Host "  ---" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "✓ All tests passed! Your backend is working correctly." -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now open frontend/index.html in your browser." -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Backend is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend server first:" -ForegroundColor Yellow
    Write-Host "  1. Double-click START-SERVER.bat" -ForegroundColor White
    Write-Host "     OR" -ForegroundColor White
    Write-Host "  2. Run: cd backend && npm start" -ForegroundColor White
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
