// src/app/api/admin/generate-password/route.ts
import { NextResponse } from 'next/server';
import { accessPasswords } from '../../sharedState';

export async function POST(request: Request) {
  // En un escenari real, aquesta API estaria protegida,
  // verificant una sessió/token de superadmin.
  try {
    const body = await request.json().catch(() => ({})); // Gestiona cos buit o no JSON
    const manualPassword = body?.password;

    let newPassword;
    let message;

    if (manualPassword && typeof manualPassword === 'string' && manualPassword.trim() !== '') {
      const trimmedPassword = manualPassword.trim();
      if (accessPasswords.includes(trimmedPassword)) {
        return NextResponse.json(
          { message: 'Aquesta contrasenya ja existeix.', success: false },
          { status: 409 } // Conflicte
        );
      }
      newPassword = trimmedPassword;
      accessPasswords.push(newPassword);
      message = 'Contrasenya manual afegida correctament.';
    } else {
      // Genera una contrasenya aleatòria si no es proporciona una contrasenya manual
      newPassword = Math.random().toString(36).substring(2, 10);
      // Assegurar que la contrasenya generada no existeixi ja (molt improbable, però segur)
      while (accessPasswords.includes(newPassword)) {
        newPassword = Math.random().toString(36).substring(2, 10);
      }
      accessPasswords.push(newPassword);
      message = 'Nova contrasenya d\'accés generada.';
    }

    return NextResponse.json(
      { message, password: newPassword, success: true },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      { message: 'Error en processar la sol·licitud.', success: false },
      { status: 400 }
    );
  }
}
