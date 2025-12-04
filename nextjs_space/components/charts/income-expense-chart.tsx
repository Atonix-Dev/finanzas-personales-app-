'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

interface IncomeExpenseChartProps {
  income: number
  expenses: number
  formatCurrency: (amount: number) => string
  language: 'es' | 'en'
}

export default function IncomeExpenseChart({ income, expenses, formatCurrency, language }: IncomeExpenseChartProps) {
  const isEnglish = language === 'en'
  
  const data = [
    {
      name: isEnglish ? 'Income' : 'Ingresos',
      amount: income,
      fill: '#10b981'
    },
    {
      name: isEnglish ? 'Expenses' : 'Gastos',
      amount: Math.abs(expenses),
      fill: '#ef4444'
    }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm" style={{ color: payload[0].payload.fill }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="name"
            tickLine={false}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            tickLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="amount" 
            radius={[4, 4, 0, 0]}
            fill="#60B5FF"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
