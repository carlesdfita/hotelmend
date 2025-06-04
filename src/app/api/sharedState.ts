// src/app/api/sharedState.ts

// Lista de contraseñas de acceso (EN MEMORIA - NO PERSISTENTE entre reinicios del servidor)
// NOTA: En una aplicación real, esto DEBERÍA estar en una base de datos
export const accessPasswords: string[] = [];

// Estado de autenticación del superadmin en memoria del servidor API
// (simplificación para prototipo, se perderá con reinicios del servidor)
export let isSuperAdminAuthenticatedGlobally = false;
