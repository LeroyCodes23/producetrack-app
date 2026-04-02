# prepare-deploy.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparing Deployment Package" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/8] Cleaning previous deployment..." -ForegroundColor Yellow
if (Test-Path deploy) { Remove-Item -Path deploy -Recurse -Force }
if (Test-Path deploy.zip) { Remove-Item -Path deploy.zip -Force }

Write-Host "[2/8] Creating deployment structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path deploy -Force | Out-Null
New-Item -ItemType Directory -Path deploy\.next -Force | Out-Null
New-Item -ItemType Directory -Path deploy\public -Force | Out-Null
New-Item -ItemType Directory -Path deploy\logs -Force | Out-Null

Write-Host "[3/8] Building Next.js application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[4/8] Copying build files..." -ForegroundColor Yellow
Copy-Item -Path .next\* -Destination deploy\.next -Recurse -Force -Exclude cache
Copy-Item -Path public\* -Destination deploy\public -Recurse -Force
Copy-Item -Path package.json -Destination deploy\ -Force
if (Test-Path package-lock.json) {
    Copy-Item -Path package-lock.json -Destination deploy\ -Force
}

Write-Host "[5/8] Creating environment file..." -ForegroundColor Yellow
@"
NODE_ENV=production
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret_here
PORT=3000
"@ | Out-File -FilePath deploy\.env -Encoding utf8

Write-Host "[6/8] Creating PM2 configuration..." -ForegroundColor Yellow
@"
module.exports = {
  apps: [{
    name: 'producetrack-app',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
"@ | Out-File -FilePath deploy\ecosystem.config.js -Encoding utf8

Write-Host "[7/8] Creating start scripts..." -ForegroundColor Yellow
@"
@echo off
echo Starting ProduceTrack Application...
set NODE_ENV=production
npm start
pause
"@ | Out-File -FilePath deploy\start.bat -Encoding ascii

Write-Host "[8/8] Creating deployment documentation..." -ForegroundColor Yellow
@"
# Deployment Instructions

## Windows Server Deployment

1. Copy this entire deploy folder to your server
2. Install Node.js if not already installed
3. Open Command Prompt as Administrator
4. Navigate to the deploy folder
5. Run `npm install --production` to install dependencies
6. Update the `.env` file with your production credentials
7. Run `start.bat` to start the application

## Using PM2 on Windows
1. Install PM2: `npm install -g pm2`
2. Run: `pm2 start ecosystem.config.js`
3. Save PM2 config: `pm2 save`
"@ | Out-File -FilePath deploy\DEPLOY.md -Encoding utf8

Write-Host ""
Write-Host "[Creating ZIP archive...]" -ForegroundColor Yellow
Compress-Archive -Path deploy\* -DestinationPath deploy.zip -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment package created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  - deploy\          (deployment folder)"
Write-Host "  - deploy.zip       (compressed package)"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update deploy\.env with your production credentials"
Write-Host "  2. Copy deploy.zip to your production server"
Write-Host "  3. Extract and run npm install --production"
Write-Host "  4. Configure your database connection"
Write-Host "  5. Start the application using start.bat or PM2"
Write-Host ""
Read-Host "Press Enter to exit"