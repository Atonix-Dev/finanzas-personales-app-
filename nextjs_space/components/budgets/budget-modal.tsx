
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatMonthYear } from '@/lib/utils-es'
import { toast } from '@/hooks/use-toast'
import { useConfetti } from '@/hooks/use-confetti'
import { useI18n } from '@/lib/i18n/context'

interface Category {
  id: string
  name: string
}

interface Budget {
  id: string
  category_id: string
  month: string
  amount: number
  category: {
    name: string
  }
}

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  budget?: Budget | null
  defaultMonth: string
}

export default function BudgetModal({ isOpen, onClose, onSave, budget, defaultMonth }: BudgetModalProps) {
  const { t, formatCurrency } = useI18n()
  const { simpleConfetti } = useConfetti()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    category_id: '',
    month: '',
    amount: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Translation helper
  const isEnglish = t.budgets.title === 'Budgets'

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      category_id: '',
      month: defaultMonth,
      amount: ''
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category_id) {
      newErrors.category_id = isEnglish ? 'Category is required' : 'La categoría es requerida'
    }

    if (!formData.month) {
      newErrors.month = isEnglish ? 'Month is required' : 'El mes es requerido'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = isEnglish ? 'Amount must be greater than 0' : 'El monto debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const url = budget ? `/api/budgets/${budget.id}` : '/api/budgets'
      const method = budget ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: formData.category_id,
          month: formData.month,
          amount: parseFloat(formData.amount)
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || (isEnglish ? 'Error saving budget' : 'Error al guardar el presupuesto'))
      }

      // ¡Lanzar confeti para nuevo presupuesto! 🎉
      if (!budget) {
        simpleConfetti()
      }

      toast({
        title: budget 
          ? `✅ ${isEnglish ? 'Budget updated' : 'Presupuesto actualizado'}`
          : `🎉 ${isEnglish ? 'Budget created!' : '¡Presupuesto creado!'}`,
        description: budget 
          ? (isEnglish ? 'Budget has been updated successfully' : 'El presupuesto se ha actualizado correctamente')
          : (isEnglish ? 'Budget has been created successfully' : 'El presupuesto se ha creado correctamente'),
        className: !budget ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : '',
      })

      onSave()
    } catch (error: any) {
      toast({
        title: `❌ ${t.common.error}`,
        description: error.message || (isEnglish ? 'Could not save budget' : 'No se pudo guardar el presupuesto'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Generar opciones de meses (6 meses atrás hasta 6 meses adelante)
  const generateMonthOptions = () => {
    const options = []
    const now = new Date()
    
    for (let i = -6; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      options.push({
        value: monthStr,
        label: formatMonthYear(monthStr)
      })
    }
    
    return options
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      if (budget) {
        // Editar presupuesto existente
        setFormData({
          category_id: budget.category_id,
          month: budget.month,
          amount: budget.amount.toString()
        })
      } else {
        resetForm()
      }
    }
  }, [isOpen, budget, defaultMonth])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const monthOptions = generateMonthOptions()

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {budget 
              ? (isEnglish ? 'Edit Budget' : 'Editar Presupuesto')
              : (isEnglish ? 'New Budget' : 'Nuevo Presupuesto')}
          </DialogTitle>
          <DialogDescription>
            {budget 
              ? (isEnglish ? 'Modify the budget data' : 'Modifica los datos del presupuesto')
              : (isEnglish ? 'Create a new budget to control your expenses' : 'Crea un nuevo presupuesto para controlar tus gastos')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          {/* Mes */}
          <div className="space-y-2">
            <Label>{isEnglish ? 'Month' : 'Mes'} *</Label>
            <Select 
              value={formData.month} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, month: value }))}
            >
              <SelectTrigger className={errors.month ? 'border-red-500' : ''}>
                <SelectValue placeholder={isEnglish ? 'Select month' : 'Seleccionar mes'} />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.month && <p className="text-sm text-red-600">{errors.month}</p>}
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label>{t.budgets.amount} *</Label>
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
            {formData.amount && !isNaN(parseFloat(formData.amount)) && (
              <p className="text-sm text-gray-600">
                {formatCurrency(parseFloat(formData.amount))}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {isEnglish 
                ? 'This will be the maximum limit you plan to spend in this category during the selected month'
                : 'Este será el límite máximo que planeas gastar en esta categoría durante el mes seleccionado'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading 
              ? (isEnglish ? 'Saving...' : 'Guardando...') 
              : (budget 
                  ? (isEnglish ? 'Update' : 'Actualizar') 
                  : (isEnglish ? 'Create' : 'Crear'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
