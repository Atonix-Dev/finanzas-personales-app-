# 🎯 Setup Completo - De Cero a Producción

Esta es tu guía **paso a paso** para tener la app funcionando en producción.
**Sin experiencia necesaria** - solo copia y pega comandos.

---

## 📋 Checklist General

- [ ] VPS con Ubuntu/Debian funcionando
- [ ] Dominio atonixdev.com configurado
- [ ] n8n.atonixdev.com funcionando ✅ (ya lo tienes)
- [ ] GitHub account
- [ ] Código en tu máquina local

---

## 🚀 PARTE 1: Preparar el Código Localmente

### Paso 1.1: Inicializar Git

```bash
# En la carpeta del proyecto
cd /ruta/a/finanzas-personales-app-main

# Ejecutar script de inicialización
./scripts/init-git.sh
```

**Qué hace este script:**
- ✅ Inicializa Git
- ✅ Crea branches (main y dev)
- ✅ Hace commit inicial
- ✅ Prepara todo para GitHub

---

### Paso 1.2: Crear Repositorio en GitHub

1. **Ir a:** https://github.com/new

2. **Configurar:**
   - Repository name: `finanzas-personales-app`
   - Description: `💰 App de finanzas personales - atonixdev.com`
   - Public o Private (tu elección)
   - ❌ NO inicializar con README (ya tenemos uno)

3. **Click en:** "Create repository"

4. **Copiar la URL:** Algo como:
   ```
   https://github.com/tu-usuario/finanzas-personales-app.git
   ```

---

### Paso 1.3: Conectar con GitHub

```bash
# Conectar y push
./scripts/setup-github.sh https://github.com/tu-usuario/finanzas-personales-app.git

# Esto hace push de main y dev automáticamente
```

✅ **Listo! Código en GitHub**

Verifica en: `https://github.com/tu-usuario/finanzas-personales-app`

---

## 🖥️ PARTE 2: Configurar VPS y Coolify

### Paso 2.1: Verificar Coolify

```bash
# SSH a tu VPS
ssh root@tu-vps-ip

# Verificar que Coolify esté corriendo
docker ps | grep coolify
```

Si no ves nada, instalar Coolify:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Acceder a: `http://tu-vps-ip:8000`

---

### Paso 2.2: Configurar PostgreSQL (Base de Datos)

**Opción A: Usar PostgreSQL de Coolify (recomendado para empezar)**

1. En Coolify Dashboard → **"New Resource"**
2. Select **"PostgreSQL"**
3. Configurar:
   - Name: `finanzas-db`
   - PostgreSQL 15
   - Password: (genera uno seguro)
4. Click **"Create"**
5. **Copiar la DATABASE_URL** que te da

**Opción B: Ya tienes PostgreSQL externo**

Usa tu DATABASE_URL actual:
```
postgresql://user:password@host:5432/database
```

---

### Paso 2.3: Crear App de DEV (Testing)

En Coolify Dashboard:

1. **New Resource** → **"Git Repository"**

2. **Configurar Source:**
   - Repository: `https://github.com/tu-usuario/finanzas-personales-app`
   - Branch: `dev`
   - Root Directory: `/nextjs_space`

3. **Configurar Build:**
   - Build Pack: `nixpacks`
   - Build Command: `yarn install && yarn build`
   - Start Command: `yarn start`
   - Port: `3000`

4. **Configurar Domain:**
   - Domain: `projects.atonixdev.com`
   - Path: `/finanzas` (opcional)
   - SSL: ✅ Enable (Let's Encrypt)

5. **Variables de Entorno:**

   Click en **"Environment Variables"** y agregar:

   ```env
   DATABASE_URL=postgresql://...  (de paso 2.2)
   NEXTAUTH_URL=https://projects.atonixdev.com/finanzas
   NEXTAUTH_SECRET=(genera con: openssl rand -base64 32)
   NODE_ENV=production
   ```

6. **Deploy:**
   - Click en **"Deploy"**
   - Espera 5-10 minutos (primera vez)
   - Ver logs en tiempo real

✅ **App de DEV funcionando en:** `https://projects.atonixdev.com/finanzas`

---

### Paso 2.4: Crear App de PRODUCCIÓN

**Repetir exactamente el Paso 2.3 pero con:**

- Branch: `main` (en vez de dev)
- Domain: `finanzas.atonixdev.com` (en vez de projects...)
- Mismas variables de entorno pero cambiando:
  ```env
  NEXTAUTH_URL=https://finanzas.atonixdev.com
  ```

✅ **App de PRODUCCIÓN funcionando en:** `https://finanzas.atonixdev.com`

---

## 🎯 PARTE 3: Workflow de Desarrollo

### Escenario 1: Agregar nueva feature

```bash
# 1. Crear feature branch
git checkout dev
git pull origin dev
git checkout -b feature/nueva-cosa

# 2. Hacer cambios en el código
# ... editar archivos ...

# 3. Commit
git add .
git commit -m "feat: descripción de la nueva cosa"

# 4. Push
git push origin feature/nueva-cosa

# 5. Merge a dev
git checkout dev
git merge feature/nueva-cosa
git push origin dev

# 6. Coolify auto-deploys a projects.atonixdev.com/finanzas
# 7. Probar ahí
```

### Escenario 2: Deploy a producción

```bash
# Solo cuando todo funcione perfecto en dev

git checkout main
git pull origin main
git merge dev
git push origin main

# Coolify auto-deploys a finanzas.atonixdev.com
```

---

## 🐛 PARTE 4: Troubleshooting

### La app no carga:

1. **Verificar deployment en Coolify:**
   - Dashboard → Ver logs
   - Buscar errores rojos

2. **Verificar variables de entorno:**
   - ¿DATABASE_URL correcto?
   - ¿NEXTAUTH_SECRET configurado?

3. **Verificar DNS:**
   ```bash
   nslookup finanzas.atonixdev.com
   # Debe apuntar a la IP de tu VPS
   ```

### Error de conexión a base de datos:

```bash
# SSH al VPS
ssh root@tu-vps-ip

# Verificar PostgreSQL
docker ps | grep postgres

# Ver logs de PostgreSQL
docker logs <container-id>
```

### Coolify deployment fails:

1. Ver logs completos en Coolify
2. Común: Node version incorrecta
   - Coolify usa Node 18 por defecto (está ok)
3. Común: Variables de entorno faltantes
   - Verificar que todas estén configuradas

---

## ✅ PARTE 5: Verificación Final

### Checklist de Producción:

- [ ] ✅ GitHub repo funcionando
- [ ] ✅ Branch main y dev creadas
- [ ] ✅ Coolify conectado al repo
- [ ] ✅ PostgreSQL funcionando
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ DNS apuntando correctamente
- [ ] ✅ SSL funcionando (https)
- [ ] ✅ projects.atonixdev.com/finanzas carga
- [ ] ✅ finanzas.atonixdev.com carga
- [ ] ✅ Health check ok: `/api/health`
- [ ] ✅ Puedes crear cuenta y login

### Test rápido:

```bash
# Health check DEV
curl https://projects.atonixdev.com/finanzas/api/health

# Health check PROD
curl https://finanzas.atonixdev.com/api/health

# Debe responder:
# {"status":"healthy","timestamp":"...","service":"finanzas-personales-app",...}
```

---

## 📚 PARTE 6: Próximos Pasos

### Ahora que tienes todo funcionando:

1. **📱 Probar la app:**
   - Crear cuenta
   - Agregar transacciones
   - Crear presupuestos
   - Ver dashboard

2. **🎨 Personalizar:**
   - Logo/branding
   - Colores
   - Footer con "Powered by atonixdev.com"

3. **📊 Configurar Analytics:**
   - Plausible Analytics (self-hosted)
   - Google Analytics (si prefieres)

4. **🐛 Configurar Error Tracking:**
   - Sentry
   - LogRocket

5. **📝 Documentar tu proceso:**
   - Blog post en atonixdev.com
   - Thread en Twitter/X
   - Video si te animas

---

## 🆘 Ayuda y Recursos

### Documentación:
- 📖 [README Completo](./README.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 🌳 [Git Workflow](./GIT_WORKFLOW.md)
- ⚡ [Quick Start](./QUICK_START.md)
- 🏗️ [Arquitectura](./ARCHITECTURE.md)

### Si algo sale mal:

1. **Revisar logs en Coolify** (99% de las veces está ahí el error)
2. **Verificar variables de entorno**
3. **Verificar DNS y SSL**
4. **Google el error específico**

### Comandos útiles:

```bash
# Ver logs en VPS
ssh root@tu-vps-ip
docker logs -f <container-name> --tail 100

# Reiniciar app en Coolify
# Dashboard → Restart

# Ver status de todos los servicios
docker ps
```

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí y todo funciona, **¡LO LOGRASTE!** 🚀

Ahora tienes:
- ✅ App funcionando en producción
- ✅ Environment de testing
- ✅ Workflow profesional con Git
- ✅ Auto-deployment configurado
- ✅ SSL y seguridad básica
- ✅ Base para más apps

**Siguiente misión:**
- Documentar el proceso en tu blog
- Compartir en redes sociales
- Empezar a conseguir usuarios

**Remember:** No necesitas ser experto. Solo necesitas ser **persistente**.

---

**¿Dudas o problemas?**
Documenta el error exacto (screenshots, logs) y búscalo en Google.
La comunidad de developers es enorme y alguien ya tuvo ese problema.

**Good luck!** 🍀

---

Última actualización: Diciembre 2024
