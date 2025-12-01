#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    📤 Subiendo Código a GitHub - Finanzas Personales App${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Verificar si ya existe el remote
if git remote get-url origin >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Remote 'origin' ya existe. Actualizando...${NC}"
    git remote set-url origin https://github.com/NaktoG/finanzas-personales-app.git
else
    echo -e "${YELLOW}➕ Agregando remote de GitHub...${NC}"
    git remote add origin https://github.com/NaktoG/finanzas-personales-app.git
fi

echo -e "${GREEN}✅ Remote configurado${NC}\n"

# Cambiar a branch main
echo -e "${YELLOW}🔄 Configurando branch principal...${NC}"
git branch -M main
echo -e "${GREEN}✅ Branch configurada${NC}\n"

# Push al repositorio
echo -e "${YELLOW}📤 Subiendo código a GitHub...${NC}"
echo -e "${BLUE}   (Si te pide autenticación, usa tu Personal Access Token)${NC}\n"

git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}              🎉 ¡Código subido exitosamente!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${BLUE}📍 Tu repositorio está disponible en:${NC}"
    echo -e "${GREEN}   https://github.com/NaktoG/finanzas-personales-app${NC}\n"
    
    echo -e "${BLUE}📊 Estadísticas del repositorio:${NC}"
    git log --oneline | head -1
    echo -e "   📝 $(git ls-files | wc -l) archivos"
    echo -e "   💻 $(find nextjs_space/app nextjs_space/components nextjs_space/lib -name '*.tsx' -o -name '*.ts' 2>/dev/null | wc -l) archivos TypeScript"
    echo -e "   🎨 $(find nextjs_space/components -name '*.tsx' 2>/dev/null | wc -l) componentes\n"
    
    echo -e "${BLUE}✨ Tu repositorio incluye:${NC}"
    echo -e "   ✅ README profesional con documentación completa"
    echo -e "   ✅ ARCHITECTURE.md explicando decisiones de diseño"
    echo -e "   ✅ CONTRIBUTING.md con guía de contribución"
    echo -e "   ✅ LICENSE (MIT)"
    echo -e "   ✅ Código fuente completo y optimizado\n"
    
    echo -e "${GREEN}🎯 ¡Listo para compartir con tus amigos programadores!${NC}\n"
else
    echo -e "\n${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}                  ⚠️  Error al subir el código${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}Posibles causas:${NC}"
    echo -e "   1. El repositorio no existe en GitHub"
    echo -e "   2. No tienes permisos de escritura"
    echo -e "   3. Necesitas autenticación\n"
    
    echo -e "${BLUE}Soluciones:${NC}"
    echo -e "   1. Crea el repositorio en: ${GREEN}https://github.com/new${NC}"
    echo -e "   2. Usa un Personal Access Token para autenticarte"
    echo -e "   3. Lee INSTRUCCIONES_GITHUB.md para más detalles\n"
    
    exit 1
fi
