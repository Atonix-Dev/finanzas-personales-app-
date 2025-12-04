'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDate, getCurrentMonth } from '@/lib/utils-es'
import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Target,
  RefreshCw,
  Store
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import MonthlyChart from '@/components/charts/monthly-chart'
import ExpenseCategoryChart from '@/components/charts/expense-category-chart'
import IncomeExpenseChart from '@/components/charts/income-expense-chart'
import { useI18n } from '@/lib/i18n/context'

interface DashboardData {
  currentMonth: {
    totalIncome: number
    totalExpenses: number
    balance: number
  }
  accounts: Array<{
    id: string
    name: string
    type: string
    balance: number
  }>
  topMerchants: Array<{
    merchant: string
    totalAmount: number
    transactionCount: number
  }>
  monthlyData: Array<{
    month: string
    income: number
    expenses: number
  }>
  expensesByCategory: Array<{
    category: string
    amount: number
    percentage: number
  }>
  budgetAlerts: Array<{
    category: string
    spent: number
    budget: number
    percentage: number
  }>
}

export default function DashboardContent() {
  const { t, formatCurrency, language } = useI18n()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    dateRange: 'current-month',
    accounts: 'all',
    categories: 'all'
  })

  const formatMonthYear = (monthString: string) => {
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' })
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const response = await fetch(`/api/dashboard?${params}`)
      
      if (!response.ok) {
        throw new Error(t.dashboard.errorLoadingData)
      }
      
      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: t.common.error,
        description: t.dashboard.loadError,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [filters])

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 md:p-6">
        <Card className="text-center py-8 md:py-12">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{t.dashboard.noDataAvailable}</CardTitle>
            <CardDescription>
              {t.dashboard.noDataDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchDashboardData} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t.dashboard.retry}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t.dashboard.title}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
            {t.dashboard.subtitle}
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">{t.dashboard.currentMonth}</SelectItem>
              <SelectItem value="last-3-months">{t.dashboard.last3Months}</SelectItem>
              <SelectItem value="last-6-months">{t.dashboard.last6Months}</SelectItem>
              <SelectItem value="current-year">{t.dashboard.currentYear}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t.dashboard.update}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
              {t.dashboard.income}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl md:text-2xl font-bold text-green-700">
              {formatCurrency(data.currentMonth.totalIncome)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formatMonthYear(getCurrentMonth())}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-red-600 flex items-center">
              <TrendingDown className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
              {t.dashboard.expenses}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl md:text-2xl font-bold text-red-700">
              {formatCurrency(data.currentMonth.totalExpenses)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {formatMonthYear(getCurrentMonth())}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-blue-600 flex items-center">
              <Target className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
              {t.dashboard.balance}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-xl md:text-2xl font-bold ${
              data.currentMonth.balance >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatCurrency(data.currentMonth.balance)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {data.currentMonth.balance >= 0 ? t.dashboard.surplus : t.dashboard.deficit}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-xs md:text-sm font-medium text-purple-600 flex items-center">
              <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 flex-shrink-0" />
              {t.dashboard.accounts}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl md:text-2xl font-bold text-purple-700">
              {data.accounts.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t.dashboard.activeAccounts}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {data.budgetAlerts.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <Target className="h-5 w-5 mr-2" />
              {t.dashboard.budgetAlerts}
            </CardTitle>
            <CardDescription>
              {t.dashboard.budgetAlertsDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.budgetAlerts.map((alert) => (
                <div key={alert.category} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {alert.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(alert.spent)} {language === 'en' ? 'of' : 'de'} {formatCurrency(alert.budget)}
                    </p>
                  </div>
                  <Badge variant={alert.percentage >= 100 ? 'destructive' : 'outline'}>
                    {Math.round(alert.percentage)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
            <CardTitle className="text-base md:text-lg">{t.dashboard.monthlyEvolution}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t.dashboard.monthlyEvolutionDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
            <MonthlyChart data={data.monthlyData} formatCurrency={formatCurrency} language={language} />
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
            <CardTitle className="text-base md:text-lg">{t.dashboard.expensesByCategory}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t.dashboard.expensesByCategoryDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
            <ExpenseCategoryChart data={data.expensesByCategory} formatCurrency={formatCurrency} language={language} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Income vs Expenses */}
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
            <CardTitle className="text-base md:text-lg">{t.dashboard.incomeVsExpenses}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t.dashboard.incomeVsExpensesDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
            <IncomeExpenseChart 
              income={data.currentMonth.totalIncome}
              expenses={data.currentMonth.totalExpenses}
              formatCurrency={formatCurrency}
              language={language}
            />
          </CardContent>
        </Card>

        {/* Top Merchants */}
        <Card>
          <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
            <CardTitle className="text-base md:text-lg flex items-center">
              <Store className="h-4 w-4 md:h-5 md:w-5 mr-2 flex-shrink-0" />
              {t.dashboard.topMerchants}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t.dashboard.topMerchantsDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
            <div className="space-y-3 md:space-y-4">
              {data.topMerchants.length > 0 ? (
                data.topMerchants.map((merchant, index) => (
                  <div key={merchant.merchant} className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-semibold text-blue-600 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">
                          {merchant.merchant}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {merchant.transactionCount} {merchant.transactionCount !== 1 ? t.dashboard.transactions : t.dashboard.transaction}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm md:text-base text-red-600">
                        {formatCurrency(merchant.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 md:py-8">
                  <Store className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                    {t.dashboard.noMerchantsData}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Summary */}
      <Card>
        <CardHeader className="px-4 pt-4 pb-2 md:px-6 md:pt-6">
          <CardTitle className="text-base md:text-lg">{t.dashboard.accountsSummary}</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t.dashboard.accountsSummaryDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {data.accounts.length > 0 ? (
              data.accounts.map((account) => (
                <div key={account.id} className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h4 className="font-medium text-sm md:text-base text-gray-900 dark:text-white truncate">
                      {account.name}
                    </h4>
                    <Badge variant="outline" className="capitalize text-xs flex-shrink-0">
                      {account.type}
                    </Badge>
                  </div>
                  <p className={`text-base md:text-lg font-semibold ${
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6 md:py-8">
                <CreditCard className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                  {t.dashboard.noAccountsYet}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
