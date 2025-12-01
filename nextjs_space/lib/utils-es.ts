
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Formatear moneda en euros (formato español)
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

// Formatear número con separador de miles español
export function formatNumber(number: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

// Formatear fecha en formato español DD/MM/YYYY
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: es })
}

// Formatear fecha con hora
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: es })
}

// Formatear mes/año para presupuestos (ej: "enero 2024")
export function formatMonthYear(monthString: string): string {
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return format(date, 'MMMM yyyy', { locale: es })
}

// Obtener mes actual en formato YYYY-MM
export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Obtener últimos N meses en formato YYYY-MM
export function getLastNMonths(n: number): string[] {
  const months: string[] = []
  const now = new Date()
  
  for (let i = 0; i < n; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push(monthStr)
  }
  
  return months.reverse()
}

// Validar formato de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Calcular porcentaje con formato
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${Math.round(percentage)}%`
}

// Obtener color para el estado del presupuesto
export function getBudgetStatusColor(spent: number, budget: number): string {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0
  
  if (percentage >= 100) return 'text-red-600'
  if (percentage >= 80) return 'text-yellow-600'
  return 'text-green-600'
}

// Obtener clase de color para el tipo de transacción
export function getTransactionColor(type: 'ingreso' | 'gasto'): string {
  return type === 'ingreso' ? 'text-green-600' : 'text-red-600'
}

// Truncar texto con puntos suspensivos
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
