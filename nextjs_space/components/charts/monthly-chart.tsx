'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface MonthlyData {
  month: string
  income: number
  expenses: number
}

interface MonthlyChartProps {
  data: MonthlyData[]
  formatCurrency: (amount: number) => string
  language: 'es' | 'en'
}

export default function MonthlyChart({ data, formatCurrency, language }: MonthlyChartProps) {
  const isEnglish = language === 'en'
  
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>{isEnglish ? 'No data to display' : 'No hay datos para mostrar'}</p>
      </div>
    )
  }

  // Formatear mes según idioma
  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'es-ES', { month: 'short' })
  }

  const incomeLabel = isEnglish ? 'income' : 'ingresos'
  const expensesLabel = isEnglish ? 'expenses' : 'gastos'

  const chartData = data.map(item => ({
    month: formatMonth(item.month),
    [incomeLabel]: item.income,
    [expensesLabel]: Math.abs(item.expenses)
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === incomeLabel ? (isEnglish ? 'Income' : 'Ingresos') : (isEnglish ? 'Expenses' : 'Gastos')}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="month" 
            tickLine={false}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            tickLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line 
            type="monotone" 
            dataKey={incomeLabel}
            name={isEnglish ? 'Income' : 'Ingresos'}
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey={expensesLabel}
            name={isEnglish ? 'Expenses' : 'Gastos'}
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
