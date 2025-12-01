
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
    const budgetId = params.id
    const body = await request.json()

    const { category_id, month, amount } = body

    // Verificar que el presupuesto existe y pertenece al usuario
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        user_id: userId
      }
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    // Validaciones
    if (!category_id || !month || !amount) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'El monto del presupuesto debe ser mayor a 0' }, { status: 400 })
    }

    // Verificar que no existe otro presupuesto para esa categoría en ese mes
    if (category_id !== existingBudget.category_id || month !== existingBudget.month) {
      const duplicateBudget = await prisma.budget.findFirst({
        where: {
          user_id: userId,
          category_id,
          month,
          id: { not: budgetId }
        }
      })

      if (duplicateBudget) {
        return NextResponse.json({ 
          error: 'Ya existe un presupuesto para esta categoría en este mes' 
        }, { status: 400 })
      }
    }

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        category_id,
        month,
        amount: Number(amount)
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Presupuesto actualizado exitosamente',
      budget: {
        ...budget,
        amount: Number(budget.amount), // Convert Decimal to number
      }
    })

  } catch (error) {
    console.error('Error updating budget:', error)
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
    const budgetId = params.id

    // Verificar que el presupuesto existe y pertenece al usuario
    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        user_id: userId
      }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id: budgetId }
    })

    return NextResponse.json({
      message: 'Presupuesto eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
