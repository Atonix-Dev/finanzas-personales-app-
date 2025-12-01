
import { z } from 'zod';

/**
 * Esquemas de validación para todas las entradas de usuario
 * Previene inyección y asegura integridad de datos
 */

// Validación de Email
export const emailSchema = z.string().email('Email inválido').max(255);

// Validación de Contraseña
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

// Validación de Nombre
export const nameSchema = z
  .string()
  .min(1, 'El nombre es requerido')
  .max(100, 'El nombre es demasiado largo')
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, 'El nombre contiene caracteres inválidos');

// Validación de Monto
export const amountSchema = z
  .number()
  .positive('El monto debe ser positivo')
  .max(999999999.99, 'El monto es demasiado grande')
  .finite('El monto debe ser un número válido');

// Validación de Descripción
export const descriptionSchema = z
  .string()
  .min(1, 'La descripción es requerida')
  .max(500, 'La descripción es demasiado larga')
  .trim();

// Validación de ID
export const idSchema = z.string().cuid('ID inválido');

// Validación de Fecha
export const dateSchema = z.string().datetime('Fecha inválida');

// Esquemas para Transacciones
export const createTransactionSchema = z.object({
  account_id: idSchema,
  date: dateSchema,
  amount: amountSchema,
  currency: z.enum(['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'MXN', 'BRL']),
  category_id: idSchema,
  description: descriptionSchema,
  type: z.enum(['ingreso', 'gasto']),
  payment_method: z.enum(['efectivo', 'tarjeta_debito', 'tarjeta_credito', 'transferencia']),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  merchant: z.string().max(200).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

// Esquemas para Cuentas
export const createAccountSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  type: z.enum(['corriente', 'credito', 'efectivo', 'ahorros']),
  balance: amountSchema.optional().default(0),
});

export const updateAccountSchema = createAccountSchema.partial();

// Esquemas para Presupuestos
export const createBudgetSchema = z.object({
  category_id: idSchema,
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato de mes inválido (YYYY-MM)'),
  amount: amountSchema,
});

export const updateBudgetSchema = createBudgetSchema.partial().omit({ month: true, category_id: true });

// Esquemas para Categorías
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
});

export const updateCategorySchema = createCategorySchema;

// Esquema para Configuración de Usuario
export const updateUserSettingsSchema = z.object({
  language: z.enum(['es', 'en', 'pt', 'fr', 'de']).optional(),
  currency: z.enum(['EUR', 'USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'MXN', 'BRL']).optional(),
});

// Función helper para validar y sanitizar
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Función para manejar errores de validación
export function formatValidationError(error: z.ZodError): string {
  return error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
}
