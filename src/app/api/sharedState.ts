// src/app/api/sharedState.ts

// Estendre la interfície NodeJS.Global per incloure les nostres propietats personalitzades
declare global {
  // Utilitzant var per evitar problemes d'àmbit de bloc amb declaracions globals
  // eslint-disable-next-line no-var
  var __accessPasswords: string[] | undefined;
  // eslint-disable-next-line no-var
  var __isSuperAdminAuthenticatedGlobally: boolean | undefined;
}

// Inicialitzar accessPasswords a l'objecte global si no existeix
if (process.env.NODE_ENV === 'production') {
  // En producció, començar sempre amb un array buit per a cada nova instància
  global.__accessPasswords = [];
} else {
  // En desenvolupament, intentar reutilitzar si existeix, altrament inicialitzar
  if (!global.__accessPasswords) {
    global.__accessPasswords = [];
  }
}
export const accessPasswords: string[] = global.__accessPasswords;


// Inicialitzar isSuperAdminAuthenticatedGlobally a l'objecte global
if (process.env.NODE_ENV === 'production') {
    global.__isSuperAdminAuthenticatedGlobally = false;
} else {
    // Comprovar específicament per a booleà per si ja existeix però és undefined
    if (typeof global.__isSuperAdminAuthenticatedGlobally !== 'boolean') {
        global.__isSuperAdminAuthenticatedGlobally = false;
    }
}
// Aquesta variable no s'utilitza efectivament per protegir les API actualment,
// el frontend confia en localStorage per a les seves pròpies comprovacions.
export let isSuperAdminAuthenticatedGlobally: boolean = global.__isSuperAdminAuthenticatedGlobally;

// Funció d'ajuda per actualitzar-la si és necessari, encara que actualment no es crida.
export function setGlobalSuperAdminAuthenticated(status: boolean): void {
  global.__isSuperAdminAuthenticatedGlobally = status;
  isSuperAdminAuthenticatedGlobally = status; // Mantenir el let exportat sincronitzat
}
