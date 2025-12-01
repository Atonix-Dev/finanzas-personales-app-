
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Eliminar todos los datos relacionados en orden
    // (Prisma eliminará en cascada según el schema, pero por seguridad lo hacemos explícito)
    
    // 1. Eliminar transacciones
    await prisma.transaction.deleteMany({
      where: { user_id: userId },
    });

    // 2. Eliminar presupuestos
    await prisma.budget.deleteMany({
      where: { user_id: userId },
    });

    // 3. Eliminar cuentas bancarias del usuario
    await prisma.userAccount.deleteMany({
      where: { user_id: userId },
    });

    // 4. Eliminar categorías personalizadas del usuario
    await prisma.category.deleteMany({
      where: { user_id: userId },
    });

    // 5. Finalmente, eliminar el usuario (esto también eliminará Account y Session por cascada)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: 'Cuenta eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user account:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    );
  }
}
