
import { prisma } from '@/lib/db';

/**
 * Sistema de Auditoría para registrar acciones importantes
 */

export async function logAudit(params: {
  userId: string;
  action: string;
  entity?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: params.userId,
        action: params.action,
        entity: params.entity,
        entity_id: params.entityId,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
      },
    });
  } catch (error) {
    // No fallar la operación principal si el log falla
    console.error('Error logging audit:', error);
  }
}

export function getRequestMetadata(req: Request): { ip: string; userAgent: string } {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return { ip, userAgent };
}
