
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

    // Obtener categorías predefinidas y personalizadas del usuario
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { user_id: userId }, // Categorías personalizadas del usuario
          { is_predefined: true, user_id: null } // Categorías predefinidas
        ]
      },
      orderBy: [
        { is_predefined: 'desc' }, // Predefinidas primero
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Error fetching categories:', error)
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
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre de la categoría es requerido' }, { status: 400 })
    }

    // Verificar que no existe una categoría con el mismo nombre para el usuario
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: name.trim(),
        OR: [
          { user_id: userId },
          { is_predefined: true, user_id: null }
        ]
      }
    })

    if (existingCategory) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        user_id: userId,
        is_predefined: false
      }
    })

    return NextResponse.json({
      message: 'Categoría creada exitosamente',
      category
    })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
