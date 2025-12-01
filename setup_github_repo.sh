#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sin color

echo -e "${BLUE}🚀 Configurando repositorio de GitHub...${NC}\n"

# Variables
GITHUB_TOKEN="ghu_v2eoqhL0dzBFsEgngJJcrQ2tjuxYnN1Kkkl7"
GITHUB_USER="NaktoG"
REPO_NAME="finanzas-personales-app"

# 1. Crear el repositorio en GitHub usando la API
echo -e "${YELLOW}📦 Creando repositorio en GitHub...${NC}"
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"${REPO_NAME}\",\"description\":\"Aplicación moderna y segura de gestión de finanzas personales con Next.js, TypeScript y PostgreSQL\",\"private\":false,\"auto_init\":false}")

# Verificar si el repo ya existe o se creó correctamente
if echo "$RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✅ Repositorio creado exitosamente${NC}\n"
elif echo "$RESPONSE" | grep -q '"name already exists"'; then
    echo -e "${YELLOW}⚠️  El repositorio ya existe, continuando...${NC}\n"
else
    echo -e "${YELLOW}ℹ️  Respuesta de GitHub: $RESPONSE${NC}\n"
fi

# 2. Agregar remote de GitHub
echo -e "${YELLOW}🔗 Configurando remote de GitHub...${NC}"
git remote remove origin 2>/dev/null
git remote add origin https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git
echo -e "${GREEN}✅ Remote configurado${NC}\n"

# 3. Push al repositorio
echo -e "${YELLOW}📤 Subiendo código a GitHub...${NC}"
git branch -M main
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ¡Código subido exitosamente a GitHub!${NC}"
    echo -e "${BLUE}📍 Tu repositorio está disponible en:${NC}"
    echo -e "${GREEN}   https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}\n"
else
    echo -e "\n${YELLOW}⚠️  Hubo un problema al subir el código${NC}"
    echo -e "${BLUE}Puedes intentar manualmente con:${NC}"
    echo -e "git push -u origin main --force\n"
fi
