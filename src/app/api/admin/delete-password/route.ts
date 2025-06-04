// src/app/api/admin/delete-password/route.ts
import { NextResponse } from 'next/server';
import { accessPasswords } from '../../sharedState';

export async function POST(request: Request) {
  // En un escenari real, aquesta API estaria protegida.
  try {
    const { passwordToDelete } = await request.json();

    if (!passwordToDelete || typeof passwordToDelete !== 'string') {
      return NextResponse.json(
        { message: 'Cal proporcionar la contrasenya a eliminar.', success: false },
        { status: 400 }
      );
    }

    const index = accessPasswords.indexOf(passwordToDelete);
    if (index > -1) {
      accessPasswords.splice(index, 1);
      return NextResponse.json(
        { message: 'Contrasenya eliminada correctament.', success: true },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: 'La contrasenya especificada no s\'ha trobat.', success: false },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting password:", error);
    return NextResponse.json(
      { message: 'Error en processar la sol·licitud d\'eliminació.', success: false },
      { status: 500 }
    );
  }
}
