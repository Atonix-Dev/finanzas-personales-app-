
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { useConfetti } from '@/hooks/use-confetti'
import { useI18n } from '@/lib/i18n/context'

interface Account {
  id: string
  name: string
  type: 'corriente' | 'credito' | 'efectivo' | 'ahorros'
  balance: number
  created_at: string
}

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  account?: Account | null
}

export default function AccountModal({ isOpen, onClose, onSave, account }: AccountModalProps) {
  const { t, formatCurrency } = useI18n()
  const { simpleConfetti } = useConfetti()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'corriente' as 'corriente' | 'credito' | 'efectivo' | 'ahorros',
    balance: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Translation helper
  const isEnglish = t.accounts.title === 'Accounts'

  // Dynamic account type labels
  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      corriente: t.accounts.corriente,
      credito: t.accounts.credito,
      efectivo: t.accounts.efectivo,
      ahorros: t.accounts.ahorros
    }
    return labels[type] || type
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'corriente',
      balance: ''
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = isEnglish ? 'Account name is required' : 'El nombre de la cuenta es requerido'
    }

    if (!formData.type) {
      newErrors.type = isEnglish ? 'Account type is required' : 'El tipo de cuenta es requerido'
    }

    if (formData.balance !== '' && isNaN(parseFloat(formData.balance))) {
      newErrors.balance = isEnglish ? 'Balance must be a valid number' : 'El balance debe ser un número válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const url = account ? `/api/accounts/${account.id}` : '/api/accounts'
      const method = account ? 'PUT' : 'POST'

      const requestBody: any = {
        name: formData.name.trim(),
        type: formData.type
      }

      // Solo incluir balance si se proporciona
      if (formData.balance !== '') {
        requestBody.balance = parseFloat(formData.balance)
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || (isEnglish ? 'Error saving account' : 'Error al guardar la cuenta'))
      }

      // ¡Lanzar confeti para nueva cuenta! 🎉
      if (!account) {
        simpleConfetti()
      }

      toast({
        title: account 
          ? `✅ ${isEnglish ? 'Account updated' : 'Cuenta actualizada'}`
          : `🎉 ${isEnglish ? 'Account created!' : '¡Cuenta creada!'}`,
        description: account 
          ? (isEnglish ? 'Account has been updated successfully' : 'La cuenta se ha actualizado correctamente')
          : (isEnglish ? 'Account has been created successfully' : 'La cuenta se ha creado correctamente'),
        className: !account ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : '',
      })

      onSave()
    } catch (error: any) {
      toast({
        title: `❌ ${t.common.error}`,
        description: error.message || (isEnglish ? 'Could not save account' : 'No se pudo guardar la cuenta'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (account) {
        // Editar cuenta existente
        setFormData({
          name: account.name,
          type: account.type,
          balance: account.balance.toString()
        })
      } else {
        resetForm()
      }
    }
  }, [isOpen, account])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {account 
              ? (isEnglish ? 'Edit Account' : 'Editar Cuenta')
              : (isEnglish ? 'New Account' : 'Nueva Cuenta')}
          </DialogTitle>
          <DialogDescription>
            {account 
              ? (isEnglish ? 'Modify your account data' : 'Modifica los datos de tu cuenta')
              : (isEnglish ? 'Create a new account to manage your finances' : 'Crea una nueva cuenta para gestionar tus finanzas')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">{isEnglish ? 'Account Name' : 'Nombre de la Cuenta'} *</Label>
            <Input
              id="name"
              placeholder={isEnglish ? 'Ex: Main Bank Account' : 'Ej: Cuenta Principal BBVA'}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>{t.accounts.type} *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: 'corriente' | 'credito' | 'efectivo' | 'ahorros') => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corriente">
                  🏦 {getAccountTypeLabel('corriente')}
                </SelectItem>
                <SelectItem value="credito">
                  💳 {getAccountTypeLabel('credito')}
                </SelectItem>
                <SelectItem value="efectivo">
                  💵 {getAccountTypeLabel('efectivo')}
                </SelectItem>
                <SelectItem value="ahorros">
                  🏛️ {getAccountTypeLabel('ahorros')}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">
              {isEnglish ? 'Initial Balance' : 'Balance Inicial'}
              {!account && <span className="text-gray-500 text-sm ml-1">({isEnglish ? 'optional' : 'opcional'})</span>}
            </Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
              className={errors.balance ? 'border-red-500' : ''}
            />
            {errors.balance && <p className="text-sm text-red-600">{errors.balance}</p>}
            {formData.balance && !isNaN(parseFloat(formData.balance)) && (
              <p className="text-sm text-gray-600">
                {formatCurrency(parseFloat(formData.balance))}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {account 
                ? (isEnglish 
                    ? 'Updating this value will change the current account balance'
                    : 'Actualizar este valor cambiará el balance actual de la cuenta')
                : (isEnglish 
                    ? 'You can set the initial account balance'
                    : 'Puedes establecer el balance inicial de la cuenta')
              }
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
              : (account 
                  ? (isEnglish ? 'Update' : 'Actualizar') 
                  : (isEnglish ? 'Create' : 'Crear'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
