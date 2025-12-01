# ⚡ Quick Start - Finanzas Personales App

Guía rápida para comenzar a desarrollar localmente en **5 minutos**.

---

## 🚀 Setup Local (Development)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/finanzas-personales-app.git
cd finanzas-personales-app/nextjs_space
```

### 2. Instalar dependencias

```bash
yarn install
```

### 3. Configurar variables de entorno

```bash
# Copiar template
cp .env.example .env

# Editar con tus credenciales
nano .env
```

**Mínimo requerido:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finanzas_db"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
```

### 4. Setup de base de datos

```bash
# Crear y aplicar migraciones
yarn prisma migrate dev

# (Opcional) Poblar con datos de ejemplo
yarn prisma db seed
```

### 5. Iniciar el servidor

```bash
yarn dev
```

✅ **La app estará en:** http://localhost:3000

---

## 🐳 Con Docker (más fácil)

```bash
# En la carpeta nextjs_space
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Acceder
open http://localhost:3000
```

---

## 🌳 Working with Git Branches

### Crear nueva feature:

```bash
# Crear branch desde dev
git checkout dev
git pull origin dev
git checkout -b feature/mi-nueva-feature

# Hacer cambios...
git add .
git commit -m "feat: descripción de la feature"
git push origin feature/mi-nueva-feature
```

### Merge a dev (testing):

```bash
git checkout dev
git merge feature/mi-nueva-feature
git push origin dev
```

### Deploy a producción:

```bash
git checkout main
git merge dev
git push origin main
```

---

## 📝 Scripts Útiles

```bash
# Desarrollo
yarn dev              # Servidor de desarrollo
yarn build            # Build para producción
yarn start            # Servidor de producción
yarn lint             # Linter

# Base de datos
yarn prisma studio    # GUI para la DB
yarn prisma migrate dev
yarn prisma generate

# Docker
docker-compose up -d          # Start
docker-compose down           # Stop
docker-compose logs -f app    # Ver logs
```

---

## 🔗 Links Importantes

- 📖 [README Completo](./README.md)
- 🚀 [Guía de Deployment](./DEPLOYMENT.md)
- 🏗️ [Arquitectura](./ARCHITECTURE.md)
- 🔒 [Seguridad](./SECURITY.md)

---

## 💡 Primeros Pasos

1. **Explorar el código:**
   - `app/` - Páginas y API routes
   - `components/` - Componentes React
   - `lib/` - Utilidades y lógica de negocio
   - `prisma/` - Esquema de base de datos

2. **Probar features:**
   - Crear cuenta en http://localhost:3000
   - Agregar transacciones
   - Crear presupuestos
   - Ver dashboard

3. **Hacer cambios:**
   - Crear feature branch
   - Modificar código
   - Test local
   - Push y merge

---

## 🆘 Troubleshooting

### Error de conexión a la DB:
```bash
# Verificar que PostgreSQL esté corriendo
psql -U postgres

# O usar Docker
docker-compose up -d postgres
```

### Errores de TypeScript:
```bash
yarn prisma generate
```

### Puerto 3000 ocupado:
```bash
# Cambiar puerto
PORT=3001 yarn dev
```

---

**¿Necesitas ayuda?** Abre un [issue](https://github.com/tu-usuario/finanzas-personales-app/issues)
