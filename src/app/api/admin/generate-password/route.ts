// src/app/api/admin/generate-password/route.ts
import { NextResponse } from 'next/server';
import { accessPasswords, isSuperAdminAuthenticatedGlobally } from '../../sharedState';

export async function POST() {
  // En un escenario real, esta API estaría protegida,
  // verificando una sesión/token de superadmin.
  // Aquí, para simplificar, confiamos en que el frontend /admin solo la llama si el superadmin está logueado.
  // O podríamos comprobar isSuperAdminAuthenticatedGlobally, pero tiene limitaciones.

  const newPassword = Math.random().toString(36).substring(2, 10);
  accessPasswords.push(newPassword);

  return NextResponse.json(
    { message: 'Nueva contraseña de acceso generada.', password: newPassword, success: true },
    { status: 201 }
  );
}
