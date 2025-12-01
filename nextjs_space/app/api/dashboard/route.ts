
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCurrentMonth, getLastNMonths } from '@/lib/utils-es'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || 'current-month'

    // Obtener fechas según el rango
    const currentMonth = getCurrentMonth()
    const currentDate = new Date()
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    // 1. Calcular totales del mes actual
    const currentMonthTransactions = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: 'ingreso',
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const currentMonthExpenses = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: 'gasto',
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const totalIncome = currentMonthIncome._sum.amount || 0
    const totalExpenses = Math.abs(currentMonthExpenses._sum.amount || 0)
    const balance = totalIncome - totalExpenses

    // 2. Obtener cuentas del usuario
    const accounts = await prisma.userAccount.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        balance: true,
      },
    })

    // 3. Top comercios del mes actual
    const topMerchants = await prisma.transaction.groupBy({
      by: ['merchant'],
      where: {
        user_id: userId,
        type: 'gasto',
        merchant: {
          not: null,
        },
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
      take: 5,
    })

    const topMerchantsFormatted = topMerchants.map(merchant => ({
      merchant: merchant.merchant || 'Sin especificar',
      totalAmount: Math.abs(merchant._sum.amount || 0),
      transactionCount: merchant._count.id,
    }))

    // 4. Datos mensuales de los últimos 6 meses
    const last6Months = getLastNMonths(6)
    const monthlyData = []

    for (const month of last6Months) {
      const [year, monthNum] = month.split('-')
      const monthStart = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
      const monthEnd = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)

      const monthIncome = await prisma.transaction.aggregate({
        where: {
          user_id: userId,
          type: 'ingreso',
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      })

      const monthExpenses = await prisma.transaction.aggregate({
        where: {
          user_id: userId,
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

      monthlyData.push({
        month,
        income: monthIncome._sum.amount || 0,
        expenses: Math.abs(monthExpenses._sum.amount || 0),
      })
    }

    // 5. Gastos por categoría del mes actual
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['category_id'],
      where: {
        user_id: userId,
        type: 'gasto',
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    })

    // Obtener nombres de categorías
    const categoryIds = expensesByCategory.map(item => item.category_id)
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    const categoryMap = Object.fromEntries(categories.map(cat => [cat.id, cat.name]))
    const totalExpenseAmount = expensesByCategory.reduce((sum, item) => sum + Math.abs(item._sum.amount || 0), 0)

    const expensesByCategoryFormatted = expensesByCategory.map(item => ({
      category: categoryMap[item.category_id] || 'Sin categoría',
      amount: Math.abs(item._sum.amount || 0),
      percentage: totalExpenseAmount > 0 ? (Math.abs(item._sum.amount || 0) / totalExpenseAmount) * 100 : 0,
    }))

    // 6. Alertas de presupuesto
    const budgets = await prisma.budget.findMany({
      where: {
        user_id: userId,
        month: currentMonth,
      },
      include: {
        category: true,
      },
    })

    const budgetAlerts = []
    for (const budget of budgets) {
      const spent = await prisma.transaction.aggregate({
        where: {
          user_id: userId,
          category_id: budget.category_id,
          type: 'gasto',
          date: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      })

      const spentAmount = Math.abs(spent._sum.amount || 0)
      const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0

      if (percentage >= 80) {
        budgetAlerts.push({
          category: budget.category.name,
          spent: spentAmount,
          budget: budget.amount,
          percentage,
        })
      }
    }

    return NextResponse.json({
      currentMonth: {
        totalIncome,
        totalExpenses,
        balance,
      },
      accounts,
      topMerchants: topMerchantsFormatted,
      monthlyData,
      expensesByCategory: expensesByCategoryFormatted,
      budgetAlerts,
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
