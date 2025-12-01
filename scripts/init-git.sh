#!/bin/bash

# Script para inicializar Git repository con estructura de branches
# Uso: ./scripts/init-git.sh

set -e

echo "🚀 Inicializando Git Repository para finanzas-personales-app..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en la raíz del proyecto
if [ ! -f "README.md" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# 1. Inicializar Git (si no está inicializado)
if [ ! -d ".git" ]; then
    echo -e "${BLUE}📦 Inicializando Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git inicializado${NC}"
else
    echo -e "${YELLOW}⚠️  Git ya está inicializado${NC}"
fi

# 2. Configurar .gitignore
echo -e "${BLUE}📝 Verificando .gitignore...${NC}"
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ .gitignore existe${NC}"
else
    echo -e "${YELLOW}⚠️  Creando .gitignore básico...${NC}"
    cat > .gitignore << EOF
# Dependencies
**/node_modules
**/.yarn/

# Build outputs
.next
.cache
.build
dist

# Environment variables
.env
.env.local
.env*.local

# Logs
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/*
.idea/
EOF
fi

# 3. Crear .env.example si no existe
echo -e "${BLUE}🔐 Verificando .env.example...${NC}"
if [ ! -f "nextjs_space/.env.example" ]; then
    echo -e "${YELLOW}⚠️  Creando .env.example...${NC}"
    echo "Creado en DEPLOYMENT.md"
else
    echo -e "${GREEN}✅ .env.example existe${NC}"
fi

# 4. Hacer primer commit en main
echo -e "${BLUE}💾 Creando primer commit...${NC}"

git add .
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No hay cambios para commitear${NC}"
else
    git commit -m "chore: initial commit - finanzas personales app

- Estructura completa del proyecto
- Next.js 14.2 + TypeScript
- Prisma + PostgreSQL
- Docker setup
- Documentación completa
- Health check endpoint
- Security headers configurados

Parte del ecosistema atonixdev.com"
    echo -e "${GREEN}✅ Commit inicial creado${NC}"
fi

# 5. Crear branch dev
echo -e "${BLUE}🌿 Creando branch dev...${NC}"
git checkout -b dev 2>/dev/null || git checkout dev
echo -e "${GREEN}✅ Branch dev creada${NC}"

# 6. Volver a main
git checkout main

echo ""
echo -e "${GREEN}🎉 ¡Git repository configurado correctamente!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1️⃣  Crear repositorio en GitHub:"
echo "   https://github.com/new"
echo ""
echo "2️⃣  Conectar con GitHub:"
echo "   ${BLUE}git remote add origin https://github.com/tu-usuario/finanzas-personales-app.git${NC}"
echo ""
echo "3️⃣  Push branches iniciales:"
echo "   ${BLUE}git push -u origin main${NC}"
echo "   ${BLUE}git push -u origin dev${NC}"
echo ""
echo "4️⃣  Configurar Coolify para auto-deploy:"
echo "   - Branch main → finanzas.atonixdev.com"
echo "   - Branch dev → projects.atonixdev.com/finanzas"
echo ""
echo -e "${YELLOW}📖 Ver guía completa en: GIT_WORKFLOW.md${NC}"
echo ""
