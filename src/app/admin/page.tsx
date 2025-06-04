// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ListChecks, LogOut, ShieldAlert, PlusCircle, Trash2 } from 'lucide-react';

const SUPERADMIN_LOGIN_PASSWORD = "superadmin123"; 

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([]);
  const [lastGeneratedPassword, setLastGeneratedPassword] = useState<string | null>(null);
  const [manualPasswordInput, setManualPasswordInput] = useState<string>('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
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
      setPasswordInput(''); 
    } else {
      toast({ title: "Error d'Accés", description: "Contrasenya de Superadmin incorrecta.", variant: "destructive" });
      setPasswordInput(''); 
    }
  };

  const handleSuperAdminLogout = () => {
    localStorage.removeItem('isSuperAdminAuthenticated');
    setIsLoggedIn(false);
    setGeneratedPasswords([]);
    setLastGeneratedPassword(null);
    setManualPasswordInput('');
    toast({ title: "Sessió de Superadmin Tancada" });
    router.push('/login'); 
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
      const response = await fetch('/api/admin/generate-password', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Cos buit per a generació aleatòria
      });
      if (response.ok) {
        const data = await response.json();
        setLastGeneratedPassword(data.password);
        toast({ title: "Contrasenya Generada", description: `Nova contrasenya: ${data.password}`});
        fetchGeneratedPasswords(); 
      } else {
        const errorData = await response.json();
        toast({ title: "Error al Generar Contrasenya", description: errorData.message || "No s'ha pogut generar la contrasenya.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de Xarxa", description: "No s'ha pogut connectar per generar la contrasenya.", variant: "destructive" });
    }
  };

  const handleManualAddPassword = async () => {
    if (localStorage.getItem('isSuperAdminAuthenticated') !== 'true') return;
    if (!manualPasswordInput.trim()) {
      toast({ title: "Error", description: "La contrasenya manual no pot estar buida.", variant: "destructive" });
      return;
    }
    setLastGeneratedPassword(null); 
    try {
      const response = await fetch('/api/admin/generate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: manualPasswordInput.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Contrasenya Afegida", description: data.message });
        setManualPasswordInput(''); 
        fetchGeneratedPasswords(); 
      } else {
         toast({ title: "Error a l'Afegir Contrasenya", description: data.message || "No s'ha pogut afegir la contrasenya.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de Xarxa", description: "No s'ha pogut connectar per afegir la contrasenya.", variant: "destructive" });
    }
  };

  const handleDeletePassword = async (passwordToDelete: string) => {
    if (localStorage.getItem('isSuperAdminAuthenticated') !== 'true') return;
    try {
      const response = await fetch('/api/admin/delete-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordToDelete }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Contrasenya Eliminada", description: `Contrasenya "${passwordToDelete}" eliminada.`});
        fetchGeneratedPasswords(); 
      } else {
        toast({ title: "Error a l'Eliminar", description: data.message || "No s'ha pogut eliminar la contrasenya.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de Xarxa", description: "No s'ha pogut connectar per eliminar la contrasenya.", variant: "destructive" });
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

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><KeyRound className="mr-2 h-6 w-6 text-primary"/>Generar Nova Contrasenya Aleatòria</CardTitle>
            <CardDescription>Crea una nova contrasenya aleatòria per a usuaris regulars.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGeneratePassword} className="w-full">
              Generar Contrasenya Aleatòria
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
            <CardTitle className="flex items-center"><PlusCircle className="mr-2 h-6 w-6 text-primary"/>Afegir Contrasenya Manualment</CardTitle>
            <CardDescription>Introdueix una contrasenya específica per a usuaris regulars.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="manual-password">Nova Contrasenya</Label>
              <Input
                id="manual-password"
                type="text"
                value={manualPasswordInput}
                onChange={(e) => setManualPasswordInput(e.target.value)}
                placeholder="Escriu la contrasenya manual"
                className="mt-1"
              />
            </div>
            <Button onClick={handleManualAddPassword} className="w-full">
              Afegir Contrasenya Manual
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary"/>Contrasenyes d'Accés Existents</CardTitle>
          <CardDescription>Aquestes són les contrasenyes que els usuaris poden utilitzar per accedir.</CardDescription>
        </CardHeader>
        <CardContent>
          {generatedPasswords.length > 0 ? (
            <ul className="space-y-2 max-h-96 overflow-y-auto p-1"> {/* Augmentat max-h */}
              {generatedPasswords.map((pwd, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-muted rounded-md font-mono text-sm shadow-sm">
                  <span>{pwd}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeletePassword(pwd)} aria-label={`Eliminar contrasenya ${pwd}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Encara no s'han generat o afegit contrasenyes d'accés.</p>
          )}
           <Button variant="outline" onClick={fetchGeneratedPasswords} className="mt-4 w-full">
              Actualitzar Llista
            </Button>
        </CardContent>
      </Card>
       <footer className="text-center p-6 text-muted-foreground text-sm mt-8 border-t">
         HotelMend &copy; {new Date().getFullYear()} - Panell de Superadministrador
      </footer>
    </div>
  );
}
