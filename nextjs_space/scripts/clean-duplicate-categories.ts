import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpiando categorías duplicadas...')

  const predefinedCategories = [
    'Supermercado', 'Transporte', 'Vivienda', 'Suministros', 
    'Ocio y entretenimiento', 'Restaurantes y bares', 'Salud y farmacia',
    'Educación', 'Ropa y calzado', 'Tecnología', 'Suscripciones', 
    'Otros gastos', 'Salario', 'Otros ingresos'
  ]

  for (const categoryName of predefinedCategories) {
    // Obtener todas las categorías con este nombre
    const categories = await prisma.category.findMany({
      where: {
        name: categoryName,
        is_predefined: true,
        user_id: null
      },
      orderBy: {
        created_at: 'asc' // La más antigua primero
      }
    })

    if (categories.length > 1) {
      console.log(`  Encontradas ${categories.length} categorías duplicadas de "${categoryName}"`)
      
      // Mantener la primera, eliminar el resto
      const keepId = categories[0].id
      const duplicateIds = categories.slice(1).map(cat => cat.id)

      // Actualizar todas las transacciones que usan categorías duplicadas
      for (const duplicateId of duplicateIds) {
        await prisma.transaction.updateMany({
          where: {
            category_id: duplicateId
          },
          data: {
            category_id: keepId
          }
        })

        // Actualizar presupuestos
        await prisma.budget.updateMany({
          where: {
            category_id: duplicateId
          },
          data: {
            category_id: keepId
          }
        })
      }

      // Eliminar las categorías duplicadas
      await prisma.category.deleteMany({
        where: {
          id: {
            in: duplicateIds
          }
        }
      })

      console.log(`  ✅ Eliminadas ${duplicateIds.length} categorías duplicadas de "${categoryName}"`)
    }
  }

  console.log('🎉 Limpieza completada!')
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
