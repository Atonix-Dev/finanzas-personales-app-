
# 💰 Finanzas Personales App

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

**Una aplicación moderna y segura de gestión de finanzas personales construida con las mejores prácticas de desarrollo**

[🚀 Demo](#) · [📖 Documentación](#características-principales) · [🐛 Reportar Bug](../../issues) · [✨ Solicitar Feature](../../issues)

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Arquitectura](#arquitectura)
- [Seguridad](#seguridad)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Internacionalización](#internacionalización)
- [Mejores Prácticas Implementadas](#mejores-prácticas-implementadas)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## 🎯 Sobre el Proyecto

**Finanzas Personales App** es una aplicación web full-stack diseñada para ayudar a los usuarios a gestionar sus finanzas personales de manera eficiente y segura. La aplicación permite realizar un seguimiento completo de transacciones, presupuestos, cuentas y proporciona análisis inteligentes con IA para mejorar los hábitos de ahorro.

### ✨ ¿Por qué este proyecto?

- **Seguridad Primero**: Implementación de múltiples capas de seguridad incluyendo rate limiting, validación de datos, sanitización de inputs y auditoría de acciones.
- **UX/UI Moderna**: Interfaz responsive y accesible construida con Radix UI y Tailwind CSS.
- **Código Limpio**: Siguiendo principios SOLID, clean code y mejores prácticas de TypeScript.
- **Escalabilidad**: Arquitectura modular preparada para crecer con las necesidades del negocio.
- **Internacionalización**: Soporte multi-idioma (ES/EN) y multi-moneda (EUR/USD).

---

## 🚀 Características Principales

### 👤 Autenticación y Seguridad

- ✅ Sistema de autenticación completo con NextAuth.js
- ✅ Hashing de contraseñas con bcrypt
- ✅ Rate limiting en endpoints críticos
- ✅ Validación y sanitización de inputs con Zod
- ✅ Auditoría completa de acciones del usuario
- ✅ Tokens JWT seguros con rotación

### 💳 Gestión de Transacciones

- ✅ CRUD completo de transacciones (ingresos/gastos)
- ✅ Categorías predefinidas personalizables
- ✅ Soporte para múltiples cuentas
- ✅ Adjuntar notas y recibos a transacciones
- ✅ Filtrado avanzado por fecha, categoría y tipo
- ✅ Exportación de datos a CSV

### 📊 Presupuestos y Alertas

- ✅ Creación de presupuestos por categoría
- ✅ Alertas automáticas al alcanzar umbrales (50%, 80%, 100%)
- ✅ Visualización del progreso en tiempo real
- ✅ Notificaciones in-app y por email

### 📈 Dashboard y Análisis

- ✅ Gráficos interactivos de ingresos vs gastos
- ✅ Distribución de gastos por categoría
- ✅ Evolución temporal de balance
- ✅ KPIs principales (balance, gastos mensuales, ahorros)
- ✅ Análisis de tendencias

### 🤖 Asistente de IA

- ✅ Análisis inteligente de patrones de gasto
- ✅ Recomendaciones personalizadas de ahorro
- ✅ Identificación de gastos innecesarios
- ✅ Insights sobre hábitos financieros

### 🎨 Experiencia de Usuario

- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Tema claro/oscuro
- ✅ Animaciones suaves con Framer Motion
- ✅ Feedback visual con confetti en acciones exitosas
- ✅ Toasts informativos y alerts personalizados
- ✅ Navegación intuitiva con sidebar colapsable

### 🌍 Configuración Personal

- ✅ Selección de idioma (Español/Inglés)
- ✅ Selección de moneda (EUR/USD)
- ✅ Preferencias de notificaciones
- ✅ Gestión de perfil

---

## 🛠 Tecnologías Utilizadas

### Frontend

- **[Next.js 14.2](https://nextjs.org/)** - Framework React con App Router
- **[React 18.2](https://react.dev/)** - Librería de UI
- **[TypeScript 5.2](https://www.typescriptlang.org/)** - Tipado estático
- **[Tailwind CSS 3.3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Componentes accesibles y sin estilos
- **[Shadcn/ui](https://ui.shadcn.com/)** - Componentes reutilizables
- **[Framer Motion](https://www.framer.com/motion/)** - Animaciones
- **[Recharts](https://recharts.org/)** - Gráficos interactivos
- **[React Hook Form](https://react-hook-form.com/)** - Gestión de formularios
- **[Zod](https://zod.dev/)** - Validación de esquemas

### Backend

- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Endpoints serverless
- **[NextAuth.js](https://next-auth.js.org/)** - Autenticación
- **[Prisma 6.7](https://www.prisma.io/)** - ORM para PostgreSQL
- **[PostgreSQL](https://www.postgresql.org/)** - Base de datos relacional
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Hashing de contraseñas
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT tokens

### Herramientas de Desarrollo

- **[ESLint](https://eslint.org/)** - Linter
- **[Prettier](https://prettier.io/)** - Formateador de código
- **[Yarn](https://yarnpkg.com/)** - Gestor de paquetes

---

## 🏗 Arquitectura

La aplicación sigue una **arquitectura modular en capas** con separación clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│           Presentación (UI)              │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │Components│  │  Pages   │  │ Layouts││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Lógica de Negocio (Hooks)        │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  Hooks   │  │ Contexts │  │ Utils  ││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         API Layer (Next.js API)         │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │  Routes  │  │Middleware│  │Security││
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Datos (Prisma + PostgreSQL)       │
│  ┌──────────┐  ┌──────────┐            │
│  │  Schema  │  │Migrations│            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

### Principios de Diseño

#### SOLID

- **S**ingle Responsibility: Cada componente tiene una única responsabilidad
- **O**pen/Closed: Componentes extensibles sin modificación
- **L**iskov Substitution: Uso correcto de composición y herencia
- **I**nterface Segregation: Interfaces específicas y enfocadas
- **D**ependency Inversion: Dependencias a través de abstracciones

#### Patrones Implementados

- **Container/Presenter Pattern**: Separación de lógica y presentación
- **Custom Hooks**: Lógica reutilizable encapsulada
- **Context API**: Gestión de estado global
- **Repository Pattern**: Abstracción de acceso a datos
- **Middleware Pattern**: Procesamiento de requests en capas

Para más detalles, consulta [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🔒 Seguridad

La seguridad es una prioridad fundamental. Implementamos múltiples capas de protección:

### Autenticación y Autorización

```typescript
✅ JWT con rotación automática
✅ Sesiones seguras con NextAuth.js
✅ Hashing de contraseñas con bcrypt (10 rounds)
✅ Validación de tokens en cada request
```

### Protección de Datos

```typescript
✅ Validación de inputs con Zod schemas
✅ Sanitización de datos antes de guardar
✅ Encriptación de datos sensibles
✅ SQL Injection protection con Prisma
```

### Rate Limiting

```typescript
✅ Login: 5 intentos / 15 minutos
✅ Signup: 3 intentos / hora
✅ API general: 100 requests / 15 minutos
```

### Auditoría

```typescript
✅ Registro de todas las acciones críticas
✅ Tracking de IPs y user agents
✅ Logs de cambios en datos sensibles
✅ Monitoreo de intentos fallidos
```

Para más información, consulta [SECURITY.md](./nextjs_space/SECURITY.md).

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **Yarn** >= 1.22.0
- **PostgreSQL** >= 14.0
- **Git**

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/finanzas-personales-app.git
cd finanzas-personales-app
```

### 2. Instalar dependencias

```bash
cd nextjs_space
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `nextjs_space`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales (ver sección [Configuración](#configuración)).

### 4. Configurar la base de datos

```bash
# Ejecutar migraciones
yarn prisma migrate deploy

# Generar el cliente de Prisma
yarn prisma generate

# (Opcional) Poblar con datos de ejemplo
yarn prisma db seed
```

### 5. Iniciar el servidor de desarrollo

```bash
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en `nextjs_space/` con las siguientes variables:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/finanzas_db?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-key-super-segura-aqui"

# (Opcional) Email para notificaciones
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-app-password"
SMTP_FROM="noreply@finanzasapp.com"

# (Opcional) API de IA para análisis
OPENAI_API_KEY="sk-..."
```

### Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 📘 Uso

### Crear una cuenta

1. Accede a `http://localhost:3000`
2. Haz clic en "Crear Cuenta"
3. Completa el formulario de registro
4. Se creará automáticamente una cuenta con datos de demostración

### Dashboard Principal

El dashboard muestra:

- **Balance actual** de todas tus cuentas
- **Gráfico de ingresos vs gastos** del mes actual
- **Distribución de gastos** por categoría
- **Presupuestos activos** con progreso visual
- **Transacciones recientes**

### Gestionar Transacciones

1. Ve a "Transacciones" en el menú lateral
2. Haz clic en "+ Nueva Transacción"
3. Completa el formulario:
   - Tipo (Ingreso/Gasto)
   - Cantidad
   - Categoría
   - Cuenta
   - Descripción (opcional)
4. Guarda la transacción

### Crear Presupuestos

1. Ve a "Presupuestos"
2. Haz clic en "+ Nuevo Presupuesto"
3. Selecciona:
   - Categoría
   - Límite de gasto
   - Período (mes/año)
4. Recibe alertas automáticas al alcanzar umbrales

### Análisis con IA

1. Ve a "Análisis"
2. Haz clic en "Generar Análisis"
3. La IA analizará tus patrones de gasto y generará:
   - Recomendaciones personalizadas
   - Identificación de gastos innecesarios
   - Sugerencias de ahorro
   - Insights sobre hábitos financieros

---

## 📁 Estructura del Proyecto

```
finanzas_personales_app/
├── nextjs_space/
│   ├── app/                        # App Router de Next.js
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/              # Endpoints de autenticación
│   │   │   ├── transactions/      # CRUD de transacciones
│   │   │   ├── budgets/           # CRUD de presupuestos
│   │   │   ├── accounts/          # CRUD de cuentas
│   │   │   ├── categories/        # Gestión de categorías
│   │   │   ├── analysis/          # Análisis con IA
│   │   │   └── settings/          # Configuración de usuario
│   │   ├── dashboard/             # Página principal
│   │   ├── auth/                  # Páginas de login/registro
│   │   ├── globals.css            # Estilos globales
│   │   ├── layout.tsx             # Layout principal
│   │   └── page.tsx               # Página de inicio
│   │
│   ├── components/                 # Componentes React
│   │   ├── ui/                    # Componentes base (Shadcn)
│   │   ├── dashboard/             # Componentes del dashboard
│   │   ├── transactions/          # Componentes de transacciones
│   │   ├── budgets/               # Componentes de presupuestos
│   │   ├── accounts/              # Componentes de cuentas
│   │   ├── analysis/              # Componentes de análisis
│   │   ├── settings/              # Componentes de configuración
│   │   └── auth-layout.tsx        # Layout de autenticación
│   │
│   ├── lib/                        # Utilidades y configuración
│   │   ├── db.ts                  # Cliente de Prisma
│   │   ├── utils.ts               # Funciones auxiliares
│   │   ├── types.ts               # Tipos TypeScript
│   │   ├── security/              # Módulos de seguridad
│   │   │   ├── rate-limit.ts      # Rate limiting
│   │   │   ├── validation.ts      # Validación con Zod
│   │   │   ├── sanitization.ts    # Sanitización de inputs
│   │   │   └── audit.ts           # Sistema de auditoría
│   │   └── i18n/                  # Internacionalización
│   │       ├── context.tsx        # Context de idioma
│   │       ├── translations.ts    # Traducciones
│   │       └── currencies.ts      # Configuración de monedas
│   │
│   ├── hooks/                      # Custom Hooks
│   │   ├── use-toast.ts           # Hook de notificaciones
│   │   └── use-confetti.ts        # Hook de confetti
│   │
│   ├── prisma/                     # Prisma ORM
│   │   ├── schema.prisma          # Esquema de la base de datos
│   │   └── migrations/            # Migraciones
│   │
│   ├── scripts/                    # Scripts de utilidad
│   │   ├── seed.ts                # Datos de ejemplo
│   │   └── clean-duplicate-categories.ts
│   │
│   ├── public/                     # Archivos estáticos
│   │
│   ├── .env                        # Variables de entorno
│   ├── next.config.js             # Configuración de Next.js
│   ├── tailwind.config.ts         # Configuración de Tailwind
│   ├── tsconfig.json              # Configuración de TypeScript
│   └── package.json               # Dependencias
│
├── README.md                       # Este archivo
├── ARCHITECTURE.md                 # Documentación de arquitectura
└── CONTRIBUTING.md                 # Guía de contribución
```

---

## 🎯 Scripts Disponibles

```bash
# Desarrollo
yarn dev                    # Inicia servidor de desarrollo
yarn build                  # Construye para producción
yarn start                  # Inicia servidor de producción
yarn lint                   # Ejecuta ESLint

# Base de datos
yarn prisma generate        # Genera cliente de Prisma
yarn prisma migrate dev     # Crea y aplica migración
yarn prisma migrate deploy  # Aplica migraciones en producción
yarn prisma studio          # Abre Prisma Studio
yarn prisma db seed         # Ejecuta seed de datos

# Utilidades
yarn format                 # Formatea código con Prettier
yarn type-check            # Verifica tipos de TypeScript
```

---

## 🌍 Internacionalización

La aplicación soporta múltiples idiomas y monedas:

### Idiomas Disponibles

- 🇪🇸 **Español (es)** - Idioma por defecto
- 🇬🇧 **English (en)**

### Monedas Disponibles

- **EUR (€)** - Euro
- **USD ($)** - Dólar estadounidense

### Cambiar Idioma/Moneda

1. Ve a "Configuración" en el menú
2. Selecciona tu idioma preferido
3. Selecciona tu moneda preferida
4. Los cambios se aplican instantáneamente

### Agregar Nuevos Idiomas

1. Edita `lib/i18n/translations.ts`
2. Añade las traducciones para el nuevo idioma
3. Actualiza el tipo `Language` en `lib/types.ts`

---

## ✅ Mejores Prácticas Implementadas

### Código

- ✅ **TypeScript Strict Mode** habilitado
- ✅ **ESLint** con reglas estrictas
- ✅ **Prettier** para formateo consistente
- ✅ **Convenciones de nomenclatura** consistentes
- ✅ **Comentarios JSDoc** en funciones complejas
- ✅ **Separación de concerns** en componentes
- ✅ **Custom Hooks** para lógica reutilizable
- ✅ **Error boundaries** para manejo de errores
- ✅ **Loading states** en todas las operaciones async

### Seguridad

- ✅ **Validación de inputs** en cliente y servidor
- ✅ **Sanitización de datos** antes de guardar
- ✅ **Rate limiting** en endpoints críticos
- ✅ **HTTPS** en producción
- ✅ **Secrets** nunca en el código
- ✅ **Auditoría** de acciones críticas
- ✅ **SQL Injection** protection con Prisma

### Performance

- ✅ **Server Components** por defecto
- ✅ **Client Components** solo cuando necesario
- ✅ **Lazy loading** de componentes pesados
- ✅ **Optimización de imágenes** con Next/Image
- ✅ **Memoización** de cálculos costosos
- ✅ **Debouncing** en inputs de búsqueda
- ✅ **Caching** de datos con SWR

### UX/UI

- ✅ **Responsive design** (móvil, tablet, desktop)
- ✅ **Loading skeletons** durante carga de datos
- ✅ **Toasts informativos** para feedback
- ✅ **Confirmaciones** en acciones destructivas
- ✅ **Animaciones suaves** con Framer Motion
- ✅ **Accesibilidad** con Radix UI
- ✅ **Dark mode** automático

### Testing

- ✅ **Validación de tipos** con TypeScript
- ✅ **Linting** con ESLint
- ✅ **Formateo** con Prettier
- ✅ **Validación de schemas** con Zod

---

## 🗺 Roadmap

### Versión 2.0

- [ ] Tests unitarios con Jest
- [ ] Tests E2E con Playwright
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push
- [ ] Exportación de reportes en PDF
- [ ] Integración con bancos (PSD2)
- [ ] Gráficos más avanzados
- [ ] Objetivos de ahorro
- [ ] Recordatorios de pagos
- [ ] Modo offline

### Versión 3.0

- [ ] App móvil nativa (React Native)
- [ ] Análisis predictivo con ML
- [ ] Recomendaciones de inversión
- [ ] Marketplace de categorías
- [ ] Integraciones con servicios externos
- [ ] Multi-tenant para familias

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, lee [CONTRIBUTING.md](./CONTRIBUTING.md) para conocer los detalles sobre nuestro código de conducta y el proceso para enviarnos pull requests.

### Pasos para Contribuir

1. Fork el proyecto
2. Crea tu Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la Branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](./LICENSE) para más detalles.

---

## 👨‍💻 Autor

**atonixdev.com**

- GitHub: [@Atonix-Dev](https://github.com/Atonix-Dev)
- Website: [atonixdev.com](https://atonixdev.com)
- Email: dev@atonixdev.com

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework increíble
- [Vercel](https://vercel.com/) - Hosting y deployment
- [Radix UI](https://www.radix-ui.com/) - Componentes accesibles
- [Shadcn](https://ui.shadcn.com/) - Librería de componentes
- [Prisma](https://www.prisma.io/) - ORM moderno

---

<div align="center">

**⭐ Si este proyecto te ha sido útil, por favor considera darle una estrella ⭐**

</div>
