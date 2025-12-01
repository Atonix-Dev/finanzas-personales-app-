
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getCurrentMonth, getLastNMonths } from '@/lib/utils-es'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Verificar que hay suficientes datos para el análisis
    const transactionCount = await prisma.transaction.count({
      where: { user_id: userId }
    })

    if (transactionCount < 3) {
      return NextResponse.json({ 
        error: 'Se necesitan al menos 3 transacciones para realizar el análisis' 
      }, { status: 400 })
    }

    // Recopilar datos para el análisis
    const analysisData = await gatherFinancialData(userId)
    
    // Crear prompt para el LLM
    const prompt = createAnalysisPrompt(analysisData)

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          // Enviar indicador de progreso inicial
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'processing',
            message: 'Iniciando análisis...'
          })}\n\n`))

          console.log('Llamando a la API de Abacus AI...')
          
          const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'Eres un experto asesor financiero que analiza datos de gastos y proporciona recomendaciones específicas y accionables en español. Siempre respondes en formato JSON válido.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              stream: true,
              max_tokens: 4000,
              temperature: 0.7,
              response_format: { type: "json_object" }
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Error en la API:', response.status, errorText)
            throw new Error(`Error en la respuesta del servicio de IA: ${response.status}`)
          }

          console.log('Respuesta recibida, procesando stream...')

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('No se pudo obtener el reader del stream')
          }
          
          const decoder = new TextDecoder()
          let buffer = ''
          let partialRead = ''
          let progressSent = 0

          // Procesar stream de respuesta
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              console.log('Stream terminado')
              // Si llegamos aquí sin procesar el resultado, procesarlo ahora
              if (buffer.trim()) {
                try {
                  console.log('Procesando buffer final, longitud:', buffer.length)
                  console.log('Buffer preview:', buffer.substring(0, 300))
                  const finalResult = JSON.parse(buffer)
                  const processedResult = processAnalysisResult(finalResult)
                  
                  const finalData = JSON.stringify({
                    status: 'completed',
                    result: processedResult
                  })
                  controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  console.log('✅ Análisis completado y enviado')
                } catch (parseError: any) {
                  console.error('❌ Error al parsear el resultado final:', parseError.message)
                  console.error('Buffer completo:', buffer)
                  throw new Error(`Error al procesar el análisis: ${parseError.message}`)
                }
              } else {
                console.warn('⚠️ Stream terminado sin buffer')
              }
              break
            }

            partialRead += decoder.decode(value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') {
                  console.log('Recibido [DONE], procesando resultado final...')
                  console.log('Buffer acumulado, longitud:', buffer.length)
                  
                  try {
                    const finalResult = JSON.parse(buffer)
                    const processedResult = processAnalysisResult(finalResult)
                    
                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: processedResult
                    })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                    console.log('✅ Análisis completado y enviado')
                  } catch (parseError: any) {
                    console.error('❌ Error al parsear el resultado:', parseError.message)
                    console.error('Buffer:', buffer.substring(0, 500))
                    throw new Error(`Error al procesar el análisis: ${parseError.message}`)
                  }
                  return
                }
                
                if (!data) continue
                
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  if (content) {
                    buffer += content
                    
                    // Enviar progreso cada 10 chunks
                    progressSent++
                    if (progressSent % 10 === 0) {
                      const progressData = JSON.stringify({
                        status: 'processing',
                        message: 'Procesando análisis...'
                      })
                      controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON en líneas individuales (esperado para algunos chunks)
                  if (data.length > 0 && !data.startsWith('{')) {
                    console.log('Línea sin JSON válido (esperado):', data.substring(0, 30))
                  }
                }
              }
            }
          }

        } catch (error: any) {
          console.error('Error in analysis stream:', error)
          const errorData = JSON.stringify({
            status: 'error',
            message: error.message || 'Error al procesar el análisis financiero'
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error: any) {
    console.error('Error in financial analysis:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

async function gatherFinancialData(userId: string) {
  const currentMonth = getCurrentMonth()
  const lastMonths = getLastNMonths(3)
  
  // Obtener transacciones de los últimos 3 meses
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      date: {
        gte: threeMonthsAgo
      }
    },
    include: {
      category: { select: { name: true } },
      account: { select: { name: true, type: true } }
    },
    orderBy: { date: 'desc' }
  })

  // Obtener presupuestos del mes actual
  const budgets = await prisma.budget.findMany({
    where: {
      user_id: userId,
      month: currentMonth
    },
    include: {
      category: { select: { name: true } }
    }
  })

  // Calcular gastos por categoría
  const expensesByCategory = transactions
    .filter(t => t.type === 'gasto')
    .reduce((acc, t) => {
      const category = t.category.name
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, transactions: [] }
      }
      acc[category].total += Math.abs(Number(t.amount))
      acc[category].count++
      acc[category].transactions.push({
        amount: Number(t.amount),
        date: t.date.toISOString(),
        description: t.description,
        merchant: t.merchant
      })
      return acc
    }, {} as any)

  // Calcular ingresos y gastos mensuales
  const monthlyData = lastMonths.map(month => {
    const [year, monthNum] = month.split('-')
    const monthStart = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
    const monthEnd = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59)
    
    const monthTransactions = transactions.filter(t => 
      t.date >= monthStart && t.date <= monthEnd
    )
    
    const income = monthTransactions
      .filter(t => t.type === 'ingreso')
      .reduce((sum, t) => sum + Number(t.amount), 0)
      
    const expenses = monthTransactions
      .filter(t => t.type === 'gasto')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
    
    return { month, income, expenses }
  })

  return {
    transactions: transactions.map(t => ({
      ...t,
      amount: Number(t.amount)
    })),
    budgets: budgets.map(b => ({
      ...b,
      amount: Number(b.amount)
    })),
    expensesByCategory,
    monthlyData,
    totalTransactions: transactions.length,
    totalIncome: transactions.filter(t => t.type === 'ingreso').reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpenses: transactions.filter(t => t.type === 'gasto').reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  }
}

function createAnalysisPrompt(data: any) {
  const balance = data.totalIncome - data.totalExpenses
  const savingsRate = data.totalIncome > 0 ? ((balance / data.totalIncome) * 100).toFixed(1) : '0'
  
  return `Eres un asesor financiero experto. Analiza estos datos financieros y proporciona insights profundos y recomendaciones accionables.

RESUMEN FINANCIERO:
- Total de transacciones: ${data.totalTransactions}
- Ingresos totales (últimos 3 meses): ${data.totalIncome.toFixed(2)}€
- Gastos totales (últimos 3 meses): ${data.totalExpenses.toFixed(2)}€
- Balance: ${balance.toFixed(2)}€
- Tasa de ahorro: ${savingsRate}%

GASTOS POR CATEGORÍA (últimos 3 meses):
${Object.entries(data.expensesByCategory).map(([cat, info]: [string, any]) => 
  `- ${cat}: ${info.total.toFixed(2)}€ (${info.count} transacciones, promedio ${(info.total / info.count).toFixed(2)}€ por transacción)`
).join('\n')}

PRESUPUESTOS ESTABLECIDOS:
${data.budgets.length > 0 ? data.budgets.map((b: any) => `- ${b.category.name}: ${b.amount}€`).join('\n') : '- Sin presupuestos establecidos'}

EVOLUCIÓN MENSUAL:
${data.monthlyData.map((m: any) => {
  const monthBalance = m.income - m.expenses
  return `- ${m.month}: Ingresos ${m.income.toFixed(2)}€, Gastos ${m.expenses.toFixed(2)}€, Balance ${monthBalance.toFixed(2)}€`
}).join('\n')}

TAREAS:
1. Identifica INSIGHTS clave sobre patrones de gasto, presupuestos excedidos, gastos recurrentes innecesarios, oportunidades de ahorro
2. Analiza la tasa de ahorro y compárala con el estándar recomendado (20-30%)
3. Identifica la categoría donde más se gasta y evalúa si es razonable
4. Detecta gastos "hormiga" (pequeños gastos frecuentes que suman mucho)
5. Proporciona RECOMENDACIONES específicas y accionables con estimaciones realistas de ahorro

RESPONDE ÚNICAMENTE EN FORMATO JSON (sin markdown, sin \`\`\`json):

{
  "insights": [
    {
      "type": "budget_exceeded|recurring_expenses|spending_spike|category_analysis|savings_rate",
      "title": "Título claro y directo",
      "description": "Explicación detallada del hallazgo con números específicos",
      "impact": "high|medium|low",
      "category": "categoría si aplica o null",
      "amount": número_si_aplica o null
    }
  ],
  "recommendations": [
    {
      "title": "Título de la recomendación",
      "description": "Descripción específica y accionable de QUÉ hacer y CÓMO hacerlo. Incluye ejemplos concretos.",
      "potential_monthly_savings": número_realista,
      "potential_annual_savings": número_realista,
      "difficulty": "easy|medium|hard",
      "category": "categoría relacionada"
    }
  ]
}

IMPORTANTE:
- Proporciona entre 3-6 insights priorizados por impacto
- Proporciona entre 3-5 recomendaciones ordenadas por impacto potencial
- Todos los ahorros estimados deben ser REALISTAS y basados en los datos reales
- Las recomendaciones deben ser ESPECÍFICAS (no genéricas como "gasta menos")
- Considera el contexto español y la moneda en euros
- SOLO devuelve el JSON, sin texto adicional ni formato markdown`
}

function processAnalysisResult(result: any) {
  // Calcular totales
  const totalMonthlyPotential = result.recommendations?.reduce(
    (sum: number, rec: any) => sum + (rec.potential_monthly_savings || 0), 0
  ) || 0
  
  const totalAnnualPotential = result.recommendations?.reduce(
    (sum: number, rec: any) => sum + (rec.potential_annual_savings || 0), 0
  ) || 0

  return {
    insights: result.insights || [],
    recommendations: result.recommendations || [],
    total_monthly_potential: totalMonthlyPotential,
    total_annual_potential: totalAnnualPotential,
    analysis_date: new Date().toISOString()
  }
}
