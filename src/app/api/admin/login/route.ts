// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { isSuperAdminAuthenticatedGlobally } from '../../sharedState';

// Esta API es para que el panel /admin inicie sesión.
// La contraseña de superadmin está hardcodeada aquí.
const SUPERADMIN_PASSWORD = 'superadmin123';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === SUPERADMIN_PASSWORD) {
      // En un sistema real, aquí se crearía una sesión/token.
      // Para este prototipo, simplemente marcamos un estado global (con limitaciones).
      // O, más simple, el frontend /admin maneja su propio estado de login
      // y estas API confían en que son llamadas correctamente.
      // Para este caso, vamos a devolver un éxito y que el frontend maneje el estado.
      return NextResponse.json({ message: 'Login de Superadmin exitoso.', success: true }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Contraseña de Superadmin incorrecta.', success: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Error en la petición de login.', success: false }, { status: 400 });
  }
}
