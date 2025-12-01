#!/bin/bash

# Script para conectar con GitHub y hacer push inicial
# Uso: ./scripts/setup-github.sh <github-repo-url>

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar argumento
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Falta URL del repositorio${NC}"
    echo ""
    echo "Uso: ./scripts/setup-github.sh <github-repo-url>"
    echo ""
    echo "Ejemplo:"
    echo "  ./scripts/setup-github.sh https://github.com/tu-usuario/finanzas-personales-app.git"
    echo ""
    exit 1
fi

REPO_URL=$1

echo -e "${BLUE}🚀 Configurando GitHub remote...${NC}"
echo ""

# Verificar que estamos en un repo git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: No es un repositorio Git${NC}"
    echo -e "${YELLOW}Ejecuta primero: ./scripts/init-git.sh${NC}"
    exit 1
fi

# Agregar remote (si no existe)
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Remote 'origin' ya existe${NC}"
    echo "Remote actual: $(git remote get-url origin)"
    echo ""
    read -p "¿Deseas reemplazarlo? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        git remote add origin "$REPO_URL"
        echo -e "${GREEN}✅ Remote actualizado${NC}"
    else
        echo -e "${YELLOW}Manteniendo remote actual${NC}"
    fi
else
    git remote add origin "$REPO_URL"
    echo -e "${GREEN}✅ Remote 'origin' agregado${NC}"
fi

echo ""
echo -e "${BLUE}📤 Pushing branches a GitHub...${NC}"
echo ""

# Push main
echo -e "${BLUE}Pushing main...${NC}"
git checkout main
git push -u origin main
echo -e "${GREEN}✅ main pushed${NC}"

# Push dev
echo -e "${BLUE}Pushing dev...${NC}"
git checkout dev
git push -u origin dev
echo -e "${GREEN}✅ dev pushed${NC}"

# Volver a main
git checkout main

echo ""
echo -e "${GREEN}🎉 ¡Repositorio conectado exitosamente con GitHub!${NC}"
echo ""
echo "🔗 Repositorio: ${BLUE}$REPO_URL${NC}"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1️⃣  Configurar Coolify:"
echo "   • Dashboard → New Resource → Git Repository"
echo "   • URL: $REPO_URL"
echo "   • Branch main → finanzas.atonixdev.com"
echo "   • Branch dev → projects.atonixdev.com/finanzas"
echo ""
echo "2️⃣  Configurar variables de entorno en Coolify"
echo ""
echo "3️⃣  Deploy automático al push"
echo ""
echo -e "${YELLOW}📖 Ver guía completa en: DEPLOYMENT.md${NC}"
echo ""
