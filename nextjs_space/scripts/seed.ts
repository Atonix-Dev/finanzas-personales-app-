
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos de demostración...')

  // Crear usuario de prueba principal
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password_hash: hashedPassword,
      name: 'John Doe',
    },
  })

  console.log('✅ Usuario de prueba creado:', testUser.email)

  // Crear categorías predefinidas si no existen
  const predefinedCategories = [
    'Supermercado', 'Transporte', 'Vivienda', 'Suministros', 
    'Ocio y entretenimiento', 'Restaurantes y bares', 'Salud y farmacia',
    'Educación', 'Ropa y calzado', 'Tecnología', 'Suscripciones', 
    'Otros gastos', 'Salario', 'Otros ingresos'
  ]

  const categories = []
  for (const categoryName of predefinedCategories) {
    // Verificar si ya existe una categoría predefinida con este nombre
    let category = await prisma.category.findFirst({
      where: {
        name: categoryName,
        is_predefined: true,
        user_id: null
      }
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          is_predefined: true,
          user_id: null
        }
      })
    }

    categories.push(category)
  }

  console.log('✅ Categorías predefinidas creadas')

  // Crear cuentas de demostración para el usuario de prueba
  const cuentaCorriente = await prisma.userAccount.create({
    data: {
      user_id: testUser.id,
      name: 'Cuenta Corriente BBVA',
      type: 'corriente',
      balance: 2456.78
    }
  })

  const tarjetaCredito = await prisma.userAccount.create({
    data: {
      user_id: testUser.id,
      name: 'Tarjeta Visa',
      type: 'credito',
      balance: -856.42
    }
  })

  const efectivo = await prisma.userAccount.create({
    data: {
      user_id: testUser.id,
      name: 'Efectivo',
      type: 'efectivo',
      balance: 125.50
    }
  })

  const ahorros = await prisma.userAccount.create({
    data: {
      user_id: testUser.id,
      name: 'Cuenta de Ahorros',
      type: 'ahorros',
      balance: 8945.32
    }
  })

  console.log('✅ Cuentas de demostración creadas')

  // Crear mapa de categorías por nombre
  const categoryMap = Object.fromEntries(
    categories.map(cat => [cat.name, cat.id])
  )

  // Transacciones de demostración realistas
  const demoTransactions = [
    // Enero 2024
    { date: '2024-01-15', amount: 2200, type: 'ingreso', category: 'Salario', account: cuentaCorriente.id, description: 'Salario enero', merchant: 'Empresa ABC S.L.', payment_method: 'transferencia' },
    { date: '2024-01-03', amount: -750, type: 'gasto', category: 'Vivienda', account: cuentaCorriente.id, description: 'Alquiler apartamento', merchant: 'Inmobiliaria García', payment_method: 'transferencia' },
    { date: '2024-01-05', amount: -89.45, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra semanal', merchant: 'Mercadona', payment_method: 'tarjeta_credito' },
    { date: '2024-01-08', amount: -42.30, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Cena con amigos', merchant: 'Restaurante El Patio', payment_method: 'tarjeta_credito' },
    { date: '2024-01-10', amount: -15.90, type: 'gasto', category: 'Transporte', account: efectivo.id, description: 'Taxi', merchant: 'Taxi Madrid', payment_method: 'efectivo' },
    { date: '2024-01-12', amount: -3.20, type: 'gasto', category: 'Restaurantes y bares', account: efectivo.id, description: 'Café', merchant: 'Cafetería Central', payment_method: 'efectivo', tags: ['café', 'mañana'] },
    { date: '2024-01-14', amount: -45.60, type: 'gasto', category: 'Suministros', account: cuentaCorriente.id, description: 'Factura luz', merchant: 'Iberdrola', payment_method: 'tarjeta_debito' },
    { date: '2024-01-16', amount: -23.78, type: 'gasto', category: 'Supermercado', account: efectivo.id, description: 'Frutas y verduras', merchant: 'Frutería López', payment_method: 'efectivo' },
    { date: '2024-01-18', amount: -120.00, type: 'gasto', category: 'Ropa y calzado', account: tarjetaCredito.id, description: 'Camisa y pantalón', merchant: 'Zara', payment_method: 'tarjeta_credito' },
    { date: '2024-01-20', amount: -8.99, type: 'gasto', category: 'Suscripciones', account: cuentaCorriente.id, description: 'Spotify Premium', merchant: 'Spotify', payment_method: 'tarjeta_debito' },
    { date: '2024-01-22', amount: -67.80, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra fin de semana', merchant: 'Carrefour', payment_method: 'tarjeta_credito' },
    { date: '2024-01-25', amount: -4.50, type: 'gasto', category: 'Restaurantes y bares', account: efectivo.id, description: 'Café con tostada', merchant: 'Bar Central', payment_method: 'efectivo', tags: ['café', 'desayuno'] },
    { date: '2024-01-28', amount: -35.20, type: 'gasto', category: 'Transporte', account: cuentaCorriente.id, description: 'Abono transporte mensual', merchant: 'Metro Madrid', payment_method: 'tarjeta_debito' },
    
    // Diciembre 2023
    { date: '2023-12-15', amount: 2200, type: 'ingreso', category: 'Salario', account: cuentaCorriente.id, description: 'Salario diciembre', merchant: 'Empresa ABC S.L.', payment_method: 'transferencia' },
    { date: '2023-12-01', amount: -750, type: 'gasto', category: 'Vivienda', account: cuentaCorriente.id, description: 'Alquiler apartamento', merchant: 'Inmobiliaria García', payment_method: 'transferencia' },
    { date: '2023-12-05', amount: -95.20, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra semanal', merchant: 'Carrefour', payment_method: 'tarjeta_credito' },
    { date: '2023-12-08', amount: -65.40, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Cena romántica', merchant: 'Restaurante La Terraza', payment_method: 'tarjeta_credito' },
    { date: '2023-12-10', amount: -25.60, type: 'gasto', category: 'Transporte', account: cuentaCorriente.id, description: 'Taxi aeropuerto', merchant: 'Taxi Express', payment_method: 'tarjeta_debito' },
    { date: '2023-12-12', amount: -4.20, type: 'gasto', category: 'Restaurantes y bares', account: efectivo.id, description: 'Café con leche', merchant: 'Bar Central', payment_method: 'efectivo', tags: ['café'] },
    { date: '2023-12-15', amount: -89.30, type: 'gasto', category: 'Suministros', account: cuentaCorriente.id, description: 'Factura gas', merchant: 'Gas Natural', payment_method: 'tarjeta_debito' },
    { date: '2023-12-18', amount: -156.90, type: 'gasto', category: 'Tecnología', account: tarjetaCredito.id, description: 'Auriculares bluetooth', merchant: 'Amazon', payment_method: 'tarjeta_credito' },
    { date: '2023-12-20', amount: -35.50, type: 'gasto', category: 'Salud y farmacia', account: efectivo.id, description: 'Medicamentos', merchant: 'Farmacia San José', payment_method: 'efectivo' },
    { date: '2023-12-22', amount: -189.00, type: 'gasto', category: 'Ocio y entretenimiento', account: tarjetaCredito.id, description: 'Entradas teatro', merchant: 'Teatro Real', payment_method: 'tarjeta_credito' },
    { date: '2023-12-24', amount: -78.90, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra Nochebuena', merchant: 'Mercadona', payment_method: 'tarjeta_credito' },
    { date: '2023-12-31', amount: -125.00, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Cena Nochevieja', merchant: 'Restaurante Premium', payment_method: 'tarjeta_credito' },
    
    // Noviembre 2023
    { date: '2023-11-15', amount: 2200, type: 'ingreso', category: 'Salario', account: cuentaCorriente.id, description: 'Salario noviembre', merchant: 'Empresa ABC S.L.', payment_method: 'transferencia' },
    { date: '2023-11-01', amount: -750, type: 'gasto', category: 'Vivienda', account: cuentaCorriente.id, description: 'Alquiler apartamento', merchant: 'Inmobiliaria García', payment_method: 'transferencia' },
    { date: '2023-11-03', amount: -78.90, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra semanal', merchant: 'Mercadona', payment_method: 'tarjeta_credito' },
    { date: '2023-11-06', amount: -28.50, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Almuerzo trabajo', merchant: 'Restaurante Oficina', payment_method: 'tarjeta_credito' },
    { date: '2023-11-08', amount: -450.00, type: 'gasto', category: 'Educación', account: cuentaCorriente.id, description: 'Curso de idiomas', merchant: 'Academia Berlitz', payment_method: 'tarjeta_debito' },
    { date: '2023-11-10', amount: -12.30, type: 'gasto', category: 'Transporte', account: efectivo.id, description: 'Autobús', merchant: 'EMT Madrid', payment_method: 'efectivo' },
    { date: '2023-11-12', amount: -67.80, type: 'gasto', category: 'Suministros', account: cuentaCorriente.id, description: 'Factura agua', merchant: 'Canal Isabel II', payment_method: 'tarjeta_debito' },
    { date: '2023-11-15', amount: -234.50, type: 'gasto', category: 'Ropa y calzado', account: tarjetaCredito.id, description: 'Zapatos y chaqueta', merchant: 'El Corte Inglés', payment_method: 'tarjeta_credito' },
    { date: '2023-11-18', amount: -89.99, type: 'gasto', category: 'Tecnología', account: tarjetaCredito.id, description: 'Cable USB-C', merchant: 'MediaMarkt', payment_method: 'tarjeta_credito' },
    { date: '2023-11-25', amount: -145.20, type: 'gasto', category: 'Otros gastos', account: tarjetaCredito.id, description: 'Regalo cumpleaños', merchant: 'Joyería Platino', payment_method: 'tarjeta_credito' },
    
    // Octubre 2023
    { date: '2023-10-15', amount: 2200, type: 'ingreso', category: 'Salario', account: cuentaCorriente.id, description: 'Salario octubre', merchant: 'Empresa ABC S.L.', payment_method: 'transferencia' },
    { date: '2023-10-01', amount: -750, type: 'gasto', category: 'Vivienda', account: cuentaCorriente.id, description: 'Alquiler apartamento', merchant: 'Inmobiliaria García', payment_method: 'transferencia' },
    { date: '2023-10-05', amount: -112.30, type: 'gasto', category: 'Supermercado', account: tarjetaCredito.id, description: 'Compra mensual', merchant: 'Hipercor', payment_method: 'tarjeta_credito' },
    { date: '2023-10-08', amount: -45.60, type: 'gasto', category: 'Restaurantes y bares', account: tarjetaCredito.id, description: 'Pizza con amigos', merchant: 'Telepizza', payment_method: 'tarjeta_credito' },
    { date: '2023-10-12', amount: -38.90, type: 'gasto', category: 'Transporte', account: cuentaCorriente.id, description: 'Gasolina', merchant: 'Repsol', payment_method: 'tarjeta_debito' },
    { date: '2023-10-15', amount: -156.80, type: 'gasto', category: 'Ropa y calzado', account: tarjetaCredito.id, description: 'Ropa de invierno', merchant: 'H&M', payment_method: 'tarjeta_credito' },
    { date: '2023-10-20', amount: -23.45, type: 'gasto', category: 'Salud y farmacia', account: efectivo.id, description: 'Vitaminas', merchant: 'Farmacia del Pilar', payment_method: 'efectivo' },
    { date: '2023-10-25', amount: -78.20, type: 'gasto', category: 'Ocio y entretenimiento', account: tarjetaCredito.id, description: 'Entradas cine', merchant: 'Cinesa', payment_method: 'tarjeta_credito' }
  ]

  // Crear todas las transacciones
  for (const trans of demoTransactions) {
    const categoryId = categoryMap[trans.category]
    if (categoryId) {
      await prisma.transaction.create({
        data: {
          user_id: testUser.id,
          account_id: trans.account,
          date: new Date(trans.date),
          amount: trans.amount,
          type: trans.type as 'ingreso' | 'gasto',
          category_id: categoryId,
          description: trans.description,
          merchant: trans.merchant,
          payment_method: trans.payment_method as any,
          tags: trans.tags || []
        }
      })
    }
  }

  console.log('✅ Transacciones de demostración creadas')

  // Actualizar balances de cuentas basándose en las transacciones
  const accounts = [cuentaCorriente, tarjetaCredito, efectivo, ahorros]
  
  for (const account of accounts) {
    const accountTransactions = await prisma.transaction.aggregate({
      where: { account_id: account.id },
      _sum: { amount: true }
    })
    
    const totalAmount = accountTransactions._sum.amount || 0
    
    await prisma.userAccount.update({
      where: { id: account.id },
      data: { balance: Number(totalAmount) }
    })
  }

  console.log('✅ Balances de cuentas actualizados')

  // Crear presupuestos de ejemplo
  const currentMonth = '2024-01'
  await prisma.budget.createMany({
    data: [
      { user_id: testUser.id, category_id: categoryMap['Supermercado'], month: currentMonth, amount: 400 },
      { user_id: testUser.id, category_id: categoryMap['Restaurantes y bares'], month: currentMonth, amount: 200 },
      { user_id: testUser.id, category_id: categoryMap['Transporte'], month: currentMonth, amount: 100 },
      { user_id: testUser.id, category_id: categoryMap['Ocio y entretenimiento'], month: currentMonth, amount: 300 },
      { user_id: testUser.id, category_id: categoryMap['Ropa y calzado'], month: currentMonth, amount: 150 },
      { user_id: testUser.id, category_id: categoryMap['Tecnología'], month: currentMonth, amount: 200 }
    ]
  })

  console.log('✅ Presupuestos de ejemplo creados')

  console.log('🎉 Seed completado exitosamente!')
  console.log('📧 Email de prueba: john@doe.com')
  console.log('🔑 Contraseña de prueba: johndoe123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
