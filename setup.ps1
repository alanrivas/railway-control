# 🚀 Railway Control System - Setup Script (PowerShell)
# Este script automatiza la configuración completa del proyecto en Windows

param(
  [switch]$SkipDocker,
  [switch]$SkipTerraform,
  [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to print colored output
function Write-Status {
  param([string]$Message)
  Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
  param([string]$Message)
  Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
  param([string]$Message)
  Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
  param([string]$Message)
  Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if command exists
function Test-Command {
  param([string]$Command)
  try {
    Get-Command $Command -ErrorAction Stop | Out-Null
    return $true
  }
  catch {
    return $false
  }
}

# Function to check prerequisites
function Test-Prerequisites {
  Write-Status "Checking prerequisites..."
    
  $missingTools = @()
    
  if (-not (Test-Command "node")) {
    $missingTools += "node"
  }
    
  if (-not (Test-Command "npm")) {
    $missingTools += "npm"
  }
    
  if (-not (Test-Command "docker")) {
    $missingTools += "docker"
  }
    
  if (-not (Test-Command "git")) {
    $missingTools += "git"
  }
    
  if ($missingTools.Count -gt 0) {
    Write-Error "Missing required tools: $($missingTools -join ', ')"
    Write-Error "Please install them and run this script again."
    exit 1
  }
    
  # Check Node.js version
  $nodeVersion = (node --version) -replace '^v', ''
  $requiredVersion = [version]"18.0.0"
  $currentVersion = [version]$nodeVersion
    
  if ($currentVersion -lt $requiredVersion) {
    Write-Warning "Node.js version $nodeVersion detected. Version >= $requiredVersion recommended."
  }
    
  Write-Success "All prerequisites are installed!"
}

# Function to install dependencies
function Install-Dependencies {
  Write-Status "Installing Node.js dependencies..."
    
  npm install
    
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
  }
    
  Write-Success "Dependencies installed!"
}

# Function to initialize environment files
function Initialize-Environment {
  Write-Status "Setting up environment files..."
    
  # Create .env.local if it doesn't exist
  if (-not (Test-Path ".env.local")) {
    $envLocalContent = @"
# Development environment variables
NODE_ENV=development
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Railway Control System
VITE_API_URL=http://localhost:3001

# Debug flags
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
"@
    $envLocalContent | Set-Content ".env.local"
    Write-Success "Created .env.local file"
  }
  else {
    Write-Warning ".env.local already exists, skipping..."
  }
    
  # Create .env.production if it doesn't exist
  if (-not (Test-Path ".env.production")) {
    $envProdContent = @"
# Production environment variables
NODE_ENV=production
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Railway Control System
VITE_API_URL=https://api.railway-control.com

# Production optimizations
VITE_DEBUG=false
VITE_LOG_LEVEL=error
"@
    $envProdContent | Set-Content ".env.production"
    Write-Success "Created .env.production file"
  }
  else {
    Write-Warning ".env.production already exists, skipping..."
  }
}

# Function to test the application
function Test-Application {
  Write-Status "Running tests..."
    
  # Type checking
  Write-Status "Running TypeScript type check..."
  npm run type-check
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Type check failed"
    exit 1
  }
    
  # Linting
  Write-Status "Running ESLint..."
  npm run lint
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Linting failed"
    exit 1
  }
    
  # Build test
  Write-Status "Testing production build..."
  npm run build
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed"
    exit 1
  }
    
  Write-Success "All tests passed!"
}

# Function to test Docker setup
function Test-Docker {
  Write-Status "Testing Docker setup..."
    
  # Test development Docker build
  Write-Status "Building development Docker image..."
  docker build -f Dockerfile.dev -t railway-control:dev .
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build development Docker image"
    exit 1
  }
    
  # Test production Docker build
  Write-Status "Building production Docker image..."
  docker build -f Dockerfile -t railway-control:prod .
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build production Docker image"
    exit 1
  }
    
  # Test production container
  Write-Status "Testing production container..."
    
  # Start container in background
  docker run -d -p 8080:80 --name railway-control-test railway-control:prod
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to start container"
    exit 1
  }
    
  # Wait for container to start
  Start-Sleep -Seconds 5
    
  # Test if application is responding
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
      Write-Success "Production container is working!"
    }
    else {
      throw "HTTP $($response.StatusCode)"
    }
  }
  catch {
    Write-Error "Production container is not responding: $_"
    docker logs railway-control-test
    docker stop railway-control-test | Out-Null
    docker rm railway-control-test | Out-Null
    exit 1
  }
    
  # Cleanup
  docker stop railway-control-test | Out-Null
  docker rm railway-control-test | Out-Null
    
  Write-Success "Docker setup is working correctly!"
}

# Function to initialize Git hooks
function Initialize-GitHooks {
  Write-Status "Setting up Git hooks..."
    
  # Create hooks directory if it doesn't exist
  $hooksDir = ".git\hooks"
  if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
  }
    
  # Create pre-commit hook
  $preCommitHook = @"
#!/bin/sh
# Pre-commit hook for Railway Control System

echo "🔍 Running pre-commit checks..."

# Check if staged files include any TypeScript/JavaScript files
if git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' > /dev/null; then
    echo "📝 Running linter on staged files..."
    npm run lint
    
    echo "🔍 Running type check..."
    npm run type-check
    
    echo "✅ Pre-commit checks passed!"
else
    echo "ℹ️  No TypeScript/JavaScript files to check"
fi
"@
    
  $preCommitHook | Set-Content "$hooksDir\pre-commit"
    
  Write-Success "Git hooks configured!"
}

# Function to initialize Terraform
function Initialize-Terraform {
  if (Test-Command "terraform") {
    Write-Status "Initializing Terraform..."
        
    Push-Location "terraform"
    try {
      terraform init
      if ($LASTEXITCODE -ne 0) {
        Write-Error "Terraform initialization failed"
        exit 1
      }
    }
    finally {
      Pop-Location
    }
        
    Write-Success "Terraform initialized!"
  }
  else {
    Write-Warning "Terraform not found. Skipping Terraform setup."
    Write-Warning "Install Terraform from: https://www.terraform.io/downloads.html"
  }
}

# Function to show next steps
function Show-NextSteps {
  Write-Success "🎉 Setup completed successfully!"
  Write-Host ""
  Write-Status "Next steps:"
  Write-Host ""
  Write-Host "1. 🚀 Start development server:" -ForegroundColor Cyan
  Write-Host "   npm run dev" -ForegroundColor White
  Write-Host ""
  Write-Host "2. 🐳 Or start with Docker:" -ForegroundColor Cyan
  Write-Host "   npm run dev:docker" -ForegroundColor White
  Write-Host ""
  Write-Host "3. 🌐 Open your browser to:" -ForegroundColor Cyan
  Write-Host "   http://localhost:5173" -ForegroundColor White
  Write-Host ""
  Write-Host "4. 📋 Before deploying, configure your secrets:" -ForegroundColor Cyan
  Write-Host "   - Docker Hub credentials" -ForegroundColor White
  Write-Host "   - Azure publish profile" -ForegroundColor White
  Write-Host "   - GitHub repository secrets" -ForegroundColor White
  Write-Host ""
  Write-Host "5. 📖 Read the README.md for detailed instructions" -ForegroundColor Cyan
  Write-Host ""
  Write-Status "Happy coding! 🚂"
}

# Main execution
function Main {
  Write-Host "🚂 Railway Control System Setup" -ForegroundColor Magenta
  Write-Host "================================" -ForegroundColor Magenta
  Write-Host ""
    
  try {
    Test-Prerequisites
    Install-Dependencies
    Initialize-Environment
    Test-Application
        
    # Test Docker if not skipped
    if (-not $SkipDocker) {
      $dockerChoice = Read-Host "Do you want to test Docker setup? (y/N)"
      if ($dockerChoice -match '^[Yy]') {
        Test-Docker
      }
    }
        
    Initialize-GitHooks
        
    # Setup Terraform if not skipped
    if (-not $SkipTerraform) {
      $terraformChoice = Read-Host "Do you want to initialize Terraform? (y/N)"
      if ($terraformChoice -match '^[Yy]') {
        Initialize-Terraform
      }
    }
        
    Show-NextSteps
  }
  catch {
    Write-Error "Setup failed: $_"
    exit 1
  }
}

# Run main function
Main