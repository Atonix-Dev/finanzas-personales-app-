import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  console.log('Agregando nuevas categorías predefinidas...')
  
  const newCategories = ['Gastos fijos', 'Familia']
  
  for (const categoryName of newCategories) {
    // Verificar si la categoría ya existe
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryName,
        is_predefined: true,
        user_id: null
      }
    })
    
    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: categoryName,
          is_predefined: true,
          user_id: null
        }
      })
      console.log(`✅ Categoría "${categoryName}" agregada`)
    } else {
      console.log(`ℹ️  Categoría "${categoryName}" ya existe`)
    }
  }
  
  console.log('✅ Proceso completado')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
