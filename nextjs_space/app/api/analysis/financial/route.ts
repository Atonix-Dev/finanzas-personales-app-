
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * AI Financial Analysis API
 * 
 * Esta funcionalidad está en desarrollo.
 * Próximamente se integrará con n8n para análisis financiero con IA.
 * 
 * TODO: Integrar con n8n workflow para análisis con LLM
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Feature en desarrollo - Preparado para integración con n8n
    return NextResponse.json({ 
      status: 'coming_soon',
      message: 'Esta funcionalidad está en desarrollo. Próximamente podrás obtener análisis financieros con IA.',
      message_en: 'This feature is under development. Soon you will be able to get AI-powered financial analysis.'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error in financial analysis:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
