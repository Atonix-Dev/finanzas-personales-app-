
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils-es'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Obtener todas las transacciones del usuario con información relacionada
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
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Generar CSV
    const csvHeaders = [
      'Fecha',
      'Tipo',
      'Categoría',
      'Descripción',
      'Importe (€)',
      'Cuenta',
      'Método de Pago',
      'Comercio',
      'Etiquetas'
    ].join(',')

    const csvRows = transactions.map(transaction => [
      formatDate(transaction.date),
      transaction.type === 'ingreso' ? 'Ingreso' : 'Gasto',
      transaction.category?.name || 'Sin categoría',
      `"${transaction.description?.replace(/"/g, '""') || ''}"`,
      transaction.amount.toFixed(2).replace('.', ','),
      transaction.account?.name || 'Sin cuenta',
      transaction.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      `"${transaction.merchant?.replace(/"/g, '""') || ''}"`,
      `"${transaction.tags?.join('; ') || ''}"`
    ].join(','))

    const csvContent = [csvHeaders, ...csvRows].join('\n')

    // Generar nombre de archivo con fecha actual
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `transacciones_${currentDate}.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })

  } catch (error) {
    console.error('Error exporting transactions:', error)
    return NextResponse.json(
      { error: 'Error al exportar transacciones' },
      { status: 500 }
    )
  }
}
