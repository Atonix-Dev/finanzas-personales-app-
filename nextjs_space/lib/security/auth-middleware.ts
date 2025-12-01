
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Middleware de autenticación para proteger rutas API
 */

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: 'No autorizado. Por favor inicia sesión.' },
        { status: 401 }
      ),
      session: null,
    };
  }
  
  return { error: null, session };
}

export async function requireAuthWithRateLimit(identifier: string, config: any) {
  const authResult = await requireAuth();
  if (authResult.error) return authResult;
  
  // Aquí se podría agregar rate limiting adicional
  
  return authResult;
}
