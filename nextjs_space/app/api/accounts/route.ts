
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

    const accounts = await prisma.userAccount.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    })

    return NextResponse.json({ 
      accounts: accounts.map(acc => ({
        ...acc,
        balance: Number(acc.balance), // Convert Decimal to number
      }))
    })

  } catch (error) {
    console.error('Error fetching accounts:', error)
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

    const { name, type, balance = 0 } = body

    // Validaciones
    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre de la cuenta es requerido' }, { status: 400 })
    }

    if (!type || !['corriente', 'credito', 'efectivo', 'ahorros'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de cuenta inválido' }, { status: 400 })
    }

    if (isNaN(balance)) {
      return NextResponse.json({ error: 'El balance debe ser un número válido' }, { status: 400 })
    }

    // Verificar que no existe una cuenta con el mismo nombre para el usuario
    const existingAccount = await prisma.userAccount.findFirst({
      where: {
        name: name.trim(),
        user_id: userId
      }
    })

    if (existingAccount) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese nombre' }, { status: 400 })
    }

    const account = await prisma.userAccount.create({
      data: {
        user_id: userId,
        name: name.trim(),
        type,
        balance: Number(balance)
      }
    })

    return NextResponse.json({
      message: 'Cuenta creada exitosamente',
      account: {
        ...account,
        balance: Number(account.balance), // Convert Decimal to number
      }
    })

  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
