
"use client";

import AppHeader from '@/components/layout/app-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') !== 'true') {
      router.replace('/login');
    }
  }, [router]);

  if (!isClient || (typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') !== 'true')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p>Redirigint a la pàgina d'accés...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tornar a Incidències
            </Link>
          </Button>
        </div>
        {children}
      </main>
      <footer className="text-center p-6 text-muted-foreground text-sm border-t">
        HotelMend &copy; {new Date().getFullYear()} - Configuració
      </footer>
    </div>
  );
}
