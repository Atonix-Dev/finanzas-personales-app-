
# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Finanzas Personales App! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

---

## 📜 Código de Conducta

Este proyecto y todos los participantes están regidos por nuestro Código de Conducta. Al participar, se espera que mantengas este código. Por favor, reporta comportamientos inaceptables a [tu-email@ejemplo.com].

### Nuestros Valores

- **Respeto**: Trata a todos con respeto y consideración
- **Colaboración**: Trabaja en conjunto para mejorar el proyecto
- **Apertura**: Sé abierto a nuevas ideas y perspectivas
- **Profesionalismo**: Mantén un nivel profesional en todas las interacciones

---

## 🎯 ¿Cómo Puedo Contribuir?

### Reportar Bugs

Los bugs se rastrean como [GitHub Issues](../../issues). Crea un issue y proporciona la siguiente información:

- **Título claro y descriptivo**
- **Descripción detallada** del problema
- **Pasos para reproducir** el bug
- **Comportamiento esperado** vs **comportamiento actual**
- **Screenshots** si es aplicable
- **Entorno** (OS, navegador, versión de Node, etc.)

### Sugerir Mejoras

Las sugerencias de mejoras también se rastrean como [GitHub Issues](../../issues). Al crear una sugerencia:

- **Usa un título claro y descriptivo**
- **Proporciona una descripción detallada** de la mejora
- **Explica por qué** sería útil
- **Incluye ejemplos** de cómo funcionaría

### Tu Primera Contribución

¿No estás seguro de por dónde empezar? Busca issues etiquetados como:

- `good first issue` - Issues perfectos para principiantes
- `help wanted` - Issues que necesitan ayuda
- `documentation` - Mejoras en la documentación

---

## 🔧 Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/TU-USUARIO/finanzas-personales-app.git
cd finanzas-personales-app
```

### 2. Instalar Dependencias

```bash
cd nextjs_space
yarn install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 4. Configurar la Base de Datos

```bash
yarn prisma migrate deploy
yarn prisma generate
yarn prisma db seed  # Datos de ejemplo
```

### 5. Iniciar el Servidor de Desarrollo

```bash
yarn dev
```

---

## 💻 Proceso de Desarrollo

### 1. Crear una Branch

Crea una branch desde `main` para tu trabajo:

```bash
git checkout -b tipo/descripcion-corta
```

**Tipos de branches**:
- `feature/` - Nuevas funcionalidades
- `fix/` - Correcciones de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Agregar o mejorar tests

**Ejemplos**:
```bash
git checkout -b feature/agregar-exportacion-pdf
git checkout -b fix/corregir-calculo-balance
git checkout -b docs/mejorar-readme
```

### 2. Hacer Cambios

- Escribe código limpio y bien documentado
- Sigue los [Estándares de Código](#estándares-de-código)
- Agrega tests si es aplicable
- Actualiza la documentación si es necesario

### 3. Commit de Cambios

Usa mensajes de commit descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "tipo: descripción corta

Descripción más detallada si es necesario.

Fixes #123"
```

**Tipos de commits**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan el código)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos**:
```bash
git commit -m "feat: agregar exportación de transacciones a PDF"
git commit -m "fix: corregir cálculo de balance en dashboard"
git commit -m "docs: actualizar guía de instalación"
```

### 4. Push a tu Fork

```bash
git push origin tu-branch
```

---

## 📏 Estándares de Código

### TypeScript

- **TypeScript Strict Mode** habilitado
- Tipos explícitos para parámetros y retornos de funciones
- No usar `any`, usar `unknown` o tipos específicos
- Interfaces para props de componentes

```typescript
// ✅ Bueno
interface UserProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  // ...
}

// ❌ Malo
export function UserProfile({ user, onUpdate }: any) {
  // ...
}
```

### React

- Componentes funcionales con hooks
- Props destructuring
- Event handlers con prefijo `handle`
- Nombres descriptivos para componentes y variables

```typescript
// ✅ Bueno
export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const handleDeleteClick = (id: string) => {
    onDelete(id);
  };

  return (
    <ul>
      {transactions.map(transaction => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDelete={handleDeleteClick}
        />
      ))}
    </ul>
  );
}

// ❌ Malo
export function List({ data, del }: any) {
  return (
    <ul>
      {data.map((d: any) => (
        <Item key={d.id} data={d} onClick={() => del(d.id)} />
      ))}
    </ul>
  );
}
```

### Styling

- Tailwind CSS para estilos
- Componentes de Radix UI para accesibilidad
- Responsive design por defecto
- Dark mode support

```tsx
// ✅ Bueno
<div className="flex flex-col gap-4 p-4 rounded-lg bg-card text-card-foreground md:flex-row md:gap-6">
  <h2 className="text-2xl font-bold">Título</h2>
</div>

// ❌ Malo
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '24px' }}>Título</h2>
</div>
```

### Naming Conventions

- **Componentes**: PascalCase
- **Funciones**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Archivos**: kebab-case

```
✅ Bueno:
- TransactionCard.tsx
- use-transactions.ts
- transaction-utils.ts

❌ Malo:
- transactionCard.tsx
- useTransactions.ts
- TransactionUtils.ts
```

### Imports

Organiza imports en este orden:

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// 2. Internal libraries
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// 3. Components
import { Button } from '@/components/ui/button';
import { TransactionCard } from '@/components/transactions/transaction-card';

// 4. Types
import type { Transaction } from '@/lib/types';

// 5. Styles
import './styles.css';
```

### Comentarios

- Escribe código auto-documentado cuando sea posible
- Usa JSDoc para funciones complejas
- Comenta el "por qué", no el "qué"

```typescript
// ✅ Bueno
/**
 * Calcula el balance total sumando ingresos y restando gastos.
 * Usa reduce para optimizar el cálculo en una sola pasada.
 */
function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, transaction) => {
    return transaction.type === 'INCOME'
      ? balance + transaction.amount
      : balance - transaction.amount;
  }, 0);
}

// ❌ Malo
// Esta función calcula el balance
function calculateBalance(transactions: Transaction[]): number {
  // Inicializar balance en 0
  let balance = 0;
  // Loop por cada transacción
  for (const transaction of transactions) {
    // Si es ingreso, sumar
    if (transaction.type === 'INCOME') {
      balance += transaction.amount;
    } else {
      // Si no, restar
      balance -= transaction.amount;
    }
  }
  // Retornar el balance
  return balance;
}
```

### Linting y Formatting

Ejecuta antes de hacer commit:

```bash
# Linting
yarn lint

# Formateo
yarn format

# Type checking
yarn type-check
```

---

## 🔄 Proceso de Pull Request

### 1. Actualiza tu Branch

Antes de crear el PR, asegúrate de que tu branch esté actualizada:

```bash
git checkout main
git pull upstream main
git checkout tu-branch
git rebase main
```

### 2. Crea el Pull Request

- Usa un título claro y descriptivo
- Describe los cambios realizados
- Referencia issues relacionados
- Incluye screenshots si hay cambios visuales
- Marca como "Draft" si aún no está listo

### Plantilla de PR

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha Probado?
Describe las pruebas que realizaste.

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado áreas difíciles de entender
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix o feature
- [ ] Tests unitarios nuevos y existentes pasan localmente

## Screenshots (si aplica)
Agregar capturas de pantalla

## Issues Relacionados
Fixes #123
```

### 3. Revisión de Código

- Responde a comentarios de manera constructiva
- Haz cambios solicitados
- Marca conversaciones como resueltas
- Solicita re-revisión después de cambios

### 4. Merge

Una vez aprobado:
- El maintainer hará merge del PR
- Tu branch será eliminada automáticamente

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Verifica** que no sea un issue duplicado
2. **Actualiza** a la última versión
3. **Reproduce** el bug de manera consistente

### Template de Bug Report

```markdown
## Descripción del Bug
Descripción clara y concisa del bug.

## Pasos para Reproducir
1. Ir a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento Esperado
Descripción de lo que esperabas que pasara.

## Comportamiento Actual
Descripción de lo que realmente pasó.

## Screenshots
Si aplica, agregar screenshots.

## Entorno
- OS: [e.g. macOS 13.0]
- Browser: [e.g. Chrome 120]
- Node Version: [e.g. 18.17.0]
- Version: [e.g. 1.0.0]

## Información Adicional
Cualquier otra información relevante.
```

---

## ✨ Sugerir Mejoras

### Template de Feature Request

```markdown
## Descripción de la Mejora
Descripción clara y concisa de la mejora.

## Motivación
¿Por qué es necesaria esta mejora?

## Solución Propuesta
Descripción de cómo debería funcionar.

## Alternativas Consideradas
Otras soluciones que consideraste.

## Información Adicional
Mockups, ejemplos, referencias, etc.
```

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- [README.md](./README.md) - Información general
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del proyecto
- [SECURITY.md](./nextjs_space/SECURITY.md) - Medidas de seguridad

### Recursos Externos

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Guides](https://www.prisma.io/docs)

---

## 🙋‍♂️ ¿Necesitas Ayuda?

Si tienes preguntas sobre cómo contribuir:

1. Revisa la [documentación](#recursos-adicionales)
2. Busca en [issues existentes](../../issues)
3. Abre un [nuevo issue](../../issues/new) con tu pregunta
4. Contacta a [tu-email@ejemplo.com]

---

## 🎉 ¡Gracias!

Gracias por tomarte el tiempo de contribuir. ¡Cada contribución hace que este proyecto sea mejor!

---

**¿Listo para contribuir? ¡Excelente! 🚀**
