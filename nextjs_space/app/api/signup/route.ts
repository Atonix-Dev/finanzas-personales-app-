
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRateLimitIdentifier, rateLimitConfigs } from '@/lib/security/rate-limiter'
import { emailSchema, passwordSchema, nameSchema, validateAndSanitize, formatValidationError } from '@/lib/security/validation'
import { logAudit, getRequestMetadata } from '@/lib/security/audit'
import { z } from 'zod'

// Schema de validación para signup
const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  loadDemoData: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting para prevenir ataques
    const rateLimitId = getRateLimitIdentifier(request, 'signup')
    const rateLimit = checkRateLimit(rateLimitId, rateLimitConfigs.auth)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Por favor, intenta de nuevo más tarde.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          }
        }
      )
    }

    const body = await request.json()

    // Validar y sanitizar datos
    const validated = validateAndSanitize(signupSchema, body)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 })
    }

    // Hash de la contraseña con salt alto para mayor seguridad
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        password_hash: hashedPassword,
        name: validated.firstName && validated.lastName 
          ? `${validated.firstName} ${validated.lastName}` 
          : validated.firstName || null,
      }
    })

    // Crear configuración por defecto
    await prisma.userSettings.create({
      data: {
        user_id: user.id,
        language: 'es',
        currency: 'EUR',
      }
    })

    // Registrar auditoría
    const metadata = getRequestMetadata(request)
    await logAudit({
      userId: user.id,
      action: 'signup',
      ipAddress: metadata.ip,
      userAgent: metadata.userAgent,
    })

    // Crear categorías predefinidas solo si no existen
    const predefinedCategories = [
      'Supermercado', 'Transporte', 'Vivienda', 'Suministros', 
      'Ocio y entretenimiento', 'Restaurantes y bares', 'Salud y farmacia',
      'Educación', 'Ropa y calzado', 'Tecnología', 'Suscripciones', 
      'Gastos fijos', 'Familia', 'Otros gastos', 'Salario', 'Otros ingresos'
    ]

    // Verificar cuáles categorías ya existen
    for (const categoryName of predefinedCategories) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: categoryName,
          is_predefined: true,
          user_id: null
        }
      })

      // Solo crear si no existe
      if (!existingCategory) {
        await prisma.category.create({
          data: {
            name: categoryName,
            is_predefined: true,
            user_id: null
          }
        })
      }
    }

    // Si solicita datos de demostración, cargarlos
    if (validated.loadDemoData) {
      await loadUserDemoData(user.id)
    }

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: { id: user.id, email: user.email, name: user.name }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: formatValidationError(error) },
        { status: 400 }
      )
    }

    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

async function loadUserDemoData(userId: string) {
  // Crear cuentas de ejemplo
  const cuentaCorriente = await prisma.userAccount.create({
    data: {
      user_id: userId,
      name: 'Cuenta Corriente Principal',
      type: 'corriente',
      balance: 2456.78
    }
  })

  const tarjetaCredito = await prisma.userAccount.create({
    data: {
      user_id: userId,
      name: 'Tarjeta de Crédito BBVA',
      type: 'credito',
      balance: -856.42
    }
  })

  const efectivo = await prisma.userAccount.create({
    data: {
      user_id: userId,
      name: 'Efectivo',
      type: 'efectivo',
      balance: 125.50
    }
  })

  const ahorros = await prisma.userAccount.create({
    data: {
      user_id: userId,
      name: 'Cuenta de Ahorros',
      type: 'ahorros',
      balance: 8945.32
    }
  })

  // Obtener categorías para usar en transacciones
  const categories = await prisma.category.findMany({
    where: { is_predefined: true }
  })

  const categoryMap = Object.fromEntries(
    categories.map(cat => [cat.name, cat.id])
  )

  // Transacciones de demostración (últimos 3 meses)
  const demoTransactions = [
    // Mes actual
    { date: '2024-01-15', amount: 2200, type: 'ingreso', category: 'Salario', account: cuentaCorriente.id, description: 'Salario enero', merchant: 'Empresa ABC S.L.' },
    { date: '2024-01-03', amount: 750, type: 'gasto', category: 'Vivienda', account: cuentaCorriente.id, description: 'Alquiler apartamento', merchant: 'Inmobiliaria García' },
    { date: '2024-01-05', amount: 89.45, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra semanal', merchant: 'Mercadona' },
    { date: '2024-01-08', amount: 42.30, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Cena con amigos', merchant: 'Restaurante El Patio' },
    { date: '2024-01-10', amount: 15.90, type: 'gasto', category: 'Transporte', account: efectivo.id, description: 'Taxi', merchant: 'Taxi Madrid' },
    { date: '2024-01-12', amount: 3.20, type: 'gasto', category: 'Restaurantes y bares', account: efectivo.id, description: 'Café', merchant: 'Cafetería Central' },
    { date: '2024-01-14', amount: 45.60, type: 'gasto', category: 'Suministros', account: cuentaCorriente.id, description: 'Factura luz', merchant: 'Iberdrola' },
    { date: '2024-01-16', amount: 23.78, type: 'gasto', category: 'Supermercado', account: efectivo.id, description: 'Frutas y verduras', merchant: 'Frutería López' },
    { date: '2024-01-18', amount: 120.00, type: 'gasto', category: 'Ropa y calzado', account: tarjetaCredito.id, description: 'Camisa y pantalón', merchant: 'Zara' },
    { date: '2024-01-20', amount: 8.99, type: 'gasto', category: 'Suscripciones', account: cuentaCorriente.id, description: 'Spotify Premium', merchant: 'Spotify' },
    
    // Mes anterior
    { date: '2023-12-15', amount: 2200, type: 'ingreso', category: 'Salario', account: cuentaCorriente.id, description: 'Salario diciembre', merchant: 'Empresa ABC S.L.' },
    { date: '2023-12-01', amount: 750, type: 'gasto', category: 'Vivienda', account: cuentaCorriente.id, description: 'Alquiler apartamento', merchant: 'Inmobiliaria García' },
    { date: '2023-12-05', amount: 95.20, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra semanal', merchant: 'Carrefour' },
    { date: '2023-12-08', amount: 65.40, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Cena romántica', merchant: 'Restaurante La Terraza' },
    { date: '2023-12-10', amount: 25.60, type: 'gasto', category: 'Transporte', account: cuentaCorriente.id, description: 'Metro mensual', merchant: 'Metro Madrid' },
    { date: '2023-12-12', amount: 4.20, type: 'gasto', category: 'Restaurantes y bares', account: efectivo.id, description: 'Café con leche', merchant: 'Bar Central' },
    { date: '2023-12-15', amount: 89.30, type: 'gasto', category: 'Suministros', account: cuentaCorriente.id, description: 'Factura gas', merchant: 'Gas Natural' },
    { date: '2023-12-18', amount: 156.90, type: 'gasto', category: 'Tecnología', account: tarjetaCredito.id, description: 'Auriculares bluetooth', merchant: 'Amazon' },
    { date: '2023-12-20', amount: 35.50, type: 'gasto', category: 'Salud y farmacia', account: efectivo.id, description: 'Medicamentos', merchant: 'Farmacia San José' },
    { date: '2023-12-22', amount: 189.00, type: 'gasto', category: 'Ocio y entretenimiento', account: tarjetaCredito.id, description: 'Entradas teatro', merchant: 'Teatro Real' },
    
    // Hace 2 meses
    { date: '2023-11-15', amount: 2200, type: 'ingreso', category: 'Salario', account: cuentaCorriente.id, description: 'Salario noviembre', merchant: 'Empresa ABC S.L.' },
    { date: '2023-11-01', amount: 750, type: 'gasto', category: 'Vivienda', account: cuentaCorriente.id, description: 'Alquiler apartamento', merchant: 'Inmobiliaria García' },
    { date: '2023-11-03', amount: 78.90, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra semanal', merchant: 'Mercadona' },
    { date: '2023-11-06', amount: 28.50, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Almuerzo trabajo', merchant: 'Restaurante Oficina' },
    { date: '2023-11-08', amount: 450.00, type: 'gasto', category: 'Educación', account: cuentaCorriente.id, description: 'Curso de idiomas', merchant: 'Academia Berlitz' },
    { date: '2023-11-10', amount: 12.30, type: 'gasto', category: 'Transporte', account: efectivo.id, description: 'Autobús', merchant: 'EMT Madrid' },
    { date: '2023-11-12', amount: 67.80, type: 'gasto', category: 'Suministros', account: cuentaCorriente.id, description: 'Factura agua', merchant: 'Canal Isabel II' },
    { date: '2023-11-15', amount: 234.50, type: 'gasto', category: 'Ropa y calzado', account: tarjetaCredito.id, description: 'Zapatos y chaqueta', merchant: 'El Corte Inglés' },
    { date: '2023-11-18', amount: 89.99, type: 'gasto', category: 'Tecnología', account: tarjetaCredito.id, description: 'Cable USB-C', merchant: 'MediaMarkt' },
    { date: '2023-11-25', amount: 145.20, type: 'gasto', category: 'Otros gastos', account: tarjetaCredito.id, description: 'Regalo cumpleaños', merchant: 'Joyería Platino' }
  ]

  // Crear todas las transacciones
  for (const trans of demoTransactions) {
    const categoryId = categoryMap[trans.category]
    if (categoryId) {
      await prisma.transaction.create({
        data: {
          user_id: userId,
          account_id: trans.account,
          date: new Date(trans.date),
          amount: trans.amount,
          type: trans.type as 'ingreso' | 'gasto',
          category_id: categoryId,
          description: trans.description,
          merchant: trans.merchant,
          payment_method: 'tarjeta_debito',
          tags: []
        }
      })
    }
  }

  // Crear algunos presupuestos de ejemplo
  const currentMonth = '2024-01'
  await prisma.budget.createMany({
    data: [
      { user_id: userId, category_id: categoryMap['Supermercado'], month: currentMonth, amount: 400 },
      { user_id: userId, category_id: categoryMap['Restaurantes y bares'], month: currentMonth, amount: 200 },
      { user_id: userId, category_id: categoryMap['Transporte'], month: currentMonth, amount: 100 },
      { user_id: userId, category_id: categoryMap['Ocio y entretenimiento'], month: currentMonth, amount: 300 },
      { user_id: userId, category_id: categoryMap['Ropa y calzado'], month: currentMonth, amount: 150 }
    ]
  })
}
