// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ListChecks, LogOut, ShieldAlert } from 'lucide-react';

const SUPERADMIN_LOGIN_PASSWORD = "superadmin123"; // Contraseña para acceder a este panel

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [lastGeneratedPassword, setLastGeneratedPassword] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Comprobar si el superadmin ya está "logueado" en localStorage
    // Esto es una simpleza para el prototipo, en producción se usarían sesiones/tokens
    if (localStorage.getItem('isSuperAdminAuthenticated') === 'true') {
      setIsLoggedIn(true);
      fetchGeneratedPasswords();
    }
  }, []);

  const handleSuperAdminLogin = () => {
    if (passwordInput === SUPERADMIN_LOGIN_PASSWORD) {
      localStorage.setItem('isSuperAdminAuthenticated', 'true');
      setIsLoggedIn(true);
      fetchGeneratedPasswords();
      toast({ title: "Accés de Superadmin Concedit", description: "Ara pots gestionar les contrasenyes d'accés." });
      setPasswordInput(''); // Limpiar input
    } else {
      toast({ title: "Error d'Accés", description: "Contrasenya de Superadmin incorrecta.", variant: "destructive" });
      setPasswordInput(''); // Limpiar input
    }
  };

  const handleSuperAdminLogout = () => {
    localStorage.removeItem('isSuperAdminAuthenticated');
    setIsLoggedIn(false);
    setGeneratedPasswords([]);
    setLastGeneratedPassword(null);
    toast({ title: "Sessió de Superadmin Tancada" });
    router.push('/login'); // Opcional: redirigir a la pàgina de login principal
  };

  const fetchGeneratedPasswords = async () => {
    if (localStorage.getItem('isSuperAdminAuthenticated') !== 'true') return;
    try {
      const response = await fetch('/api/admin/list-passwords');
      if (response.ok) {
        const data = await response.json();
        setGeneratedPasswords(data.passwords || []);
      } else {
        const errorData = await response.json();
        toast({ title: "Error al Carregar Contrasenyes", description: errorData.message || "No s'han pogut obtenir les contrasenyes.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de Xarxa", description: "No s'ha pogut connectar per obtenir les contrasenyes.", variant: "destructive" });
    }
  };

  const handleGeneratePassword = async () => {
    if (localStorage.getItem('isSuperAdminAuthenticated') !== 'true') return;
    setLastGeneratedPassword(null);
    try {
      const response = await fetch('/api/admin/generate-password', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setLastGeneratedPassword(data.password);
        toast({ title: "Contrasenya Generada", description: `Nova contrasenya: ${data.password}`});
        fetchGeneratedPasswords(); // Actualizar la lista
      } else {
        const errorData = await response.json();
        toast({ title: "Error al Generar Contrasenya", description: errorData.message || "No s'ha pogut generar la contrasenya.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de Xarxa", description: "No s'ha pogut connectar per generar la contrasenya.", variant: "destructive" });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-headline text-foreground">Panell de Superadministrador</CardTitle>
            <CardDescription>Introdueix la contrasenya de superadministrador per continuar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="superadmin-password">Contrasenya de Superadmin</Label>
              <Input
                id="superadmin-password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Contrasenya secreta"
                className="mt-1"
              />
            </div>
            <Button onClick={handleSuperAdminLogin} className="w-full">Entrar al Panell</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-headline font-bold text-foreground">Panell de Superadministrador</h1>
        <Button variant="outline" onClick={handleSuperAdminLogout}>
          <LogOut className="mr-2 h-5 w-5" /> Tancar Sessió de Superadmin
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><KeyRound className="mr-2 h-6 w-6 text-primary"/>Generar Nova Contrasenya d'Accés</CardTitle>
            <CardDescription>Crea una nova contrasenya per a usuaris regulars de l'aplicació.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGeneratePassword} className="w-full">
              Generar Contrasenya
            </Button>
            {lastGeneratedPassword && (
              <p className="mt-4 text-center text-green-600 p-3 bg-green-100 rounded-md">
                Nova contrasenya generada: <strong className="font-mono">{lastGeneratedPassword}</strong>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary"/>Contrasenyes d'Accés Generades</CardTitle>
            <CardDescription>Aquestes són les contrasenyes que els usuaris poden utilitzar per accedir.</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedPasswords.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto p-1">
                {generatedPasswords.map((pwd, index) => (
                  <li key={index} className="p-3 bg-muted rounded-md font-mono text-sm shadow-sm">
                    {pwd}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Encara no s'han generat contrasenyes d'accés.</p>
            )}
             <Button variant="outline" onClick={fetchGeneratedPasswords} className="mt-4 w-full">
              Actualitzar Llista
            </Button>
          </CardContent>
        </Card>
      </div>
       <footer className="text-center p-6 text-muted-foreground text-sm mt-8 border-t">
         HotelMend &copy; {new Date().getFullYear()} - Panell de Superadministrador
      </footer>
    </div>
  );
}
