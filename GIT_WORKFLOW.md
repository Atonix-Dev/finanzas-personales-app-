# 🌳 Git Workflow - atonixdev.com Projects

Esta guía explica cómo trabajar con Git y branches en los proyectos de atonixdev.com

---

## 📊 Estructura de Branches

```
┌─────────────────────────────────────────────┐
│  main (producción)                          │
│  → finanzas.atonixdev.com                   │
│  → Solo código estable y testeado           │
└──────────────┬──────────────────────────────┘
               │ merge cuando todo funciona
┌──────────────▼──────────────────────────────┐
│  dev (desarrollo/testing)                   │
│  → projects.atonixdev.com/finanzas          │
│  → Integración y testing                    │
└──────────────┬──────────────────────────────┘
               │ merge de features
┌──────────────▼──────────────────────────────┐
│  feature/* (desarrollo de features)         │
│  → Local development                        │
│  → feature/nueva-cosa                       │
│  → feature/fix-bug                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  hotfix/* (arreglos urgentes)               │
│  → hotfix/critical-security-issue           │
│  → Merge directo a main + dev               │
└─────────────────────────────────────────────┘
```

---

## 🚀 Workflow Completo

### 1️⃣ Empezar Nueva Feature

```bash
# Asegúrate de tener dev actualizado
git checkout dev
git pull origin dev

# Crear nueva branch
git checkout -b feature/nombre-descriptivo

# Ejemplos:
git checkout -b feature/add-notifications
git checkout -b feature/improve-dashboard
git checkout -b feature/export-pdf
```

**Convención de nombres:**
- `feature/` - Nuevas funcionalidades
- `fix/` - Bug fixes no urgentes
- `refactor/` - Refactorizaciones
- `docs/` - Solo documentación
- `hotfix/` - Arreglos críticos urgentes

---

### 2️⃣ Desarrollar Localmente

```bash
# Hacer cambios en el código
# Probar localmente: yarn dev

# Ver cambios
git status
git diff

# Agregar archivos
git add .
# O selectivamente:
git add archivo1.ts archivo2.tsx

# Commit con mensaje descriptivo
git commit -m "feat: agregar sistema de notificaciones"
```

**Convenciones de commits (Conventional Commits):**
```
feat: nueva funcionalidad
fix: arreglo de bug
refactor: refactorización de código
docs: cambios en documentación
style: cambios de formato (no afectan código)
test: agregar o modificar tests
chore: tareas de mantenimiento
perf: mejoras de performance
```

**Ejemplos:**
```bash
git commit -m "feat: add email notifications system"
git commit -m "fix: resolve authentication bug"
git commit -m "refactor: simplify transaction logic"
git commit -m "docs: update deployment guide"
```

---

### 3️⃣ Push y Merge a Dev (Testing)

```bash
# Push tu feature branch
git push origin feature/nombre-descriptivo

# Cambiar a dev
git checkout dev
git pull origin dev

# Merge tu feature
git merge feature/nombre-descriptivo

# Resolver conflictos si existen
# Luego:
git push origin dev
```

**🎯 Auto-deploy a projects.atonixdev.com/finanzas**

---

### 4️⃣ Testing en Dev Environment

```bash
# Una vez pusheado a dev, Coolify hace auto-deploy

# Probar en:
https://projects.atonixdev.com/finanzas

# Verificar:
✅ Funciona correctamente
✅ No hay errores en consola
✅ Performance ok
✅ Mobile responsive
✅ No rompe nada existente
```

---

### 5️⃣ Deploy a Producción

```bash
# Solo cuando dev esté completamente testeado

git checkout main
git pull origin main

# Merge desde dev
git merge dev

# Si hay conflictos, resolverlos cuidadosamente

# Push a producción
git push origin main
```

**🚀 Auto-deploy a finanzas.atonixdev.com**

---

## 🔥 Hotfixes (Urgentes)

Para bugs críticos en producción:

```bash
# Crear desde main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-description

# Fix rápido
# ... hacer cambios ...

git add .
git commit -m "hotfix: resolve critical security issue"

# Push
git push origin hotfix/critical-bug-description

# Merge a main (producción)
git checkout main
git merge hotfix/critical-bug-description
git push origin main

# También merge a dev
git checkout dev
git merge hotfix/critical-bug-description
git push origin dev

# Borrar branch
git branch -d hotfix/critical-bug-description
git push origin --delete hotfix/critical-bug-description
```

---

## 🧹 Limpieza de Branches

```bash
# Ver todas las branches
git branch -a

# Borrar branch local (después de merge)
git branch -d feature/nombre

# Borrar branch remota
git push origin --delete feature/nombre

# Limpiar branches remotas borradas
git fetch --prune
```

---

## ⚡ Comandos Útiles

### Ver historial:
```bash
# Log bonito
git log --oneline --graph --all --decorate

# Últimos 10 commits
git log -10 --oneline

# Ver cambios de un commit
git show <commit-hash>
```

### Deshacer cambios:
```bash
# Descartar cambios locales no commiteados
git checkout -- archivo.ts

# Descartar todos los cambios
git reset --hard HEAD

# Revertir último commit (crea nuevo commit)
git revert HEAD

# Volver a commit anterior (cuidado!)
git reset --hard <commit-hash>
```

### Stash (guardar cambios temporalmente):
```bash
# Guardar cambios sin commit
git stash

# Ver stash list
git stash list

# Recuperar cambios
git stash pop

# Aplicar sin borrar del stash
git stash apply
```

### Cherry-pick (aplicar commit específico):
```bash
# Aplicar un commit de otra branch
git cherry-pick <commit-hash>
```

---

## 🔍 Resolver Conflictos

Cuando hay conflictos en merge:

```bash
# Git te mostrará algo como:
<<<<<<< HEAD
código de tu branch actual
=======
código de la branch que estás mergeando
>>>>>>> feature/otra-branch

# Pasos:
1. Abrir archivo con conflicto
2. Decidir qué código mantener
3. Borrar los markers (<<<, ===, >>>)
4. Guardar el archivo
5. git add archivo-resuelto.ts
6. git commit -m "merge: resolve conflicts"
```

---

## 📝 Checklist antes de Push

Antes de hacer push, verificar:

- [ ] Código compila sin errores: `yarn build`
- [ ] Lint pass: `yarn lint`
- [ ] Tests pass (cuando existan)
- [ ] Probado localmente
- [ ] Commit messages descriptivos
- [ ] No hay archivos temporales/debug
- [ ] `.env` no está incluido
- [ ] Código formateado consistentemente

---

## 🎯 Tips y Best Practices

### Commits pequeños y frecuentes:
✅ **Bueno:**
```bash
git commit -m "feat: add email input validation"
git commit -m "feat: add email service integration"
git commit -m "feat: add email notification templates"
```

❌ **Malo:**
```bash
git commit -m "add all email stuff"
```

### Mensajes descriptivos:
✅ **Bueno:**
```bash
git commit -m "fix: resolve transaction sorting bug in dashboard"
```

❌ **Malo:**
```bash
git commit -m "fix bug"
git commit -m "changes"
git commit -m "wip"
```

### Pull antes de push:
```bash
# Siempre pull antes de push
git pull origin dev
git push origin dev
```

### No forzar pushes:
```bash
# ❌ Nunca hacer (a menos que sepas lo que haces)
git push --force

# ✅ Si es necesario, usar:
git push --force-with-lease
```

---

## 🆘 Ayuda Rápida

### "Olvidé en qué branch estoy":
```bash
git branch
# La actual tiene asterisco *
```

### "Tengo cambios pero quiero cambiar de branch":
```bash
git stash
git checkout otra-branch
# Luego vuelve y recupera:
git checkout tu-branch
git stash pop
```

### "Hice commit en la branch equivocada":
```bash
# Si no has pusheado:
git reset HEAD~1  # Deshace último commit
git stash         # Guarda cambios
git checkout branch-correcta
git stash pop
git commit -m "mensaje"
```

### "Quiero ver qué cambió entre branches":
```bash
git diff main..dev
```

---

## 📚 Recursos

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Book](https://git-scm.com/book/en/v2)
- [Atlassian Git Tutorial](https://www.atlassian.com/git/tutorials)

---

**Última actualización:** Diciembre 2024
