
/**
 * Rate Limiter para prevenir ataques de fuerza bruta
 * Almacena intentos en memoria (en producción considerar Redis)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpieza periódica cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Ventana de tiempo en ms
  max: number; // Máximo de requests
}

export const rateLimitConfigs = {
  auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 intentos cada 15 min
  api: { windowMs: 60 * 1000, max: 60 }, // 60 requests por minuto
  sensitive: { windowMs: 60 * 1000, max: 10 }, // 10 requests por minuto para operaciones sensibles
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // Nueva ventana
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.max - 1, resetAt };
  }

  if (entry.count >= config.max) {
    // Límite excedido
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  // Incrementar contador
  entry.count++;
  store.set(key, entry);
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

export function getRateLimitIdentifier(req: Request, prefix: string): string {
  // Intentar obtener IP real
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `${prefix}:${ip}`;
}
