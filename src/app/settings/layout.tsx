
"use client";

import AppHeader from '@/components/layout/app-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
