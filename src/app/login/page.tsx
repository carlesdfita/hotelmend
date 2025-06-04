
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel, KeyRound } from 'lucide-react'; // KeyRound para indicar algo relacionado con claves/admin
import { useToast } from "@/hooks/use-toast";

const REGULAR_USER_PASSWORD = "admin123"; // Contrasenya d'usuari regular predefinida
const SUPERADMIN_REDIRECT_PASSWORD = "superadmin123"; // Contrasenya que redirigeix a /admin

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Si l'usuari ja està autenticat (com a regular o superadmin), redirigir-lo
    if (localStorage.getItem('isAuthenticated') === 'true') {
      router.replace('/');
    } else if (localStorage.getItem('isSuperAdminAuthenticated') === 'true') {
      // No redirigimos desde aquí a /admin, el acceso a /admin se protege en su propia página.
      // Esto previene bucles si /admin redirige aquí y no hay flag de superadmin.
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (password === SUPERADMIN_REDIRECT_PASSWORD) {
      // Establecer un flag para que la página /admin sepa que el login fue exitoso
      // La página /admin verificará esta contraseña de nuevo o usará su propio estado
      // Por simplicidad, la página /admin tendrá su propio campo de contraseña.
      // Esta ruta solo redirige.
      localStorage.setItem('isSuperAdminAuthenticated', 'true'); // Este flag será usado por /admin
      localStorage.removeItem('isAuthenticated'); // Asegurar que no sea usuario normal
      toast({
        title: "Redirecció a Superadmin",
        description: "Seràs redirigit al panell de superadministrador.",
      });
      router.replace('/admin');
      setIsLoading(false);
      return;
    }

    if (password === REGULAR_USER_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.removeItem('isSuperAdminAuthenticated');
      toast({
        title: "Sessió Iniciada",
        description: "Benvingut/da de nou!",
      });
      router.replace('/');
      setIsLoading(false);
      return;
    }

    // Si no es superadmin ni el usuario regular, intentar validar como contraseña generada
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
          <p>Introdueix la contrasenya per accedir. (Ex: admin123 o una generada)</p>
        </CardFooter>
      </Card>
      <footer className="text-center p-6 text-muted-foreground text-sm mt-8">
         HotelMend &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
