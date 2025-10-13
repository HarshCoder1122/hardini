# PowerShell script to run Hardini backend server permanently
# Run server in background job with auto-restart

Write-Host "========================================" -ForegroundColor Green
Write-Host "       HARDINI AGRICULTURE APP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Function to start the server
function Start-BackendServer {
    Write-Host "Starting Hardini Backend Server..." -ForegroundColor Yellow
    Write-Host "Working Directory: $(Get-Location)" -ForegroundColor Gray
    Write-Host ""

    # Navigate to backend directory
    Set-Location -Path ".\backend"

    Write-Host "Initializing Node.js server..." -ForegroundColor Cyan
    Write-Host "Server will run on http://localhost:3001" -ForegroundColor White
    Write-Host ""

    # Start server in background job with auto-restart
    $scriptBlock = {
        function Restart-Server {
            while ($true) {
                try {
                    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Starting Hardini Backend Server..." -ForegroundColor Green
                    & node server.js
                }
                catch {
                    Write-Warning "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Server crashed: $($_.Exception.Message)"
                    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Attempting restart in 5 seconds..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 5
                    continue
                }
            }
        }
        Restart-Server
    }

    # Start the job
    $job = Start-Job -ScriptBlock $scriptBlock -Name "HardiniBackendServer"

    Write-Host "✓ Server job started successfully!" -ForegroundColor Green
    Write-Host "Job Name: $($job.Name)" -ForegroundColor Gray
    Write-Host "Job ID: $($job.Id)" -ForegroundColor Gray
    Write-Host ""

    # Navigate back to root directory
    Set-Location -Path ".."

    Write-Host "Opening Hardini App in browser..." -ForegroundColor Yellow
    Write-Host ""

    # Open browser with a slight delay
    Start-Sleep -Seconds 3
    try {
        Start-Process "index.html"
        Write-Host "✓ App opened in browser!" -ForegroundColor Green
    }
    catch {
        Write-Warning "Could not auto-open browser. Please manually open index.html"
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ BACKEND SERVER RUNNING PERMANENTLY" -ForegroundColor Green
    Write-Host "✓ API: http://localhost:3001/api/health" -ForegroundColor White
    Write-Host "✓ Reels API: http://localhost:3001/api/reels" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C or close window to stop server" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Monitor job status
    try {
        while ($true) {
            $jobState = (Get-Job -Id $job.Id).State

            if ($jobState -eq "Failed") {
                Write-Warning "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss'): Job failed! Attempting restart..."
                $job = Start-Job -ScriptBlock $scriptBlock -Name "HardiniBackendServer"
                Write-Host "✓ New server job started (ID: $($job.Id))" -ForegroundColor Green
            }

            # Show job status every 30 seconds
            if ((Get-Date).Second % 30 -eq 0) {
                Write-Host "$(Get-Date -Format 'HH:mm:ss'): Server Status: $jobState | Job ID: $($job.Id)" -ForegroundColor Gray
                Start-Sleep -Seconds 1
            }

            Start-Sleep -Seconds 5
        }
    }
    catch {
        Write-Host ""
        Write-Host "Stopping server..." -ForegroundColor Red
        Stop-Job -Id $job.Id -ErrorAction SilentlyContinue
        Remove-Job -Id $job.Id -ErrorAction SilentlyContinue
        Write-Host "✓ Server stopped successfully!" -ForegroundColor Green
    }
}

# Function to check if port 3001 is available
function Test-PortAvailable {
    param($Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient('localhost', $Port)
        $tcp.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Check requirements
Write-Host "Checking requirements..." -ForegroundColor Yellow

# Check if backend directory exists
if (-not (Test-Path ".\backend")) {
    Write-Error "❌ Backend directory not found!"
    Write-Host "Please ensure the 'backend' folder exists in the current directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if server.js exists
if (-not (Test-Path ".\backend\server.js")) {
    Write-Error "❌ server.js not found in backend directory!"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node is installed
try {
    $nodeVersion = & node --version
    Write-Host "✓ Node.js Version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Error "❌ Node.js is not installed or not in PATH!"
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if port is already in use
if (Test-PortAvailable -Port 3001) {
    Write-Warning "⚠️  Port 3001 is already in use. Server might already be running."
    Write-Host "Continuing anyway - new server will fail to start." -ForegroundColor Yellow
}

Write-Host ""

# Start the server
Start-BackendServer

# Cleanup on exit
Write-Host ""
Write-Host "Script finished." -ForegroundColor Gray
