# 🚀 Guía de Deployment - Finanzas Personales App

Esta guía explica cómo deployar la aplicación en tu VPS usando Docker y Coolify.

## 📋 Requisitos Previos

- VPS con Ubuntu/Debian
- Docker y Docker Compose instalados
- Dominio configurado (atonixdev.com)
- PostgreSQL (incluido en docker-compose o externo)

---

## 🏗️ Estructura de Subdominios

```
atonixdev.com/                          → Landing page principal
├── n8n.atonixdev.com                   → n8n (workflow automation)
├── projects.atonixdev.com/finanzas     → Environment de testing/dev
└── finanzas.atonixdev.com              → Producción
```

---

## 🔧 Setup Inicial

### 1. Clonar el Repositorio

```bash
# En tu VPS
cd /opt/apps
git clone https://github.com/tu-usuario/finanzas-personales-app.git
cd finanzas-personales-app/nextjs_space
```

### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar con tus credenciales
nano .env
```

**Variables requeridas:**

```env
# Database (usa tu DB externa o la del docker-compose)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="https://finanzas.atonixdev.com"  # o projects.atonixdev.com/finanzas
NEXTAUTH_SECRET="genera-uno-con-openssl-rand-base64-32"

# Optional: AI Analysis
ABACUSAI_API_KEY="tu-api-key"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Build y Deploy con Docker

#### Opción A: Con docker-compose (recomendado para dev)

```bash
# Build y start
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Health check
curl http://localhost:3000/api/health
```

#### Opción B: Con Coolify (recomendado para producción)

1. **Conectar Repositorio en Coolify:**
   - Dashboard → New Resource → Git Repository
   - URL: `https://github.com/tu-usuario/finanzas-personales-app`
   - Branch: `main` (producción) o `dev` (testing)
   - Root Directory: `/nextjs_space`

2. **Configurar Build Settings:**
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Port: `3000`

3. **Agregar Variables de Entorno:**
   - En Coolify → Environment Variables
   - Agregar todas las variables del `.env`

4. **Deploy:**
   - Click en "Deploy"
   - Coolify manejará el build y deployment automáticamente

---

## 🌐 Configuración de Subdominios

### En Coolify:

#### Para Development (projects.atonixdev.com/finanzas)
```
Service Name: finanzas-dev
Domain: projects.atonixdev.com
Path: /finanzas
Branch: dev
```

#### Para Production (finanzas.atonixdev.com)
```
Service Name: finanzas-prod
Domain: finanzas.atonixdev.com
Branch: main
```

### SSL Automático:
Coolify configura Let's Encrypt automáticamente. Solo asegúrate de que:
- El dominio apunte a tu VPS (DNS A record)
- El puerto 80 y 443 estén abiertos

---

## 🔄 Workflow de Git

### Branches:

```
main          → Producción (finanzas.atonixdev.com)
dev           → Testing (projects.atonixdev.com/finanzas)
feature/*     → Desarrollo de features
hotfix/*      → Arreglos urgentes
```

### Flujo de Trabajo:

```bash
# 1. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commit
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 3. Push al repositorio
git push origin feature/nueva-funcionalidad

# 4. Merge a dev (para testing)
git checkout dev
git merge feature/nueva-funcionalidad
git push origin dev
# → Auto-deploy a projects.atonixdev.com/finanzas

# 5. Probar en projects.atonixdev.com/finanzas

# 6. Si todo ok, merge a main (producción)
git checkout main
git merge dev
git push origin main
# → Auto-deploy a finanzas.atonixdev.com
```

---

## 🐳 Comandos Docker Útiles

```bash
# Ver logs
docker-compose logs -f app

# Restart app
docker-compose restart app

# Stop all
docker-compose down

# Rebuild
docker-compose up -d --build

# Database migrations
docker-compose exec app npx prisma migrate deploy

# Prisma studio (GUI para DB)
docker-compose exec app npx prisma studio
```

---

## 🗄️ Database Migrations

### Crear nueva migración:
```bash
# En local
cd nextjs_space
npx prisma migrate dev --name nombre_migracion
```

### Aplicar en producción:
```bash
# Opción 1: Via docker-compose
docker-compose exec app npx prisma migrate deploy

# Opción 2: Via Coolify console
npx prisma migrate deploy
```

---

## 📊 Monitoring y Health Checks

### Health Check Endpoint:
```bash
# Local
curl http://localhost:3000/api/health

# Dev
curl https://projects.atonixdev.com/finanzas/api/health

# Production
curl https://finanzas.atonixdev.com/api/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "service": "finanzas-personales-app",
  "version": "1.0.0",
  "database": "connected"
}
```

### Logs en Producción:
```bash
# Coolify muestra logs en el dashboard
# O via SSH:
docker logs -f finanzas-prod --tail 100
```

---

## 🔐 Seguridad

### Checklist Pre-Deploy:

- [ ] `.env` en `.gitignore`
- [ ] NEXTAUTH_SECRET único y seguro
- [ ] DATABASE_URL con credenciales seguras
- [ ] SSL habilitado (Coolify lo hace automático)
- [ ] Firewall configurado (solo 80, 443, 22)
- [ ] Updates de seguridad del sistema
- [ ] Backups configurados

### Backups:

```bash
# Backup manual de la base de datos
docker-compose exec postgres pg_dump -U finanzas finanzas_db > backup-$(date +%Y%m%d).sql

# Restore
docker-compose exec -T postgres psql -U finanzas finanzas_db < backup-20241201.sql
```

---

## 🐛 Troubleshooting

### La app no arranca:

1. **Verificar logs:**
   ```bash
   docker-compose logs app
   ```

2. **Verificar variables de entorno:**
   ```bash
   docker-compose exec app printenv | grep DATABASE_URL
   ```

3. **Verificar DB connection:**
   ```bash
   docker-compose exec app npx prisma db pull
   ```

### Database connection error:

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Test connection
docker-compose exec postgres psql -U finanzas -d finanzas_db -c "SELECT 1;"
```

### Build fails:

```bash
# Clear cache y rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

---

## 🚀 Quick Deploy Commands

### Deploy a DEV:
```bash
git checkout dev
git pull origin dev
git merge feature/tu-feature
git push origin dev
# Coolify auto-deploys
```

### Deploy a PROD:
```bash
git checkout main
git pull origin main
git merge dev
git push origin main
# Coolify auto-deploys
```

---

## 📞 Soporte

- **Issues:** https://github.com/tu-usuario/finanzas-personales-app/issues
- **Email:** soporte@atonixdev.com
- **Docs:** https://atonixdev.com/docs

---

**Última actualización:** Diciembre 2024
**Versión:** 1.0.0
