$ErrorActionPreference = "Stop"

$keyPath = "backend/serviceAccountKey.json"

if (!(Test-Path $keyPath)) {
    Write-Host "❌ Error: $keyPath not found!" -ForegroundColor Red
    exit
}

$content = Get-Content -Path $keyPath -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
$base64 = [System.Convert]::ToBase64String($bytes)

Write-Host "`n✅ SUCCESS! Here is your Firebase Key for Vercel:`n" -ForegroundColor Green
Write-Host "Variable Name: FIREBASE_SERVICE_ACCOUNT" -ForegroundColor Cyan
Write-Host "Value (Copy ALL of this):" -ForegroundColor Yellow
Write-Host $base64
Write-Host "`n--------------------------------------------------"
Write-Host "INSTRUCTIONS:"
Write-Host "1. Go to your Vercel Project Dashboard"
Write-Host "2. Click 'Settings' -> 'Environment Variables'"
Write-Host "3. Add New Variable:"
Write-Host "   Key: FIREBASE_SERVICE_ACCOUNT"
Write-Host "   Value: (Paste the long string above)"
Write-Host "4. Redeploy your project!"
