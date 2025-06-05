
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Importem les funcions de Firestore per a localitzacions
import { 
  getLocationsFromFirestore, 
  addLocationToFirestore, 
  deleteLocationFromFirestore, // Eliminació
  updateLocationInFirestore // Actualització (encara que no s'utilitzi directament a la UI actual)
} from '@/lib/firestoreService';

// Definim el tipus per als items de Firestore (Localització o Tipologia amb ID)
interface FirestoreItem {
  id: string;
  name: string;
}

export default function LocationsPage() {
  // Canviem l'estat per guardar objectes amb id i name
  const [locations, setLocations] = useState<FirestoreItem[]>([]);
  const [newLocation, setNewLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Funció per carregar les localitzacions des de Firestore
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const firestoreLocations = await getLocationsFromFirestore();
      setLocations(firestoreLocations);
    } catch (err) {
      console.error("Error fetching locations from Firestore:", err);
      if (err instanceof Error) {
        setError(`No s'han pogut carregar les ubicacions: ${err.message}`);
      } else {
        setError("No s'han pogut carregar les ubicacions a causa d'un error desconegut.");
      }
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carreguem les localitzacions en muntar el component
  useEffect(() => {
    fetchLocations();
  }, []);

  // Funció per afegir una nova localització a Firestore
  const handleAddLocation = async () => {
    if (newLocation.trim() === '') {
      toast({
        title: "Error",
        description: "El nom de la ubicació no pot estar buit.",
        variant: "destructive",
      });
      return;
    }
    // Comprovem si ja existeix (de manera insensible a majúscules/minúscules)
    if (locations.map(loc => loc.name.toLowerCase()).includes(newLocation.trim().toLowerCase())) {
       toast({
        title: "Error",
        description: "Aquesta ubicació ja existeix.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addLocationToFirestore(newLocation.trim());
      setNewLocation('');
      await fetchLocations(); // Recarreguem la llista després d'afegir
      toast({
        title: "Èxit",
        description: `Ubicació "${newLocation.trim()}" afegida.`,
      });
    } catch (err) {
       console.error("Error adding location to Firestore:", err);
        if (err instanceof Error) {
            setError(`No s'ha pogut afegir l'ubicació: ${err.message}`);
        } else {
            setError("No s'ha pogut afegir l'ubicació a causa d'un error desconegut.");
        }
        toast({
            title: "Error",
            description: "No s'ha pogut afegir la ubicació.",
            variant: "destructive",
        });
    }
  };

  // Funció per eliminar una localització de Firestore
  const handleDeleteLocation = async (locationId: string, locationName: string) => {
     try {
       await deleteLocationFromFirestore(locationId);
       await fetchLocations(); // Recarreguem la llista després d'eliminar
       toast({
         title: "Èxit",
         description: `Ubicació "${locationName}" eliminada.`,
       });
     } catch (err) {
       console.error("Error deleting location from Firestore:", err);
        if (err instanceof Error) {
            setError(`No s'ha pogut eliminar l'ubicació: ${err.message}`);
        } else {
            setError("No s'ha pogut eliminar l'ubicació a causa d'un error desconegut.");
        }
        toast({
            title: "Error",
            description: "No s'ha pogut eliminar la ubicació.",
            variant: "destructive",
        });
     }
  };

  if (isLoading) {
    return <div className="flex flex-col min-h-screen bg-background justify-center items-center"><p>Carregant ubicacions...</p></div>;
  }

   if (error) {
      return <div className="flex flex-col min-h-screen bg-background justify-center items-center"><p className="text-destructive">{error}</p></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configurar Ubicacions</CardTitle>
        <CardDescription>Afegiu o elimineu les ubicacions disponibles per a les incidències.</CardDescription>
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
              onKeyPress={(e) => { // Permet afegir prement Enter
                if (e.key === 'Enter') {
                  handleAddLocation();
                }
              }}
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
                // Utilitzem loc.id com a key i mostrem loc.name
                <li key={loc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span className="font-medium">{loc.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteLocation(loc.id, loc.name)} // Passem ID i nom per a la confirmació/missatge
                    aria-label={`Eliminar ${loc.name}`}
                  >
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
