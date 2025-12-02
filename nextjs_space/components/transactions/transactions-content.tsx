
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { formatDate, getTransactionColor } from '@/lib/utils-es'
import { Plus, Search, Edit, Trash2, Receipt, ArrowUpDown } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import TransactionModal from '@/components/transactions/transaction-modal'
import { useI18n } from '@/lib/i18n/context'

interface Transaction {
  id: string
  date: string
  amount: number
  type: 'ingreso' | 'gasto'
  description: string
  merchant?: string
  payment_method: string
  tags: string[]
  category: {
    name: string
  }
  account: {
    name: string
  }
}

export default function TransactionsContent() {
  const { t, formatCurrency } = useI18n()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    account: 'all',
    dateOrder: 'desc'
  })

  const transactionsPerPage = 20

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions')
      
      if (!response.ok) {
        throw new Error('Error al cargar las transacciones')
      }
      
      const data = await response.json()
      setTransactions(data.transactions || [])
      setFilteredTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: t.common.error,
        description: t.transactions.loadError,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filtro por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchLower) ||
        t.merchant?.toLowerCase()?.includes(searchLower) ||
        t.category.name.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    // Ordenar por fecha
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return filters.dateOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/transactions/${transactionToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la transacción')
      }

      toast({
        title: `✅ ${t.transactions.transactionDeleted}`,
        description: t.transactions.deleteSuccess,
        className: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      })

      // Cerrar el diálogo inmediatamente
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)

      // Recargar las transacciones
      fetchTransactions()
    } catch (error) {
      toast({
        title: `❌ ${t.common.error}`,
        description: t.transactions.deleteError,
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteTransaction = () => {
    setDeleteDialogOpen(false)
    setTransactionToDelete(null)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const handleTransactionSaved = () => {
    fetchTransactions()
    handleModalClose()
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, transactions])

  // Paginación
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)
  const startIndex = (currentPage - 1) * transactionsPerPage
  const endIndex = startIndex + transactionsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

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
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
            {t.transactions.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.transactions.subtitle}
          </p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.transactions.new}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t.transactions.search}
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            
            <Select 
              value={filters.type} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.transactions.allTypes}</SelectItem>
                <SelectItem value="ingreso">{t.transactions.income}</SelectItem>
                <SelectItem value="gasto">{t.transactions.expense}</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.dateOrder} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateOrder: value }))}
            >
              <SelectTrigger>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">{t.transactions.allTypes === 'All types' ? 'Most recent first' : 'Más recientes primero'}</SelectItem>
                <SelectItem value="asc">{t.transactions.allTypes === 'All types' ? 'Oldest first' : 'Más antiguos primero'}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {filteredTransactions.length} {filteredTransactions.length !== 1 ? t.dashboard.transactions : t.dashboard.transaction}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>{t.transactions.noTransactions}</CardTitle>
            <CardDescription>
              {transactions.length === 0 
                ? t.transactions.noTransactionsYet + ' ' + t.transactions.createFirstMessage
                : t.transactions.noResultsMessage
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t.transactions.createTransaction}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={transaction.type === 'ingreso' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {transaction.type === 'ingreso' ? t.transactions.income : t.transactions.expense}
                        </Badge>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <p className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'ingreso' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>📊 {transaction.category.name}</span>
                        <span>🏦 {transaction.account.name}</span>
                        {transaction.merchant && <span>🏪 {transaction.merchant}</span>}
                        <span className="capitalize">💳 {transaction.payment_method.replace('_', ' ')}</span>
                      </div>
                      {transaction.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {transaction.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            {t.transactions.allTypes === 'All types' ? 'Previous' : 'Anterior'}
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t.transactions.allTypes === 'All types' ? 'Page' : 'Página'} {currentPage} {t.transactions.of} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            {t.transactions.allTypes === 'All types' ? 'Next' : 'Siguiente'}
          </Button>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleTransactionSaved}
        transaction={editingTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.transactions.confirmDelete.split('?')[0]}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t.transactions.confirmDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteTransaction} disabled={isDeleting}>
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTransaction}
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
