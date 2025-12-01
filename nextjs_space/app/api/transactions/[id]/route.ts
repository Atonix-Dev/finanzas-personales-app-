
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
    const transactionId = params.id
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

    // Verificar que la transacción existe y pertenece al usuario
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        user_id: userId
      }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
    }

    // Validaciones
    if (!date || !amount || !type || !description || !category_id || !account_id) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'El importe debe ser mayor a 0' }, { status: 400 })
    }

    // Revertir el balance anterior de la cuenta anterior
    await prisma.userAccount.update({
      where: { id: existingTransaction.account_id },
      data: {
        balance: {
          decrement: Number(existingTransaction.amount)
        }
      }
    })

    // Actualizar transacción
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        account_id,
        date: new Date(date),
        amount: type === 'gasto' ? -Math.abs(amount) : Math.abs(amount),
        type,
        category_id,
        description: description.trim(),
        payment_method: payment_method || 'efectivo',
        merchant: merchant?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
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

    // Aplicar el nuevo balance a la cuenta (nueva o misma)
    await prisma.userAccount.update({
      where: { id: account_id },
      data: {
        balance: {
          increment: type === 'gasto' ? -Math.abs(amount) : Math.abs(amount)
        }
      }
    })

    return NextResponse.json({
      message: 'Transacción actualizada exitosamente',
      transaction: {
        ...transaction,
        amount: Number(transaction.amount), // Convert Decimal to number
      }
    })

  } catch (error) {
    console.error('Error updating transaction:', error)
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
    const transactionId = params.id

    // Verificar que la transacción existe y pertenece al usuario
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        user_id: userId
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
    }

    // Revertir el balance de la cuenta
    await prisma.userAccount.update({
      where: { id: transaction.account_id },
      data: {
        balance: {
          decrement: Number(transaction.amount)
        }
      }
    })

    // Eliminar transacción
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    return NextResponse.json({
      message: 'Transacción eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
