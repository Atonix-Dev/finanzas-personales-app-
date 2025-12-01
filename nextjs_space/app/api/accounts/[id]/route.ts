
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
    const accountId = params.id
    const body = await request.json()

    const { name, type, balance } = body

    // Verificar que la cuenta existe y pertenece al usuario
    const existingAccount = await prisma.userAccount.findFirst({
      where: {
        id: accountId,
        user_id: userId
      }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Validaciones
    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre de la cuenta es requerido' }, { status: 400 })
    }

    if (!type || !['corriente', 'credito', 'efectivo', 'ahorros'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de cuenta inválido' }, { status: 400 })
    }

    if (balance !== undefined && isNaN(balance)) {
      return NextResponse.json({ error: 'El balance debe ser un número válido' }, { status: 400 })
    }

    // Verificar que no existe otra cuenta con el mismo nombre
    const duplicateAccount = await prisma.userAccount.findFirst({
      where: {
        name: name.trim(),
        user_id: userId,
        id: { not: accountId }
      }
    })

    if (duplicateAccount) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese nombre' }, { status: 400 })
    }

    const updateData: any = {
      name: name.trim(),
      type
    }

    // Solo actualizar balance si se proporciona
    if (balance !== undefined) {
      updateData.balance = Number(balance)
    }

    const account = await prisma.userAccount.update({
      where: { id: accountId },
      data: updateData
    })

    return NextResponse.json({
      message: 'Cuenta actualizada exitosamente',
      account: {
        ...account,
        balance: Number(account.balance), // Convert Decimal to number
      }
    })

  } catch (error) {
    console.error('Error updating account:', error)
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
    const accountId = params.id

    // Verificar que la cuenta existe y pertenece al usuario
    const account = await prisma.userAccount.findFirst({
      where: {
        id: accountId,
        user_id: userId
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    // Verificar que no hay transacciones asociadas
    const transactionsCount = await prisma.transaction.count({
      where: { account_id: accountId }
    })

    if (transactionsCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar la cuenta porque tiene transacciones asociadas' 
      }, { status: 400 })
    }

    await prisma.userAccount.delete({
      where: { id: accountId }
    })

    return NextResponse.json({
      message: 'Cuenta eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
