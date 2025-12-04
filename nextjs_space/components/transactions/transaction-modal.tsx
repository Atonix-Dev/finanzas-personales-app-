
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useConfetti } from '@/hooks/use-confetti'
import { useI18n } from '@/lib/i18n/context'

interface Category {
  id: string
  name: string
}

interface Account {
  id: string
  name: string
  type: string
}

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

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  transaction?: Transaction | null
}

export default function TransactionModal({ isOpen, onClose, onSave, transaction }: TransactionModalProps) {
  const { t, formatCurrency } = useI18n()
  const { simpleConfetti } = useConfetti()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newTag, setNewTag] = useState('')

  // Translation helper
  const isEnglish = t.transactions.title === 'Transactions'

  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    type: 'gasto' as 'ingreso' | 'gasto',
    description: '',
    category_id: '',
    account_id: '',
    payment_method: 'efectivo',
    merchant: '',
    tags: [] as string[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const fetchData = async () => {
    try {
      const [categoriesRes, accountsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/accounts')
      ])

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json()
        setAccounts(accountsData.accounts || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'gasto',
      description: '',
      category_id: '',
      account_id: '',
      payment_method: 'efectivo',
      merchant: '',
      tags: []
    })
    setErrors({})
    setNewTag('')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) newErrors.date = isEnglish ? 'Date is required' : 'La fecha es requerida'
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = isEnglish ? 'Amount must be greater than 0' : 'El importe debe ser mayor a 0'
    }
    if (!formData.description.trim()) newErrors.description = isEnglish ? 'Description is required' : 'La descripción es requerida'
    if (!formData.category_id) newErrors.category_id = isEnglish ? 'Category is required' : 'La categoría es requerida'
    if (!formData.account_id) newErrors.account_id = isEnglish ? 'Account is required' : 'La cuenta es requerida'

    // Validar fecha no futura
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (selectedDate > today) {
      newErrors.date = isEnglish ? 'Date cannot be in the future' : 'La fecha no puede ser futura'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions'
      const method = transaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || (isEnglish ? 'Error saving transaction' : 'Error al guardar la transacción'))
      }

      // ¡Lanzar confeti para nueva transacción! 🎉
      if (!transaction) {
        simpleConfetti()
      }

      toast({
        title: transaction 
          ? `✅ ${isEnglish ? 'Transaction updated' : 'Transacción actualizada'}`
          : `🎉 ${isEnglish ? 'Transaction created!' : '¡Transacción creada!'}`,
        description: transaction 
          ? (isEnglish ? 'Transaction has been updated successfully' : 'La transacción se ha actualizado correctamente')
          : (isEnglish ? 'Transaction has been created successfully' : 'La transacción se ha creado correctamente'),
        className: !transaction ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : '',
      })

      onSave()
    } catch (error: any) {
      toast({
        title: `❌ ${t.common.error}`,
        description: error.message || (isEnglish ? 'Could not save transaction' : 'No se pudo guardar la transacción'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  useEffect(() => {
    if (isOpen) {
      fetchData()
      if (transaction) {
        // Editar transacción existente
        setFormData({
          date: transaction.date.split('T')[0],
          amount: Math.abs(transaction.amount).toString(),
          type: transaction.type,
          description: transaction.description,
          category_id: '', // Se llenará cuando carguen las categorías
          account_id: '', // Se llenará cuando carguen las cuentas
          payment_method: transaction.payment_method,
          merchant: transaction.merchant || '',
          tags: transaction.tags
        })
      } else {
        resetForm()
      }
    }
  }, [isOpen, transaction])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction 
              ? (isEnglish ? 'Edit Transaction' : 'Editar Transacción')
              : (isEnglish ? 'New Transaction' : 'Nueva Transacción')}
          </DialogTitle>
          <DialogDescription>
            {transaction 
              ? (isEnglish ? 'Modify the transaction data' : 'Modifica los datos de la transacción')
              : (isEnglish ? 'Record a new transaction in your account' : 'Registra una nueva transacción en tu cuenta')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>{isEnglish ? 'Type' : 'Tipo'} *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'ingreso' | 'gasto') => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">{t.transactions.income}</SelectItem>
                <SelectItem value="gasto">{t.transactions.expense}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label>{isEnglish ? 'Date' : 'Fecha'} *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* Importe */}
          <div className="space-y-2">
            <Label>{isEnglish ? 'Amount' : 'Importe'} *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
            {formData.amount && (
              <p className="text-sm text-gray-600">
                {formatCurrency(parseFloat(formData.amount) || 0)}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label>{isEnglish ? 'Category' : 'Categoría'} *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={isEnglish ? 'Select category' : 'Seleccionar categoría'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && <p className="text-sm text-red-600">{errors.category_id}</p>}
          </div>

          {/* Cuenta */}
          <div className="space-y-2">
            <Label>{isEnglish ? 'Account' : 'Cuenta'} *</Label>
            <Select 
              value={formData.account_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
            >
              <SelectTrigger className={errors.account_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={isEnglish ? 'Select account' : 'Seleccionar cuenta'} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account_id && <p className="text-sm text-red-600">{errors.account_id}</p>}
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label>{isEnglish ? 'Payment Method' : 'Método de Pago'}</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">{isEnglish ? 'Cash' : 'Efectivo'}</SelectItem>
                <SelectItem value="tarjeta_debito">{isEnglish ? 'Debit Card' : 'Tarjeta de Débito'}</SelectItem>
                <SelectItem value="tarjeta_credito">{isEnglish ? 'Credit Card' : 'Tarjeta de Crédito'}</SelectItem>
                <SelectItem value="transferencia">{isEnglish ? 'Transfer' : 'Transferencia'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label>{isEnglish ? 'Description' : 'Descripción'} *</Label>
          <Input
            placeholder={isEnglish ? 'Ex: Grocery shopping' : 'Ej: Compra en supermercado'}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Comercio */}
        <div className="space-y-2">
          <Label>{isEnglish ? 'Merchant' : 'Comercio'}</Label>
          <Input
            placeholder={isEnglish ? 'Ex: Walmart, Amazon, etc.' : 'Ej: Mercadona, Amazon, etc.'}
            value={formData.merchant}
            onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
          />
        </div>

        {/* Etiquetas */}
        <div className="space-y-2">
          <Label>{isEnglish ? 'Tags' : 'Etiquetas'}</Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder={isEnglish ? 'Add tag' : 'Añadir etiqueta'}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button type="button" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading 
              ? (isEnglish ? 'Saving...' : 'Guardando...') 
              : (transaction 
                  ? (isEnglish ? 'Update' : 'Actualizar') 
                  : (isEnglish ? 'Create' : 'Crear'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
