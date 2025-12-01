
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatEuro } from '@/lib/utils-es'
import { X, Plus } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useConfetti } from '@/hooks/use-confetti'

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
  const { simpleConfetti } = useConfetti()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newTag, setNewTag] = useState('')

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

    if (!formData.date) newErrors.date = 'La fecha es requerida'
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'El importe debe ser mayor a 0'
    }
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida'
    if (!formData.category_id) newErrors.category_id = 'La categoría es requerida'
    if (!formData.account_id) newErrors.account_id = 'La cuenta es requerida'

    // Validar fecha no futura
    const selectedDate = new Date(formData.date)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    if (selectedDate > today) {
      newErrors.date = 'La fecha no puede ser futura'
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
        throw new Error(errorData.error || 'Error al guardar la transacción')
      }

      // ¡Lanzar confeti para nueva transacción! 🎉
      if (!transaction) {
        simpleConfetti()
      }

      toast({
        title: transaction ? '✅ Transacción actualizada' : '🎉 ¡Transacción creada!',
        description: transaction 
          ? 'La transacción se ha actualizado correctamente'
          : 'La transacción se ha creado correctamente',
        className: !transaction ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : '',
      })

      onSave()
    } catch (error: any) {
      toast({
        title: '❌ Error',
        description: error.message || 'No se pudo guardar la transacción',
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
            {transaction ? 'Editar Transacción' : 'Nueva Transacción'}
          </DialogTitle>
          <DialogDescription>
            {transaction 
              ? 'Modifica los datos de la transacción'
              : 'Registra una nueva transacción en tu cuenta'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'ingreso' | 'gasto') => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingreso">Ingreso</SelectItem>
                <SelectItem value="gasto">Gasto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha *</Label>
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
            <Label>Importe (€) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
            {formData.amount && (
              <p className="text-sm text-gray-600">
                {formatEuro(parseFloat(formData.amount) || 0)}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label>Categoría *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar categoría" />
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
            <Label>Cuenta *</Label>
            <Select 
              value={formData.account_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
            >
              <SelectTrigger className={errors.account_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar cuenta" />
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
            <Label>Método de Pago</Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="tarjeta_debito">Tarjeta de Débito</SelectItem>
                <SelectItem value="tarjeta_credito">Tarjeta de Crédito</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label>Descripción *</Label>
          <Input
            placeholder="Ej: Compra en supermercado"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={errors.description ? 'border-red-500' : ''}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Comercio */}
        <div className="space-y-2">
          <Label>Comercio</Label>
          <Input
            placeholder="Ej: Mercadona, Amazon, etc."
            value={formData.merchant}
            onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
          />
        </div>

        {/* Etiquetas */}
        <div className="space-y-2">
          <Label>Etiquetas</Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Añadir etiqueta"
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
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : (transaction ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
