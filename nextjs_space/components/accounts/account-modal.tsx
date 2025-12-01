
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatEuro } from '@/lib/utils-es'
import { toast } from '@/hooks/use-toast'
import { useConfetti } from '@/hooks/use-confetti'

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

const accountTypeLabels = {
  corriente: 'Cuenta Corriente',
  credito: 'Tarjeta de Crédito',
  efectivo: 'Efectivo',
  ahorros: 'Cuenta de Ahorros'
}

export default function AccountModal({ isOpen, onClose, onSave, account }: AccountModalProps) {
  const { simpleConfetti } = useConfetti()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'corriente' as 'corriente' | 'credito' | 'efectivo' | 'ahorros',
    balance: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      newErrors.name = 'El nombre de la cuenta es requerido'
    }

    if (!formData.type) {
      newErrors.type = 'El tipo de cuenta es requerido'
    }

    if (formData.balance !== '' && isNaN(parseFloat(formData.balance))) {
      newErrors.balance = 'El balance debe ser un número válido'
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
        throw new Error(data.error || 'Error al guardar la cuenta')
      }

      // ¡Lanzar confeti para nueva cuenta! 🎉
      if (!account) {
        simpleConfetti()
      }

      toast({
        title: account ? '✅ Cuenta actualizada' : '🎉 ¡Cuenta creada!',
        description: account 
          ? 'La cuenta se ha actualizado correctamente'
          : 'La cuenta se ha creado correctamente',
        className: !account ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : '',
      })

      onSave()
    } catch (error: any) {
      toast({
        title: '❌ Error',
        description: error.message || 'No se pudo guardar la cuenta',
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
            {account ? 'Editar Cuenta' : 'Nueva Cuenta'}
          </DialogTitle>
          <DialogDescription>
            {account 
              ? 'Modifica los datos de tu cuenta'
              : 'Crea una nueva cuenta para gestionar tus finanzas'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Cuenta *</Label>
            <Input
              id="name"
              placeholder="Ej: Cuenta Principal BBVA"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo de Cuenta *</Label>
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
                  🏦 {accountTypeLabels.corriente}
                </SelectItem>
                <SelectItem value="credito">
                  💳 {accountTypeLabels.credito}
                </SelectItem>
                <SelectItem value="efectivo">
                  💵 {accountTypeLabels.efectivo}
                </SelectItem>
                <SelectItem value="ahorros">
                  🏛️ {accountTypeLabels.ahorros}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">
              Balance Inicial (€) 
              {!account && <span className="text-gray-500 text-sm ml-1">(opcional)</span>}
            </Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
              className={errors.balance ? 'border-red-500' : ''}
            />
            {errors.balance && <p className="text-sm text-red-600">{errors.balance}</p>}
            {formData.balance && !isNaN(parseFloat(formData.balance)) && (
              <p className="text-sm text-gray-600">
                {formatEuro(parseFloat(formData.balance))}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {account 
                ? 'Actualizar este valor cambiará el balance actual de la cuenta'
                : 'Puedes establecer el balance inicial de la cuenta'
              }
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : (account ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
