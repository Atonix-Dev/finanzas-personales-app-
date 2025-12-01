
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { updateUserSettingsSchema, validateAndSanitize, formatValidationError } from '@/lib/security/validation';
import { logAudit, getRequestMetadata } from '@/lib/security/audit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Obtener o crear configuración
    let settings = await prisma.userSettings.findUnique({
      where: { user_id: userId },
    });

    if (!settings) {
      // Crear configuración por defecto
      settings = await prisma.userSettings.create({
        data: {
          user_id: userId,
          language: 'es',
          currency: 'EUR',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validar entrada
    const validated = validateAndSanitize(updateUserSettingsSchema, body);

    // Actualizar o crear configuración
    const settings = await prisma.userSettings.upsert({
      where: { user_id: userId },
      update: validated,
      create: {
        user_id: userId,
        ...validated,
        language: validated.language || 'es',
        currency: validated.currency || 'EUR',
      },
    });

    // Registrar auditoría (sin fallar si hay error)
    try {
      const metadata = getRequestMetadata(req);
      await logAudit({
        userId,
        action: 'update',
        entity: 'settings',
        entityId: settings.id,
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
    }

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: formatValidationError(error) },
        { status: 400 }
      );
    }

    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}
