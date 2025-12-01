
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatEuro } from '@/lib/utils-es'
import { useI18n } from '@/lib/i18n/context'
import { 
  Brain, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  DollarSign,
  Calendar,
  RefreshCw,
  Info
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Insight {
  type: 'budget_exceeded' | 'recurring_expenses' | 'spending_spike' | 'category_analysis'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category?: string
  amount?: number
}

interface Recommendation {
  title: string
  description: string
  potential_monthly_savings: number
  potential_annual_savings: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

interface AnalysisResult {
  insights: Insight[]
  recommendations: Recommendation[]
  total_monthly_potential: number
  total_annual_potential: number
  analysis_date: string
}

export default function AnalysisContent() {
  const { t } = useI18n()
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(10)
    setAnalysisResult(null)

    try {
      console.log('🚀 Iniciando análisis financiero...')
      const response = await fetch('/api/analysis/financial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al ejecutar el análisis')
      }

      // Procesar la respuesta streaming
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No se pudo iniciar el análisis')
      }
      
      const decoder = new TextDecoder()
      let partialRead = ''
      let hasReceivedData = false

      console.log('📡 Procesando stream de respuesta...')

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('✅ Stream completado')
          if (!hasReceivedData) {
            throw new Error('No se recibieron datos del análisis')
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
              console.log('🏁 Análisis finalizado')
              setProgress(100)
              return
            }
            
            if (!data) continue
            
            try {
              const parsed = JSON.parse(data)
              console.log('📊 Datos recibidos:', parsed.status)
              hasReceivedData = true
              
              if (parsed.status === 'processing') {
                setProgress(prev => Math.min(prev + 5, 95))
              } else if (parsed.status === 'completed') {
                console.log('✅ Resultado del análisis recibido')
                setAnalysisResult(parsed.result)
                setProgress(100)
                toast({
                  title: `✅ ${t.analysis.analysisCompleted}`,
                  description: t.analysis.analysisReady,
                })
                return
              } else if (parsed.status === 'error') {
                console.error('❌ Error en el análisis:', parsed.message)
                throw new Error(parsed.message || t.analysis.analysisError)
              }
            } catch (e: any) {
              // Solo logear si es un error inesperado
              if (data.startsWith('{') && data.includes('status')) {
                console.error('❌ Error al parsear respuesta:', e.message)
                throw e
              }
            }
          }
        }
      }

    } catch (error: any) {
      console.error('❌ Error running analysis:', error)
      toast({
        title: `❌ ${t.analysis.analysisError}`,
        description: error.message || t.analysis.analysisErrorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsAnalyzing(false)
      setProgress(0)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'budget_exceeded':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'recurring_expenses':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'spending_spike':
        return <TrendingDown className="h-5 w-5 text-yellow-600" />
      case 'savings_rate':
        return <Target className="h-5 w-5 text-green-600" />
      case 'category_analysis':
        return <DollarSign className="h-5 w-5 text-purple-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getInsightColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t.analysis.difficultyEasy}</Badge>
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">{t.analysis.difficultyMedium}</Badge>
      default:
        return <Badge variant="destructive">{t.analysis.difficultyHard}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="h-8 w-8 mr-3 text-purple-600" />
            {t.analysis.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.analysis.subtitle}
          </p>
        </div>
        
        <Button onClick={runAnalysis} disabled={isAnalyzing} size="lg">
          {isAnalyzing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              {t.analysis.analyzing}
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              {t.analysis.analyzeButton}
            </>
          )}
        </Button>
      </div>

      {/* Disclaimer */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>{t.analysis.important}</strong> {t.analysis.disclaimer}
        </AlertDescription>
      </Alert>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              {t.analysis.analyzingData}
            </CardTitle>
            <CardDescription>
              {t.analysis.pleaseWait}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {progress < 30 && t.analysis.collectingData}
                {progress >= 30 && progress < 60 && t.analysis.analyzingPatterns}
                {progress >= 60 && progress < 90 && t.analysis.generatingRecommendations}
                {progress >= 90 && t.analysis.finalizing}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {t.analysis.insights}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {analysisResult.insights.length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t.analysis.insightsFound}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  {t.analysis.recommendations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {analysisResult.recommendations.length}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t.analysis.recommendedActions}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {t.analysis.monthlySavings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {formatEuro(analysisResult.total_monthly_potential)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t.analysis.estimatedPotential}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-indigo-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t.analysis.annualSavings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-700">
                  {formatEuro(analysisResult.total_annual_potential)}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t.analysis.yearProjection}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          {analysisResult.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                  {t.analysis.insightsAndFindings}
                </CardTitle>
                <CardDescription>
                  {t.analysis.patternsDetected}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.insights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 ${getInsightColor(insight.impact)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {insight.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {insight.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {insight.impact === 'high' ? 'Alto impacto' :
                               insight.impact === 'medium' ? 'Impacto medio' :
                               'Bajo impacto'}
                            </Badge>
                            {insight.amount && (
                              <Badge variant="secondary">
                                {formatEuro(insight.amount)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  {t.analysis.savingsRecommendations}
                </CardTitle>
                <CardDescription>
                  {t.analysis.concreteActions}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                            {recommendation.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {recommendation.description}
                          </p>
                        </div>
                        {getDifficultyBadge(recommendation.difficulty)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t.analysis.category}
                          </p>
                          <p className="font-medium">
                            {recommendation.category}
                          </p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t.analysis.estimatedMonthlySavings}
                          </p>
                          <p className="font-bold text-green-600">
                            {formatEuro(recommendation.potential_monthly_savings)}
                          </p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t.analysis.estimatedAnnualSavings}
                          </p>
                          <p className="font-bold text-blue-600">
                            {formatEuro(recommendation.potential_annual_savings)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Date */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Análisis realizado el {new Date(analysisResult.analysis_date).toLocaleString('es-ES')}
          </div>
        </>
      )}

      {/* Empty State */}
      {!analysisResult && !isAnalyzing && (
        <Card className="text-center py-12">
          <CardHeader>
            <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <CardTitle className="text-xl">Análisis Financiero con IA</CardTitle>
            <CardDescription className="max-w-2xl mx-auto">
              Nuestro asistente de inteligencia artificial analizará tus transacciones y presupuestos 
              para identificar patrones de gasto, detectar gastos excesivos y generar recomendaciones 
              personalizadas de ahorro con impacto estimado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Detecta Sobrepresupuestos</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Identifica categorías donde excediste tus límites
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Gastos Hormiga</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Encuentra pequeños gastos frecuentes que suman mucho
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Recomendaciones</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Obtén consejos concretos y accionables
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <DollarSign className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Impacto Estimado</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ve cuánto podrías ahorrar mensual y anualmente
                </p>
              </div>
            </div>
            
            <Button onClick={runAnalysis} size="lg">
              <Brain className="h-5 w-5 mr-2" />
              Comenzar Análisis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
