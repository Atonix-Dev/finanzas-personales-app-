# 📚 Índice de Documentación - Finanzas Personales App

Guía rápida de navegación por toda la documentación del proyecto.

---

## 🚀 Para Empezar

| Documento | Descripción | Para quién |
|-----------|-------------|------------|
| **[SETUP_COMPLETO.md](./SETUP_COMPLETO.md)** | 🎯 **EMPIEZA AQUÍ** - Setup completo de cero a producción | Principiantes |
| [QUICK_START.md](./QUICK_START.md) | ⚡ Setup local en 5 minutos | Developers |
| [README.md](./README.md) | 📖 Documentación completa del proyecto | Todos |

---

## 🔧 Deployment y Operaciones

| Documento | Descripción | Cuándo usarlo |
|-----------|-------------|---------------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 🚀 Guía de deployment con Docker/Coolify | Deploy a VPS |
| [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) | 🌳 Workflow de Git y branches | Desarrollo diario |

---

## 📐 Arquitectura y Desarrollo

| Documento | Descripción | Para quién |
|-----------|-------------|------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 🏗️ Arquitectura técnica detallada | Developers avanzados |
| [SECURITY.md](./SECURITY.md) | 🔒 Políticas de seguridad | DevOps/Security |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 🤝 Guía de contribución | Contributors |

---

## 🛠️ Scripts y Herramientas

| Script | Qué hace | Cuándo usarlo |
|--------|----------|---------------|
| `scripts/init-git.sh` | Inicializa Git con branches | Setup inicial |
| `scripts/setup-github.sh` | Conecta con GitHub | Después de init-git |

---

## 📋 Guía Rápida por Escenario

### Escenario 1: "Nunca he usado Git ni deploy nada"
```
1. SETUP_COMPLETO.md (leer TODO)
2. scripts/init-git.sh (ejecutar)
3. Crear repo en GitHub
4. scripts/setup-github.sh (ejecutar)
5. DEPLOYMENT.md (seguir paso 2 en adelante)
```

### Escenario 2: "Sé Git pero primera vez con VPS/Docker"
```
1. DEPLOYMENT.md (completo)
2. GIT_WORKFLOW.md (referencia)
```

### Escenario 3: "Solo quiero desarrollo local"
```
1. QUICK_START.md
2. GIT_WORKFLOW.md (si vas a contribuir)
```

### Escenario 4: "Quiero entender la arquitectura"
```
1. README.md (overview)
2. ARCHITECTURE.md (detalles)
3. SECURITY.md (seguridad)
```

---

## 🔍 Búsqueda Rápida

### ¿Cómo hago...?

- **Instalar localmente**: [QUICK_START.md](./QUICK_START.md#-setup-local-development)
- **Hacer deploy**: [DEPLOYMENT.md](./DEPLOYMENT.md#-setup-inicial)
- **Crear nueva feature**: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md#1%EF%B8%8F%E2%83%A3-empezar-nueva-feature)
- **Resolver conflictos Git**: [GIT_WORKFLOW.md](./GIT_WORKFLOW.md#-resolver-conflictos)
- **Ver logs en producción**: [DEPLOYMENT.md](./DEPLOYMENT.md#-monitoring-y-health-checks)
- **Agregar variables de entorno**: [DEPLOYMENT.md](./DEPLOYMENT.md#2-configurar-variables-de-entorno)
- **Hacer rollback**: [DEPLOYMENT.md](./DEPLOYMENT.md#-comandos-docker-tiles)

---

## 📞 Soporte y Comunidad

- 🐛 **Bug reports**: [GitHub Issues](../../issues)
- 💡 **Feature requests**: [GitHub Issues](../../issues)
- 📧 **Email**: soporte@atonixdev.com
- 🌐 **Website**: https://atonixdev.com

---

## 🎯 Stack Tecnológico

Para referencia rápida:

```
Frontend:
├── Next.js 14.2 (React 18)
├── TypeScript 5.2
├── Tailwind CSS 3.3
└── Radix UI + Shadcn

Backend:
├── Next.js API Routes
├── NextAuth.js
├── Prisma 6.7
└── PostgreSQL

Infrastructure:
├── Docker + Docker Compose
├── Coolify (PaaS)
└── n8n (automation)

DevOps:
├── Git (main/dev branches)
├── GitHub
└── Automated deployments
```

---

## 📊 Estado del Proyecto

- **Versión**: 1.0.0
- **Estado**: Production Ready ✅
- **Última actualización**: Diciembre 2024
- **Mantenedor**: atonixdev.com

---

## 🗺️ Roadmap

Ver [README.md - Roadmap](./README.md#-roadmap) para features planeadas.

---

**Tip:** Marca esta página como favorito para acceso rápido a la documentación.
