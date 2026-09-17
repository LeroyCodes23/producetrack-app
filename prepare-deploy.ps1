# prepare-deploy.ps1 - FIXED VERSION
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Preparing Ubuntu Deployment Package" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/8] Cleaning previous deployment..." -ForegroundColor Yellow
if (Test-Path deploy) { Remove-Item -Path deploy -Recurse -Force }
if (Test-Path deploy.tar.gz) { Remove-Item -Path deploy.tar.gz -Force }

Write-Host "[2/8] Creating deployment structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path deploy -Force | Out-Null
New-Item -ItemType Directory -Path deploy\scripts -Force | Out-Null
New-Item -ItemType Directory -Path deploy\logs -Force | Out-Null

Write-Host "[3/8] Running pre-deployment checks..." -ForegroundColor Yellow

# Check Node version
$nodeVersion = node -v
Write-Host "  Node version: $nodeVersion" -ForegroundColor Gray

# Ensure .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "  Creating .env.production from .env.local..." -ForegroundColor Gray
    if (Test-Path ".env.local") {
        Copy-Item ".env.local" ".env.production" -Force
    }
}

# Check if Prisma is used
$hasPrisma = Test-Path "prisma\schema.prisma"
if ($hasPrisma) {
    Write-Host "  Prisma detected - generating client..." -ForegroundColor Gray
    npx prisma generate
}

Write-Host "[4/8] Building Next.js app for Ubuntu..." -ForegroundColor Yellow

# Backup and fix next.config.js
$nextConfigPath = "next.config.js"
$configBackup = $null
if (Test-Path $nextConfigPath) {
    $configContent = Get-Content $nextConfigPath -Raw
    if ($configContent -match "output: 'export'") {
        $configBackup = $configContent
        $fixedConfig = $configContent -replace "output: 'export',?", "// output: 'export', // Disabled for API routes"
        $fixedConfig | Out-File -FilePath $nextConfigPath -Encoding utf8
        Write-Host "  Fixed next.config.js (removed static export)" -ForegroundColor Green
    }
}

# Run the build
npm run build
$buildSuccess = $LASTEXITCODE -eq 0

# Restore original config
if ($configBackup) {
    $configBackup | Out-File -FilePath $nextConfigPath -Encoding utf8
    Write-Host "  Restored original next.config.js" -ForegroundColor Gray
}

if (-not $buildSuccess) {
    Write-Host "Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[5/8] Copying build files..." -ForegroundColor Yellow

# Copy .next folder
$destDir = "deploy\.next"
if (Test-Path $destDir) { Remove-Item -Path $destDir -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $destDir -Force | Out-Null
Copy-Item -Path ".next\*" -Destination $destDir -Recurse -Force -Exclude cache

# Copy public folder
if (Test-Path public) {
    $publicDest = "deploy\public"
    if (Test-Path $publicDest) { Remove-Item -Path $publicDest -Recurse -Force }
    New-Item -ItemType Directory -Path $publicDest -Force | Out-Null
    Copy-Item -Path "public\*" -Destination $publicDest -Recurse -Force
    
    # Verify the copy worked
    $publicFiles = (Get-ChildItem $publicDest -File).Count
    if ($publicFiles -eq 0) {
        throw "❌ public\ folder is empty after copy. Deployment aborted."
    }
    Write-Host "  ✅ Copied $publicFiles files to public\ folder"
} else {
    Write-Warning "⚠️ public\ folder not found — skipping"
}

# Copy package files
Copy-Item -Path package.json -Destination deploy\ -Force
if (Test-Path package-lock.json) { Copy-Item -Path package-lock.json -Destination deploy\ -Force }

# Copy Prisma schema if it exists
if ($hasPrisma) {
    Write-Host "  Copying Prisma schema..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path deploy\prisma -Force | Out-Null
    Copy-Item -Path "prisma\schema.prisma" -Destination "deploy\prisma\" -Force
    # Copy migrations if they exist
    if (Test-Path "prisma\migrations") {
        Copy-Item -Path "prisma\migrations" -Destination "deploy\prisma\" -Recurse -Force
    }
}

Write-Host "[6/8] Creating Ubuntu files..." -ForegroundColor Yellow

# Complete .env template with all required variables
$envContent = @'
# Ubuntu Production Environment
NODE_ENV=production
PORT=3000

# Database - UPDATE THIS!
DATABASE_URL=postgresql://user:password@localhost:5432/producetrack

# NextAuth Configuration - CHANGE BOTH!
NEXTAUTH_SECRET=change-this-to-a-random-32-char-secret
NEXTAUTH_URL=http://your-server-ip:3000

# JWT Secret - CHANGE THIS!
JWT_SECRET=change-this-to-a-random-secret-key

# Add any other environment variables your app needs
# APP_NAME=ProduceTrack
# ADMIN_EMAIL=admin@example.com
'@
$envContent | Out-File -FilePath deploy\.env.production -Encoding utf8

# Create .env.example for reference
$envExample = @'
# Environment Variables Example
# Copy this to .env and fill in your values

# Required:
DATABASE_URL=postgresql://user:password@localhost:5432/database
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional:
JWT_SECRET=your-jwt-secret
NODE_ENV=production
PORT=3000
'@
$envExample | Out-File -FilePath deploy\.env.example -Encoding utf8

# Enhanced setup script
$setupContent = @'
#!/bin/bash
set -e  # Exit on error

echo "========================================="
echo "ProduceTrack Ubuntu Setup"
echo "========================================="

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "WARNING: Running as root - continuing..."
fi

# Install Node.js 20.x
echo ""
echo "[1/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - || {
    echo "Failed to add NodeSource repository"
    exit 1
}
sudo apt install -y nodejs

# Verify Node.js version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install PM2
echo ""
echo "[2/6] Installing PM2..."
sudo npm install -g pm2

# Install dependencies
echo ""
echo "[3/6] Installing npm packages..."
npm install --production --legacy-peer-deps

# Install PostgreSQL driver if using Prisma
if [ -f "prisma/schema.prisma" ]; then
    echo ""
    echo "[4/6] Setting up Prisma..."
    npx prisma generate
    npx prisma migrate deploy || echo "No migrations to apply"
fi

# Setup environment
echo ""
echo "[5/6] Setting up environment..."
if [ ! -f .env ]; then
    cp .env.production .env
    echo "⚠️  Environment file created: .env"
    echo "   Edit it with: nano .env"
else
    echo "   .env already exists, skipping"
fi

# Create logs directory
mkdir -p logs

# Create start script if missing
if [ ! -f start.sh ]; then
    echo "#!/bin/bash" > start.sh
    echo "pm2 start ecosystem.config.js" >> start.sh
    echo "pm2 logs producetrack-app --lines 20" >> start.sh
    chmod +x start.sh
fi

echo ""
echo "[6/6] Starting application..."
pm2 start ecosystem.config.js || {
    echo "Failed to start PM2. Check your .env file and database connection."
    exit 1
}
pm2 save

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Edit your .env file: nano .env"
echo "2. Start the app: ./start.sh"
echo "3. Check status: ./status.sh"
echo ""
echo "Access your app at: http://localhost:3000"
'@
$setupContent | Out-File -FilePath deploy\setup.sh -Encoding ascii

# Status script with better diagnostics
$statusContent = @'
#!/bin/bash
echo "========================================="
echo "ProduceTrack Status"
echo "========================================="
echo ""
pm2 status producetrack-app
echo ""
echo "Recent logs:"
pm2 logs producetrack-app --lines 15 --nostream
'@
$statusContent | Out-File -FilePath deploy\status.sh -Encoding ascii

# Other scripts remain similar...
# (start.sh, stop.sh, restart.sh - keep as you had them)

# PM2 config - updated
$pm2Content = @'
module.exports = {
  apps: [{
    name: 'producetrack-app',
    script: 'node_modules/.bin/next',
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
    time: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
'@
$pm2Content | Out-File -FilePath deploy\ecosystem.config.js -Encoding utf8

# Enhanced deployment instructions
$instructionsContent = @'
# =========================================
# PRODUCETRACK UBUNTU DEPLOYMENT GUIDE
# =========================================

## PREREQUISITES (Do this before deploying)
- Ubuntu 20.04 or 22.04 server
- PostgreSQL installed and running
- Port 3000 open (or change it in .env)

## QUICK DEPLOYMENT

### 1. Upload to Ubuntu Server
From Windows:
scp deploy.tar.gz username@your-server-ip:~

### 2. Extract on Server
ssh username@your-server-ip
mkdir ~/producetrack
tar -xzf ~/deploy.tar.gz -C ~/producetrack/
cd ~/producetrack

### 3. Make Scripts Executable
chmod +x *.sh

### 4. Run Setup
./setup.sh

### 5. Configure Environment
nano .env
# IMPORTANT: Update DATABASE_URL and NEXTAUTH_SECRET

### 6. Verify Setup
./status.sh

### 7. Restart if Needed
./restart.sh

## MANAGEMENT COMMANDS

| Command | Description |
|---------|-------------|
| ./status.sh | Check app status and recent logs |
| ./restart.sh | Restart the application |
| ./stop.sh | Stop the application |
| ./start.sh | Start the application |
| pm2 logs | View all logs |
| pm2 logs producetrack-app | View app logs only |
| pm2 monit | Monitor resources |

## TROUBLESHOOTING

### App won't start
1. Check .env file: cat .env
2. Check logs: pm2 logs --err
3. Test database: psql -d producetrack -c "SELECT 1"

### Port 3000 already in use
# Change PORT in .env and ecosystem.config.js

### Database connection failed
# Verify PostgreSQL is running:
sudo systemctl status postgresql

### Node.js version mismatch
# Check version: node -v
# Need v18+ for Next.js App Router

## ENVIRONMENT VARIABLES
- DATABASE_URL: PostgreSQL connection string
- NEXTAUTH_SECRET: 32+ character random string
- NEXTAUTH_URL: Full URL of your app
- JWT_SECRET: Random secret for JWT tokens
- PORT: Port to run on (default: 3000)

## SECURITY NOTES
- ✅ Change ALL secrets before production
- ✅ Use a proper NEXTAUTH_URL (HTTPS if public)
- ✅ Set up a firewall (ufw enable)
- ✅ Consider using a reverse proxy (Nginx)

## SUPPORT
For issues, check:
- Logs: pm2 logs
- Errors: cat logs/error.log
- Check firewall: sudo ufw status
'@
$instructionsContent | Out-File -FilePath deploy\UBUNTU_DEPLOY.txt -Encoding utf8

# Convert shell scripts to Unix line endings
Write-Host "  Converting scripts to Unix format..." -ForegroundColor Gray
Get-ChildItem deploy\*.sh | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "`r`n", "`n"
    [System.IO.File]::WriteAllText($_.FullName, $content)
}

Write-Host "[8/8] Creating deployment archive..." -ForegroundColor Yellow
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf deploy.tar.gz -C deploy .
    Write-Host "  Created deploy.tar.gz" -ForegroundColor Green
} else {
    Compress-Archive -Path deploy\* -DestinationPath deploy.zip -Force
    Write-Host "  Created deploy.zip (tar not available)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Deployment Package Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:"
if (Test-Path deploy.tar.gz) {
    $size = [math]::Round((Get-Item deploy.tar.gz).Length/1MB, 2)
    Write-Host "📦 deploy.tar.gz ($size MB)" -ForegroundColor Cyan
}
if (Test-Path deploy.zip) {
    $size = [math]::Round((Get-Item deploy.zip).Length/1MB, 2)
    Write-Host "📦 deploy.zip ($size MB)" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Before deploying, the Ubuntu team needs:"
Write-Host "1️⃣ PostgreSQL installed and running"
Write-Host "2️⃣ Database created: createdb producetrack"
Write-Host "3️⃣ Database user created: createuser producetrack_user"
Write-Host ""
Write-Host "After deploying, they MUST edit .env to set:"
Write-Host "   DATABASE_URL"
Write-Host "   NEXTAUTH_SECRET (32+ chars)"
Write-Host "   NEXTAUTH_URL"
Write-Host ""
Read-Host "Press Enter to exit"