"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, KeyRound, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const REGULAR_USER_PASSWORD = "admin123"; // Contrasenya d'usuari regular predefinida (backup)
const SUPERADMIN_REDIRECT_PASSWORD = process.env.NEXT_PUBLIC_SUPERADMIN_REDIRECT_PASSWORD;

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordWarning, setShowPasswordWarning] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!SUPERADMIN_REDIRECT_PASSWORD || SUPERADMIN_REDIRECT_PASSWORD === "superadmin123_default_local" || SUPERADMIN_REDIRECT_PASSWORD === "superadmin123_change_me") {
      setShowPasswordWarning(true);
    }

    if (localStorage.getItem('isAuthenticated') === 'true') {
      router.replace('/');
    } else if (localStorage.getItem('isSuperAdminAuthenticated') === 'true') {
      // No redirigim a /admin des d'aquí, ja que /admin té la seva pròpia protecció
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!SUPERADMIN_REDIRECT_PASSWORD) {
      toast({
        title: "Error de Configuració",
        description: "La contrasenya de superadministrador no està configurada per a la redirecció.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password === SUPERADMIN_REDIRECT_PASSWORD) {
      localStorage.setItem('isSuperAdminAuthenticated', 'true');
      localStorage.removeItem('isAuthenticated');
      toast({
        title: "Redirecció a Superadmin",
        description: "Seràs redirigit al panell de superadministrador.",
      });
      router.replace('/admin');
      setIsLoading(false);
      return;
    }

    // Comprovació de la contrasenya regular predefinida (backup)
    if (password === REGULAR_USER_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.removeItem('isSuperAdminAuthenticated');
      toast({
        title: "Sessió Iniciada (Contrasenya Predeterminada)",
        description: "Benvingut/da de nou!",
      });
      router.replace('/');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/check-user-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.removeItem('isSuperAdminAuthenticated');
        toast({
          title: "Sessió Iniciada",
          description: "Accés concedit amb contrasenya d'accés.",
        });
        router.replace('/');
      } else {
        toast({
          title: "Error d'Autenticació",
          description: data.message || "La contrasenya introduïda és incorrecta.",
          variant: "destructive",
        });
        setPassword('');
      }
    } catch (error) {
      toast({
        title: "Error de Xarxa",
        description: "No s'ha pogut connectar per verificar la contrasenya.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  if (showPasswordWarning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl font-headline text-destructive">Error de Configuració de Seguretat</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-center text-destructive-foreground bg-destructive p-3 rounded-md">
              La contrasenya de superadministrador per defecte encara està activa o no està configurada correctament a les variables d'entorn.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Per favor, estableix les variables d'entorn `NEXT_PUBLIC_SUPERADMIN_LOGIN_PASSWORD`, `NEXT_PUBLIC_SUPERADMIN_REDIRECT_PASSWORD`, i `SUPERADMIN_API_PASSWORD` amb valors segurs abans d'utilitzar el panell d'administració en producció. Consulta el fitxer `.env` per a més detalls.
            </p>
             <Button onClick={() => setShowPasswordWarning(false)} className="w-full mt-6">Entès, anar a Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Hotel className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">HotelMend</CardTitle>
          <CardDescription>Gestió d'Incidències Simplificada</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Contrasenya</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introdueix la teva contrasenya"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verificant...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Introdueix la contrasenya per accedir.</p>
        </CardFooter>
      </Card>
      <footer className="text-center p-6 text-muted-foreground text-sm mt-8">
         HotelMend &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}