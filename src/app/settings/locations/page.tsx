"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Simulate fetching initial data or use a default set for example purposes
const initialLocations: string[] = ["Recepción Vestíbulo", "Cocina Principal", "Gimnasio", "Piscina"];


export default function LocationsPage() {
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, you might fetch this from a DB or localStorage
    const storedLocations = localStorage.getItem('locations');
    if (storedLocations) {
      setLocations(JSON.parse(storedLocations));
    } else {
      setLocations(initialLocations); // Default locations if none stored
      localStorage.setItem('locations', JSON.stringify(initialLocations));
    }
  }, []);

  const handleAddLocation = () => {
    if (newLocation.trim() === '') {
      toast({
        title: "Error",
        description: "El nombre de la ubicación no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }
    if (locations.map(loc => loc.toLowerCase()).includes(newLocation.trim().toLowerCase())) {
       toast({
        title: "Error",
        description: "Esta ubicación ya existe.",
        variant: "destructive",
      });
      return;
    }
    const updatedLocations = [...locations, newLocation.trim()];
    setLocations(updatedLocations);
    localStorage.setItem('locations', JSON.stringify(updatedLocations));
    setNewLocation('');
    toast({
      title: "Éxito",
      description: `Ubicación "${newLocation.trim()}" añadida.`,
    });
  };

  const handleDeleteLocation = (locationToDelete: string) => {
     if (initialLocations.map(loc => loc.toLowerCase()).includes(locationToDelete.toLowerCase())) {
      toast({
        title: "Acción no permitida",
        description: `La ubicación "${locationToDelete}" es una ubicación base y no se puede eliminar.`,
        variant: "destructive",
      });
      return;
    }
    const updatedLocations = locations.filter(loc => loc !== locationToDelete);
    setLocations(updatedLocations);
    localStorage.setItem('locations', JSON.stringify(updatedLocations));
    toast({
      title: "Éxito",
      description: `Ubicación "${locationToDelete}" eliminada.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configurar Ubicaciones</CardTitle>
        <CardDescription>Añada, edite o elimine las ubicaciones predefinidas para las incidencias.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Añadir Nueva Ubicación</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="Ej: Habitación 101, Salón A"
              className="max-w-sm"
            />
            <Button onClick={handleAddLocation}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ubicación
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Listado de Ubicaciones Existentes</h3>
          {locations.length === 0 ? (
            <p className="text-muted-foreground">No hay ubicaciones configuradas.</p>
          ) : (
            <ul className="space-y-2">
              {locations.map((loc) => (
                <li key={loc} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span className="font-medium">{loc}</span>
                   {!initialLocations.map(l => l.toLowerCase()).includes(loc.toLowerCase()) && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLocation(loc)} aria-label={`Eliminar ${loc}`}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
