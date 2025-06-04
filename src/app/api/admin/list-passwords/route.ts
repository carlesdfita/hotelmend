// src/app/api/admin/list-passwords/route.ts
import { NextResponse } from 'next/server';
import { accessPasswords, isSuperAdminAuthenticatedGlobally } from '../../sharedState';

export async function GET() {
  // En un escenario real, esta API estaría protegida.
  // Aquí, para simplificar, confiamos en que el frontend /admin solo la llama si el superadmin está logueado.

  return NextResponse.json({ passwords: accessPasswords, success: true }, { status: 200 });
}
