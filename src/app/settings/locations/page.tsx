
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const initialLocations: string[] = ["Recepció Vestíbul", "Cuina Principal", "Gimnàs", "Piscina"];


export default function LocationsPage() {
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const storedLocations = localStorage.getItem('locations');
    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    } else {
      setLocations(initialLocations); 
      localStorage.setItem('locations', JSON.stringify(initialLocations));
    }
  }, []);

  const handleAddLocation = () => {
    if (newLocation.trim() === '') {
      toast({
        title: "Error",
        description: "El nom de la ubicació no pot estar buit.",
        variant: "destructive",
      });
      return;
    }
    if (locations.map(loc => loc.toLowerCase()).includes(newLocation.trim().toLowerCase())) {
       toast({
        title: "Error",
        description: "Aquesta ubicació ja existeix.",
        variant: "destructive",
      });
      return;
    }
    const updatedLocations = [...locations, newLocation.trim()];
    setLocations(updatedLocations);
    localStorage.setItem('locations', JSON.stringify(updatedLocations));
    setNewLocation('');
    toast({
      title: "Èxit",
      description: `Ubicació "${newLocation.trim()}" afegida.`,
    });
  };

  const handleDeleteLocation = (locationToDelete: string) => {
    const updatedLocations = locations.filter(loc => loc !== locationToDelete);
    setLocations(updatedLocations);
    localStorage.setItem('locations', JSON.stringify(updatedLocations));
    toast({
      title: "Èxit",
      description: `Ubicació "${locationToDelete}" eliminada.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configurar Ubicacions</CardTitle>
        <CardDescription>Afegiu, editeu o elimineu les ubicacions predefinides per a les incidències.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Afegir Nova Ubicació</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Ex: Habitació 101, Saló A"
              className="max-w-sm"
            />
            <Button onClick={handleAddLocation}>
              <PlusCircle className="mr-2 h-4 w-4" /> Afegir Ubicació
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Llistat d'Ubicacions Existents</h3>
          {locations.length === 0 ? (
            <p className="text-muted-foreground">No hi ha ubicacions configurades.</p>
          ) : (
            <ul className="space-y-2">
              {locations.map((loc) => (
                <li key={loc} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span className="font-medium">{loc}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteLocation(loc)} aria-label={`Eliminar ${loc}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
