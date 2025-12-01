import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { rating, message, url, userAgent } = body;

    // Validación básica
    if (!rating && !message) {
      return NextResponse.json(
        { error: 'Se requiere calificación o mensaje' },
        { status: 400 }
      );
    }

    // Guardar feedback en la base de datos
    // Por ahora, registramos en logs y enviamos webhook a n8n

    const feedbackData = {
      userId: session?.user?.id || 'anonymous',
      userEmail: session?.user?.email || 'anonymous',
      rating,
      message,
      url,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    console.log('📝 New Feedback:', feedbackData);

    // Guardar en base de datos
    await prisma.feedback.create({
      data: {
        user_id: session?.user?.id || null,
        rating,
        message,
        url,
        user_agent: userAgent,
      },
    });

    // Enviar webhook a n8n si está configurado
    if (process.env.N8N_WEBHOOK_URL_FEEDBACK) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL_FEEDBACK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData),
        });
      } catch (webhookError) {
        console.error('Error sending to n8n:', webhookError);
        // No fallar si el webhook falla
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recibido correctamente',
    });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Error al procesar el feedback' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
