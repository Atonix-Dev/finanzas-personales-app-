import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Obtener cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id,
      },
      include: {
        projects: {
          orderBy: { created_at: 'desc' },
        },
        invoices: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el cliente pertenece al usuario
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, type, tax_id, email, phone, address, city, postal_code, country, notes } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre es obligatorio' },
        { status: 400 }
      );
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        type: type || 'particular',
        tax_id: tax_id?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        postal_code: postal_code?.trim() || null,
        country: country || 'España',
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el cliente pertenece al usuario
    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id,
      },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar si tiene facturas
    if (existingClient._count.invoices > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cliente con facturas asociadas' },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 }
    );
  }
}
