# prepare-deploy.ps1
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparing Ubuntu Deployment Package" -ForegroundColor Cyan
Write-Host "(Windows → Ubuntu)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/7] Cleaning previous deployment..." -ForegroundColor Yellow
if (Test-Path deploy) { Remove-Item -Path deploy -Recurse -Force }
if (Test-Path deploy.tar.gz) { Remove-Item -Path deploy.tar.gz -Force }

Write-Host "[2/7] Creating deployment structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path deploy -Force | Out-Null
New-Item -ItemType Directory -Path deploy\scripts -Force | Out-Null
New-Item -ItemType Directory -Path deploy\logs -Force | Out-Null

Write-Host "[3/7] Building Next.js app for Ubuntu..." -ForegroundColor Yellow
Write-Host "  Temporarily fixing config for API routes..." -ForegroundColor Gray

# Backup and fix next.config.js if it has static export
$nextConfigPath = "next.config.js"
$configBackup = $null
if (Test-Path $nextConfigPath) {
    $configContent = Get-Content $nextConfigPath -Raw
    if ($configContent -match "output: 'export'") {
        $configBackup = $configContent
        $fixedConfig = $configContent -replace "output: 'export',?", "// output: 'export', // Disabled for API routes (Ubuntu)"
        $fixedConfig | Out-File -FilePath $nextConfigPath -Encoding utf8
        Write-Host "  Fixed next.config.js (removed static export)" -ForegroundColor Green
    }
}

# Run the build
npm run build
$buildSuccess = $LASTEXITCODE -eq 0

# Restore original config if we changed it
if ($configBackup) {
    $configBackup | Out-File -FilePath $nextConfigPath -Encoding utf8
    Write-Host "  Restored original next.config.js" -ForegroundColor Gray
}

if (-not $buildSuccess) {
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[4/7] Copying build files..." -ForegroundColor Yellow
# Copy Next.js build
Copy-Item -Path .next\* -Destination deploy\.next -Recurse -Force -Exclude cache
# Copy public folder
if (Test-Path public) {
    Copy-Item -Path public\* -Destination deploy\public -Recurse -Force
}
# Copy package files
Copy-Item -Path package.json -Destination deploy\ -Force
if (Test-Path package-lock.json) {
    Copy-Item -Path package-lock.json -Destination deploy\ -Force
}

Write-Host "[5/7] Creating Ubuntu files..." -ForegroundColor Yellow

# Environment template
$envContent = @'
# Ubuntu Production Environment
NODE_ENV=production
PORT=3000

# Database - UPDATE THIS!
DATABASE_URL=postgresql://user:password@localhost:5432/producetrack

# Security - CHANGE THIS!
JWT_SECRET=change-this-to-a-random-secret-key

# App URL (for production)
# NEXTAUTH_URL=https://yourdomain.com
'@
$envContent | Out-File -FilePath deploy\.env.production -Encoding utf8

# Ubuntu setup script
$setupContent = @'
#!/bin/bash
echo "========================================="
echo "ProduceTrack Ubuntu Setup"
echo "========================================="

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Install dependencies
echo "Installing npm packages..."
npm install --production

# Setup environment
if [ ! -f .env ]; then
    cp .env.production .env
    echo ""
    echo "EDIT .env FILE WITH YOUR CREDENTIALS!"
    echo "Run: nano .env"
fi

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "Setup complete!"
echo "Start: ./start.sh"
echo "Status: ./status.sh"
echo "Logs: pm2 logs producetrack-app"
'@
$setupContent | Out-File -FilePath deploy\setup.sh -Encoding ascii

# Start script
$startContent = @'
#!/bin/bash
pm2 start ecosystem.config.js
pm2 logs producetrack-app --lines 20
'@
$startContent | Out-File -FilePath deploy\start.sh -Encoding ascii

# Stop script
$stopContent = @'
#!/bin/bash
pm2 stop producetrack-app
echo "Application stopped"
'@
$stopContent | Out-File -FilePath deploy\stop.sh -Encoding ascii

# Restart script
$restartContent = @'
#!/bin/bash
pm2 restart producetrack-app
echo "Application restarted"
pm2 status producetrack-app
'@
$restartContent | Out-File -FilePath deploy\restart.sh -Encoding ascii

# Status script
$statusContent = @'
#!/bin/bash
echo "========================================="
pm2 status producetrack-app
echo ""
echo "Recent logs:"
pm2 logs producetrack-app --lines 15
'@
$statusContent | Out-File -FilePath deploy\status.sh -Encoding ascii

Write-Host "[6/7] Creating PM2 config..." -ForegroundColor Yellow
$pm2Content = @'
module.exports = {
  apps: [{
    name: 'producetrack-app',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    time: true
  }]
};
'@
$pm2Content | Out-File -FilePath deploy\ecosystem.config.js -Encoding utf8

Write-Host "[7/7] Creating deployment instructions..." -ForegroundColor Yellow
$instructionsContent = @'
# Quick Ubuntu Deployment Guide

## 1. Upload to Ubuntu Server
From your Windows PC:
scp deploy.tar.gz username@your-server-ip:~

## 2. Extract on Server
ssh username@your-server-ip
mkdir producetrack
tar -xzf deploy.tar.gz -C producetrack/
cd producetrack

## 3. Make Scripts Executable
chmod +x *.sh

## 4. Run Setup (One Time)
./setup.sh

## 5. Configure Environment
nano .env
# Update DATABASE_URL and JWT_SECRET

## 6. Start Application
./start.sh

## Management Commands
./status.sh   - Check app status
./restart.sh  - Restart app
./stop.sh     - Stop app
pm2 logs      - View all logs
'@
$instructionsContent | Out-File -FilePath deploy\UBUNTU_DEPLOY.txt -Encoding utf8

# Convert shell scripts to Unix line endings
Write-Host "  Converting scripts to Unix format..." -ForegroundColor Gray
Get-ChildItem deploy\*.sh | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "`r`n", "`n"
    [System.IO.File]::WriteAllText($_.FullName, $content)
}

Write-Host ""
Write-Host "[Creating deploy.tar.gz...]" -ForegroundColor Yellow

# Create tar.gz archive
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf deploy.tar.gz -C deploy .
    Write-Host "  Created deploy.tar.gz" -ForegroundColor Green
} else {
    Write-Host "  tar not found, creating zip instead..." -ForegroundColor Yellow
    Compress-Archive -Path deploy\* -DestinationPath deploy.zip -Force
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Package Ready for Ubuntu!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package: deploy.tar.gz" -ForegroundColor Cyan
if (Test-Path deploy.tar.gz) {
    $size = [math]::Round((Get-Item deploy.tar.gz).Length/1MB, 2)
    Write-Host "Size: $size MB" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "To deploy:" -ForegroundColor Yellow
Write-Host "1. Give deploy.tar.gz to your team"
Write-Host "2. They extract and run: ./setup.sh"
Write-Host ""
Write-Host "Full instructions in deploy/UBUNTU_DEPLOY.txt" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"