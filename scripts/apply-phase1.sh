#!/bin/bash

# Script para aplicar cambios de FASE 1 - Branding & UX
# Autor: atonixdev.com
# Uso: ./scripts/apply-phase1.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Aplicando Cambios FASE 1 - Branding & UX${NC}"
echo ""

# Verificar que estamos en la raíz del proyecto
if [ ! -f "CAMBIOS_FASE_1.md" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde la raíz del proyecto${NC}"
    exit 1
fi

# 1. Instalar dependencias (por si acaso)
echo -e "${BLUE}📦 Verificando dependencias...${NC}"
cd nextjs_space
if [ -f "package.json" ]; then
    yarn install
    echo -e "${GREEN}✅ Dependencias verificadas${NC}"
fi

# 2. Generar cliente de Prisma
echo ""
echo -e "${BLUE}🔧 Generando cliente de Prisma...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Cliente de Prisma generado${NC}"

# 3. Aplicar migración
echo ""
echo -e "${BLUE}💾 Aplicando migración de base de datos...${NC}"
echo -e "${YELLOW}⚠️  Esto creará el modelo Feedback en tu base de datos${NC}"
echo ""

read -p "¿Continuar con la migración? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Migración cancelada${NC}"
    echo ""
    echo -e "${BLUE}Para aplicarla manualmente más tarde:${NC}"
    echo "  cd nextjs_space"
    echo "  npx prisma migrate dev --name add_feedback_model"
    echo ""
else
    npx prisma migrate dev --name add_feedback_model
    echo -e "${GREEN}✅ Migración aplicada correctamente${NC}"
fi

# 4. Build (verificar que compile)
echo ""
echo -e "${BLUE}🔨 Verificando que el código compile...${NC}"
yarn build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
else
    echo -e "${RED}❌ Error en build${NC}"
    echo -e "${YELLOW}Revisa los errores arriba y corrígelos antes de deployar${NC}"
    exit 1
fi

# 5. Instrucciones finales
echo ""
echo -e "${GREEN}🎉 ¡Cambios de FASE 1 aplicados exitosamente!${NC}"
echo ""
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo ""
echo "1️⃣  Probar localmente:"
echo "   ${BLUE}yarn dev${NC}"
echo "   Visita: http://localhost:3000"
echo ""
echo "2️⃣  Verificar:"
echo "   • Footer al final de páginas"
echo "   • Botón de feedback flotante"
echo "   • Metadata en <head>"
echo ""
echo "3️⃣  (Opcional) Configurar webhook n8n:"
echo "   Agrega a .env:"
echo "   ${BLUE}N8N_WEBHOOK_URL_FEEDBACK=\"https://n8n.atonixdev.com/webhook/feedback\"${NC}"
echo ""
echo "4️⃣  Deploy a dev branch:"
echo "   ${BLUE}git add .${NC}"
echo "   ${BLUE}git commit -m \"feat: add branding and feedback system\"${NC}"
echo "   ${BLUE}git push origin dev${NC}"
echo ""
echo "5️⃣  Probar en projects.atonixdev.com/finanzas"
echo ""
echo "6️⃣  Si todo ok, merge a main y deploy a producción"
echo ""
echo -e "${YELLOW}📖 Ver documentación completa en: CAMBIOS_FASE_1.md${NC}"
echo ""
