
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { formatMonthYear, getCurrentMonth, getLastNMonths, formatDate } from '@/lib/utils-es'
import { Plus, Target, Edit, Trash2, AlertTriangle, CheckCircle, XCircle, Receipt } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import BudgetModal from '@/components/budgets/budget-modal'
import { useI18n } from '@/lib/i18n/context'

interface Budget {
  id: string
  category_id: string
  month: string
  amount: number
  spent: number
  remaining: number
  percentage: number
  status: 'ok' | 'warning' | 'exceeded'
  category: {
    name: string
  }
}

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category: {
    name: string
  }
  account: {
    name: string
  }
}

export default function BudgetsContent() {
  const { t, formatCurrency } = useI18n()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [budgetTransactions, setBudgetTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Obtener últimos 6 meses para el selector
  const availableMonths = getLastNMonths(6).concat([
    getCurrentMonth(),
    // Próximos 2 meses
    ...Array.from({ length: 2 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() + i + 1)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
  ]).filter((value, index, self) => self.indexOf(value) === index)

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/budgets?month=${selectedMonth}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar los presupuestos')
      }
      
      const data = await response.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast({
        title: t.common.error,
        description: t.budgets.noBudgets,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBudget = (id: string) => {
    setBudgetToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteBudget = async () => {
    if (!budgetToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/budgets/${budgetToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el presupuesto')
      }

      toast({
        title: `✅ ${t.budgets.budgetDeleted}`,
        description: t.budgets.budgetDeleted,
        className: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      })

      // Cerrar el diálogo inmediatamente
      setDeleteDialogOpen(false)
      setBudgetToDelete(null)

      // Recargar los presupuestos
      fetchBudgets()
    } catch (error) {
      toast({
        title: `❌ ${t.common.error}`,
        description: t.common.error,
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteBudget = () => {
    setDeleteDialogOpen(false)
    setBudgetToDelete(null)
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingBudget(null)
  }

  const handleBudgetSaved = () => {
    fetchBudgets()
    handleModalClose()
  }

  const handleViewBudgetDetails = async (budget: Budget) => {
    setSelectedBudget(budget)
    setIsTransactionsModalOpen(true)
    setLoadingTransactions(true)
    
    try {
      // Obtener inicio y fin del mes
      const [year, month] = budget.month.split('-')
      const startDate = `${year}-${month}-01`
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      const endDate = `${year}-${month}-${lastDay}`
      
      const response = await fetch(
        `/api/transactions?category_id=${budget.category_id}&start_date=${startDate}&end_date=${endDate}&type=expense`
      )
      
      if (!response.ok) {
        throw new Error('Error al cargar las transacciones')
      }
      
      const data = await response.json()
      setBudgetTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching budget transactions:', error)
      toast({
        title: t.common.error,
        description: t.transactions.loadError,
        variant: 'destructive',
      })
    } finally {
      setLoadingTransactions(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      default:
        return 'text-green-600'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  useEffect(() => {
    fetchBudgets()
  }, [selectedMonth])

  // Estadísticas del mes
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0)
  const budgetsExceeded = budgets.filter(b => b.status === 'exceeded').length
  const budgetsWarning = budgets.filter(b => b.status === 'warning').length

  // Translation helper
  const isEnglish = t.budgets.title === 'Budgets'

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mt-2 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.budgets.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.budgets.subtitle}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {formatMonthYear(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t.budgets.new}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                {isEnglish ? 'Total Budget' : 'Presupuesto Total'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(totalBudget)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                {isEnglish ? 'Total Spent' : 'Total Gastado'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {formatCurrency(totalSpent)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                {isEnglish ? 'Available' : 'Disponible'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(totalRemaining)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-600">
                {isEnglish ? 'Status' : 'Estado'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {budgetsExceeded > 0 && (
                  <div className="text-sm text-red-600">
                    {budgetsExceeded} {isEnglish ? 'exceeded' : 'excedido' + (budgetsExceeded !== 1 ? 's' : '')}
                  </div>
                )}
                {budgetsWarning > 0 && (
                  <div className="text-sm text-yellow-600">
                    {budgetsWarning} {isEnglish ? 'in alert' : 'en alerta'}
                  </div>
                )}
                {budgetsExceeded === 0 && budgetsWarning === 0 && (
                  <div className="text-sm text-green-600">
                    {isEnglish ? 'All under control' : 'Todo bajo control'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>{t.budgets.noBudgets} {formatMonthYear(selectedMonth)}</CardTitle>
            <CardDescription>
              {t.budgets.createFirst}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.budgets.createBudget}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(budget.status)}
                    <div>
                      <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatMonthYear(budget.month)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditBudget(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {isEnglish ? 'Progress' : 'Progreso'}
                    </span>
                    <span className={`font-medium ${getStatusColor(budget.status)}`}>
                      {budget.percentage}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, budget.percentage)} 
                    className="h-2"
                  />
                </div>

                {/* Amounts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.budgets.amount}:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.budgets.spent}:
                    </span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t.budgets.remaining}:
                    </span>
                    <span className={`font-medium ${budget.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(budget.remaining)}
                    </span>
                  </div>
                </div>

                {/* Status Button */}
                <Button
                  variant={budget.status === 'exceeded' ? 'destructive' : budget.status === 'warning' ? 'outline' : 'default'}
                  className="w-full"
                  onClick={() => handleViewBudgetDetails(budget)}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {budget.status === 'exceeded' 
                    ? (isEnglish ? 'View Exceeded Expenses' : 'Ver Gastos Excedidos')
                    : budget.status === 'warning' 
                    ? (isEnglish ? 'View Expenses' : 'Ver Gastos')
                    : (isEnglish ? 'Within Budget' : 'Dentro del Presupuesto')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleBudgetSaved}
        budget={editingBudget}
        defaultMonth={selectedMonth}
      />

      {/* Transactions Modal */}
      <Dialog open={isTransactionsModalOpen} onOpenChange={setIsTransactionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBudget?.category.name} - {selectedBudget && formatMonthYear(selectedBudget.month)}
            </DialogTitle>
            <DialogDescription>
              {isEnglish 
                ? 'Transactions for this category in the selected period'
                : 'Transacciones de esta categoría en el período seleccionado'}
            </DialogDescription>
          </DialogHeader>
          
          {loadingTransactions ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : budgetTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {isEnglish
                  ? 'No transactions recorded for this category this month'
                  : 'No hay transacciones registradas para esta categoría en este mes'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t.budgets.spent}</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(selectedBudget?.spent || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{isEnglish ? 'Of' : 'De'} {formatCurrency(selectedBudget?.amount || 0)}</p>
                  <p className={`text-lg font-semibold ${
                    (selectedBudget?.remaining || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(selectedBudget?.remaining || 0) > 0 
                      ? (isEnglish ? 'Left ' : 'Quedan ')
                      : (isEnglish ? 'Exceeded ' : 'Excedido ')}
                    {formatCurrency(Math.abs(selectedBudget?.remaining || 0))}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {budgetTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">{transaction.description}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {transaction.account.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">
                        -{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.budgets.confirmDelete.split('?')[0]}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t.budgets.confirmDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteBudget} disabled={isDeleting}>
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteBudget}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {t.common.loading}
                </>
              ) : (
                t.common.yes + ', ' + t.common.delete.toLowerCase()
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
