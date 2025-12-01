
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        account: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({
      transactions: transactions.map(t => ({
        ...t,
        amount: Number(t.amount), // Convert Decimal to number
      }))
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
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

    const {
      date,
      amount,
      type,
      description,
      category_id,
      account_id,
      payment_method,
      merchant,
      tags
    } = body

    // Validaciones
    if (!date || !amount || !type || !description || !category_id || !account_id) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'El importe debe ser mayor a 0' }, { status: 400 })
    }

    if (!['ingreso', 'gasto'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de transacción inválido' }, { status: 400 })
    }

    // Verificar que la categoría y cuenta pertenezcan al usuario
    const [category, account] = await Promise.all([
      prisma.category.findFirst({
        where: {
          id: category_id,
          OR: [
            { user_id: userId },
            { is_predefined: true, user_id: null }
          ]
        }
      }),
      prisma.userAccount.findFirst({
        where: {
          id: account_id,
          user_id: userId
        }
      })
    ])

    if (!category) {
      return NextResponse.json({ error: 'Categoría no válida' }, { status: 400 })
    }

    if (!account) {
      return NextResponse.json({ error: 'Cuenta no válida' }, { status: 400 })
    }

    // Crear transacción
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        account_id,
        date: new Date(date),
        amount: type === 'gasto' ? -Math.abs(amount) : Math.abs(amount),
        type,
        category_id,
        description: description.trim(),
        payment_method: payment_method || 'efectivo',
        merchant: merchant?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        currency: 'EUR'
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        account: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    })

    // Actualizar balance de la cuenta
    await prisma.userAccount.update({
      where: { id: account_id },
      data: {
        balance: {
          increment: type === 'gasto' ? -Math.abs(amount) : Math.abs(amount)
        }
      }
    })

    return NextResponse.json({
      message: 'Transacción creada exitosamente',
      transaction: {
        ...transaction,
        amount: Number(transaction.amount), // Convert Decimal to number
      }
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
