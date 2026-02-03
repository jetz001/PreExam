# Deploy Frontend Script
Write-Host "Starting Frontend Deployment..." -ForegroundColor Green

# 1. Navigate to client directory
Set-Location "d:\Project\PreExam\client"

# 2. Install Dependencies (Legacy Peer Deps)
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# 3. Build Project
Write-Host "Building project..." -ForegroundColor Yellow
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build Failed!" -ForegroundColor Red
    exit 1
}

# 4. Upload to VPS
Write-Host "Uploading to VPS..." -ForegroundColor Yellow
scp -r dist root@150.95.27.156:/root/PreExam/client

Write-Host "Deployment Complete! Please refresh your browser." -ForegroundColor Green
