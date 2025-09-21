#!/usr/bin/env bash

# 🚀 Quick Setup Script for Railway Control System
# Este script automatiza la configuración inicial del proyecto

set -euo pipefail

echo "🚂 ====================================="
echo "🚂   Railway Control System Setup"
echo "🚂 ====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_step "Verificando prerrequisitos..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Instala npm desde https://nodejs.org"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker no está instalado. Para usar funcionalidades Docker, instala desde https://docker.com"
else
    print_success "Docker encontrado"
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git no está instalado. Instala Git desde https://git-scm.com"
    exit 1
fi

print_success "Prerrequisitos verificados"
echo ""

# Get Node.js version
NODE_VERSION=$(node --version)
print_step "Node.js version: $NODE_VERSION"

# Install dependencies
print_step "Instalando dependencias de Node.js..."
npm install
print_success "Dependencias instaladas"
echo ""

# Build the project
print_step "Construyendo el proyecto..."
npm run build
print_success "Proyecto construido exitosamente"
echo ""

# Docker setup (optional)
if command -v docker &> /dev/null; then
    print_step "¿Quieres construir la imagen Docker? (y/n)"
    read -r BUILD_DOCKER
    
    if [[ $BUILD_DOCKER == "y" || $BUILD_DOCKER == "Y" ]]; then
        print_step "Construyendo imagen Docker..."
        docker build -t railway-control:latest .
        print_success "Imagen Docker construida: railway-control:latest"
        
        print_step "¿Quieres probar la imagen Docker? (y/n)"
        read -r TEST_DOCKER
        
        if [[ $TEST_DOCKER == "y" || $TEST_DOCKER == "Y" ]]; then
            print_step "Iniciando contenedor de prueba..."
            docker run -d -p 8080:80 --name railway-test railway-control:latest
            
            # Wait for container to start
            sleep 3
            
            # Check if container is running
            if docker ps | grep -q railway-test; then
                print_success "Contenedor iniciado exitosamente!"
                print_step "Aplicación disponible en: http://localhost:8080"
                
                print_step "¿Quieres abrir la aplicación en el navegador? (y/n)"
                read -r OPEN_BROWSER
                
                if [[ $OPEN_BROWSER == "y" || $OPEN_BROWSER == "Y" ]]; then
                    if command -v xdg-open &> /dev/null; then
                        xdg-open http://localhost:8080
                    elif command -v open &> /dev/null; then
                        open http://localhost:8080
                    else
                        print_step "Abre manualmente: http://localhost:8080"
                    fi
                fi
                
                print_step "Presiona Enter para detener el contenedor de prueba..."
                read -r
                
                docker stop railway-test
                docker rm railway-test
                print_success "Contenedor de prueba detenido y eliminado"
            else
                print_error "El contenedor no pudo iniciarse"
            fi
        fi
    fi
fi

echo ""
print_step "Configurando Git hooks (opcional)..."
if [ -d ".git" ]; then
    # Setup Git hooks for better commits
    mkdir -p .git/hooks
    
    # Pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running pre-commit checks..."

# Run build to check for errors
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Please fix errors before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    print_success "Git hooks configurados"
else
    print_warning "No es un repositorio Git. Considera inicializar con 'git init'"
fi

echo ""
print_step "¿Quieres inicializar un repositorio Git? (y/n)"
read -r INIT_GIT

if [[ $INIT_GIT == "y" || $INIT_GIT == "Y" ]] && [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "feat: initial setup with complete CI/CD pipeline"
    print_success "Repositorio Git inicializado"
    
    print_step "Para conectar con GitHub:"
    echo "1. Crea un repositorio en GitHub"
    echo "2. Ejecuta: git remote add origin https://github.com/tu-usuario/railway-control.git"
    echo "3. Ejecuta: git push -u origin main"
fi

echo ""
echo "🎉 ====================================="
echo "🎉   Setup Completado Exitosamente!"
echo "🎉 ====================================="
echo ""
print_success "Tu proyecto Railway Control System está listo!"
echo ""
echo "📋 Comandos disponibles:"
echo "   npm run dev          - Iniciar desarrollo"
echo "   npm run build        - Construir para producción"
echo "   npm run preview      - Preview de build"
echo "   npm run docker:dev   - Desarrollo con Docker"
echo "   npm run docker:prod  - Producción con Docker"
echo ""
echo "📚 Próximos pasos:"
echo "   1. Lee SETUP_COMPLETED.md para instrucciones detalladas"
echo "   2. Configura GitHub repository y secrets"
echo "   3. Configura Docker Hub y Azure"
echo "   4. ¡Haz tu primer deployment!"
echo ""
echo "🚀 ¡Feliz codificación!"