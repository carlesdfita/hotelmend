// src/app/api/check-user-password/route.ts
import { NextResponse } from 'next/server';
import { accessPasswords } from '../sharedState';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (accessPasswords.includes(password)) {
      return NextResponse.json({ success: true, message: 'Contraseña de acceso válida.' });
    } else {
      return NextResponse.json({ success: false, message: 'Contraseña de acceso inválida.' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error al verificar la contraseña.' }, { status: 400 });
  }
}
