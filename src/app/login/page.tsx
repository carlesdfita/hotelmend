
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Hotel } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const HARDCODED_PASSWORD = "admin123"; // Per a fins de demostració

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Si l'usuari ja està autenticat, redirigir-lo a la pàgina principal
    if (localStorage.getItem('isAuthenticated') === 'true') {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    // Simular una petició de xarxa
    setTimeout(() => {
      if (password === HARDCODED_PASSWORD) {
        localStorage.setItem('isAuthenticated', 'true');
        toast({
          title: "Sessió Iniciada",
          description: "Benvingut/da de nou!",
        });
        router.replace('/');
      } else {
        toast({
          title: "Error d'Autenticació",
          description: "La contrasenya introduïda és incorrecta.",
          variant: "destructive",
        });
        setPassword('');
      }
      setIsLoading(false);
    }, 500);
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
          <p>Introdueix la contrasenya (admin123) per accedir.</p>
        </CardFooter>
      </Card>
      <footer className="text-center p-6 text-muted-foreground text-sm mt-8">
         HotelMend &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
