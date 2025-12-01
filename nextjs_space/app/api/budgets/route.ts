
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCurrentMonth } from '@/lib/utils-es'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') || getCurrentMonth()

    // Obtener presupuestos del mes especificado
    const budgets = await prisma.budget.findMany({
      where: {
        user_id: userId,
        month: month
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    // Calcular gastos actuales para cada presupuesto
    const [year, monthNum] = month.split('-')
    const monthStart = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
    const monthEnd = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            user_id: userId,
            category_id: budget.category_id,
            type: 'gasto',
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        })

        const spentAmount = Math.abs(spent._sum.amount || 0)
        const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0

        return {
          ...budget,
          amount: Number(budget.amount), // Convert Decimal to number
          spent: spentAmount,
          remaining: Math.max(0, budget.amount - spentAmount),
          percentage: Math.round(percentage),
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
        }
      })
    )

    return NextResponse.json({ budgets: budgetsWithSpent })

  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const { category_id, month, amount } = body

    // Validaciones
    if (!category_id || !month || !amount) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'El monto del presupuesto debe ser mayor a 0' }, { status: 400 })
    }

    // Validar formato de mes
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Formato de mes inválido (debe ser YYYY-MM)' }, { status: 400 })
    }

    // Verificar que la categoría existe y es accesible al usuario
    const category = await prisma.category.findFirst({
      where: {
        id: category_id,
        OR: [
          { user_id: userId },
          { is_predefined: true, user_id: null }
        ]
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 })
    }

    // Verificar que no existe un presupuesto para esa categoría en ese mes
    const existingBudget = await prisma.budget.findFirst({
      where: {
        user_id: userId,
        category_id,
        month
      }
    })

    if (existingBudget) {
      return NextResponse.json({ 
        error: 'Ya existe un presupuesto para esta categoría en este mes' 
      }, { status: 400 })
    }

    const budget = await prisma.budget.create({
      data: {
        user_id: userId,
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
      message: 'Presupuesto creado exitosamente',
      budget: {
        ...budget,
        amount: Number(budget.amount), // Convert Decimal to number
      }
    })

  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
