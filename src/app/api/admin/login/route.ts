// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { isSuperAdminAuthenticatedGlobally } from '../../sharedState';

const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_API_PASSWORD;

export async function POST(request: Request) {
  try {
    if (!SUPERADMIN_PASSWORD) {
      console.error("SUPERADMIN_API_PASSWORD no está configurada en las variables de entorno.");
      return NextResponse.json({ message: 'Error de configuració del servidor.', success: false }, { status: 500 });
    }

    const { password } = await request.json();

    if (password === SUPERADMIN_PASSWORD) {
      return NextResponse.json({ message: 'Login de Superadmin exitoso.', success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Contrasenya de Superadmin incorrecta.', success: false }, { status: 401 });
    }
  } catch (error) {
    console.error("Error en la petició de login d'admin:", error);
    return NextResponse.json({ message: 'Error en la petició de login.', success: false }, { status: 400 });
  }
}