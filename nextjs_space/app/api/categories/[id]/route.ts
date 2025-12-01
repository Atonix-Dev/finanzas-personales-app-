
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const categoryId = params.id
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre de la categoría es requerido' }, { status: 400 })
    }

    // Verificar que la categoría existe y pertenece al usuario (no predefinida)
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: categoryId,
        user_id: userId,
        is_predefined: false
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Categoría no encontrada o no se puede editar' }, { status: 404 })
    }

    // Verificar que no existe otra categoría con el mismo nombre
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        id: { not: categoryId },
        OR: [
          { user_id: userId },
          { is_predefined: true, user_id: null }
        ]
      }
    })

    if (duplicateCategory) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: { name: name.trim() }
    })

    return NextResponse.json({
      message: 'Categoría actualizada exitosamente',
      category
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const categoryId = params.id

    // Verificar que la categoría existe y pertenece al usuario (no predefinida)
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        user_id: userId,
        is_predefined: false
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada o no se puede eliminar' }, { status: 404 })
    }

    // Verificar que no hay transacciones usando esta categoría
    const transactionsCount = await prisma.transaction.count({
      where: { category_id: categoryId }
    })

    if (transactionsCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar la categoría porque tiene transacciones asociadas' 
      }, { status: 400 })
    }

    // Verificar que no hay presupuestos usando esta categoría
    const budgetsCount = await prisma.budget.count({
      where: { category_id: categoryId }
    })

    if (budgetsCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar la categoría porque tiene presupuestos asociados' 
      }, { status: 400 })
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return NextResponse.json({
      message: 'Categoría eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
