
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Plus, CreditCard, Edit, Trash2, Wallet } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import AccountModal from '@/components/accounts/account-modal'
import { useI18n } from '@/lib/i18n/context'

interface Account {
  id: string
  name: string
  type: 'corriente' | 'credito' | 'efectivo' | 'ahorros'
  balance: number
  created_at: string
}

const accountTypeIcons = {
  corriente: '🏦',
  credito: '💳',
  efectivo: '💵',
  ahorros: '🏛️'
}

export default function AccountsContent() {
  const { t, formatCurrency } = useI18n()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Dynamic account type labels based on current language
  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      corriente: t.accounts.corriente,
      credito: t.accounts.credito,
      efectivo: t.accounts.efectivo,
      ahorros: t.accounts.ahorros
    }
    return labels[type] || type
  }

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts')
      
      if (!response.ok) {
        throw new Error('Error al cargar las cuentas')
      }
      
      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast({
        title: t.common.error,
        description: t.accounts.noAccounts,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = (id: string) => {
    setAccountToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/accounts/${accountToDelete}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar la cuenta')
      }

      toast({
        title: `✅ ${t.accounts.accountDeleted}`,
        description: t.accounts.accountDeleted,
        className: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      })

      // Cerrar el diálogo inmediatamente
      setDeleteDialogOpen(false)
      setAccountToDelete(null)

      // Recargar las cuentas
      fetchAccounts()
    } catch (error: any) {
      toast({
        title: `❌ ${t.common.error}`,
        description: error.message || t.common.error,
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteAccount = () => {
    setDeleteDialogOpen(false)
    setAccountToDelete(null)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAccount(null)
  }

  const handleAccountSaved = () => {
    fetchAccounts()
    handleModalClose()
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const positiveBalance = accounts
    .filter(account => account.balance > 0)
    .reduce((sum, account) => sum + account.balance, 0)
  const negativeBalance = accounts
    .filter(account => account.balance < 0)
    .reduce((sum, account) => sum + Math.abs(account.balance), 0)

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
              <div key={i} className="h-40 bg-gray-200 rounded animate-pulse"></div>
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
            {t.accounts.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t.accounts.subtitle}
          </p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.accounts.new}
        </Button>
      </div>

      {/* Summary Cards */}
      {accounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600 flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                {t.accounts.totalBalance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(totalBalance)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                {t.accounts.title === 'Accounts' ? 'Assets' : 'Activos'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(positiveBalance)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                {t.accounts.title === 'Accounts' ? 'Liabilities' : 'Pasivos'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                {formatCurrency(negativeBalance)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <CardTitle>{t.accounts.noAccounts}</CardTitle>
            <CardDescription>
              {t.accounts.createFirst}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.accounts.createAccount}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {accountTypeIcons[account.type]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {getAccountTypeLabel(account.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAccount(account)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t.accounts.balance}
                    </p>
                    <p className={`text-2xl font-bold ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t.accounts.type}
                      </span>
                      <span className="font-medium">
                        {getAccountTypeLabel(account.type)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleAccountSaved}
        account={editingAccount}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.accounts.confirmDelete.split('?')[0]}?</AlertDialogTitle>
            <AlertDialogDescription>
              {t.accounts.confirmDelete}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteAccount} disabled={isDeleting}>
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAccount}
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
