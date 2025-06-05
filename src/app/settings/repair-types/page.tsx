
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { RepairType } from '@/lib/types'; // Mantenim la importació del tipus si es fa servir en un altre lloc, però aquí usarem l'objecte FirestoreItem
import { useToast } from "@/hooks/use-toast";
// Ja no necessitem defaultRepairTypes ni localStorage un cop usem Firestore
// import { defaultRepairTypes } from '@/lib/types';

// Importem les funcions de Firestore per a tipologies de reparació
import { 
  getRepairTypesFromFirestore, 
  addRepairTypeToFirestore, 
  deleteRepairTypeFromFirestore, // Eliminació
  updateRepairTypeInFirestore // Actualització (encara que no s'utilitzi directament a la UI actual)
} from '@/lib/firestoreService';

// Definim el tipus per als items de Firestore (Localització o Tipologia amb ID)
interface FirestoreItem {
  id: string;
  name: string;
}

export default function RepairTypesPage() {
  // Canviem l'estat per guardar objectes amb id i name
  const [repairTypes, setRepairTypes] = useState<FirestoreItem[]>([]);
  const [newRepairType, setNewRepairType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Funció per carregar les tipologies des de Firestore
  const fetchRepairTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const firestoreRepairTypes = await getRepairTypesFromFirestore();
      setRepairTypes(firestoreRepairTypes);
    } catch (err) {
      console.error("Error fetching repair types from Firestore:", err);
      if (err instanceof Error) {
        setError(`No s'han pogut carregar les tipologies de reparació: ${err.message}`);
      } else {
        setError("No s'han pogut carregar les tipologies de reparació a causa d'un error desconegut.");
      }
      setRepairTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carreguem les tipologies en muntar el component
  useEffect(() => {
    fetchRepairTypes();
  }, []);

  // Funció per afegir una nova tipologia a Firestore
  const handleAddRepairType = async () => {
    if (newRepairType.trim() === '') {
      toast({
        title: "Error",
        description: "El nom de la tipologia no pot estar buit.",
        variant: "destructive",
      });
      return;
    }
    // Comprovem si ja existeix (de manera insensible a majúscules/minúscules)
    if (repairTypes.map(type => type.name.toLowerCase()).includes(newRepairType.trim().toLowerCase())) {
       toast({
        title: "Error",
        description: "Aquesta tipologia ja existeix.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addRepairTypeToFirestore(newRepairType.trim());
      setNewRepairType('');
      await fetchRepairTypes(); // Recarreguem la llista després d'afegir
      toast({
        title: "Èxit",
        description: `Tipologia "${newRepairType.trim()}" afegida.`,
      });
    } catch (err) {
       console.error("Error adding repair type to Firestore:", err);
        if (err instanceof Error) {
            setError(`No s'ha pogut afegir la tipologia: ${err.message}`);
        } else {
            setError("No s'ha pogut afegir la tipologia a causa d'un error desconegut.");
        }
        toast({
            title: "Error",
            description: "No s'ha pogut afegir la tipologia.",
            variant: "destructive",
        });
    }
  };

  // Funció per eliminar una tipologia de Firestore
  const handleDeleteRepairType = async (typeId: string, typeName: string) => {
     try {
       await deleteRepairTypeFromFirestore(typeId);
       await fetchRepairTypes(); // Recarreguem la llista després d'eliminar
       toast({
         title: "Èxit",
         description: `Tipologia "${typeName}" eliminada.`,
       });
     } catch (err) {
       console.error("Error deleting repair type from Firestore:", err);
        if (err instanceof Error) {
            setError(`No s'ha pogut eliminar la tipologia: ${err.message}`);
        } else {
            setError("No s'ha pogut eliminar la tipologia a causa d'un error desconegut.");
        }
         toast({
            title: "Error",
            description: "No s'ha pogut eliminar la tipologia.",
            variant: "destructive",
        });
     }
  };

  if (isLoading) {
    return <div className="flex flex-col min-h-screen bg-background justify-center items-center"><p>Carregant tipologies de reparació...</p></div>;
  }

   if (error) {
      return <div className="flex flex-col min-h-screen bg-background justify-center items-center"><p className="text-destructive">{error}</p></div>;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configurar Tipologies de Reparació</CardTitle>
        <CardDescription>Afegiu o elimineu els tipus de reparació disponibles al sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Afegir Nova Tipologia</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newRepairType}
              onChange={(e) => setNewRepairType(e.target.value)}
              placeholder="Ex: Jardineria, Pintura"
              className="max-w-sm"
               onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddRepairType();
                }
              }}
            />
            <Button onClick={handleAddRepairType}>
              <PlusCircle className="mr-2 h-4 w-4" /> Afegir Tipologia
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Llistat de Tipologies Existents</h3>
          {repairTypes.length === 0 ? (
            <p className="text-muted-foreground">No hi ha tipologies configurades.</p>
          ) : (
            <ul className="space-y-2">
              {repairTypes.map((type) => (
                 // Utilitzem type.id com a key i mostrem type.name
                <li key={type.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span className="font-medium">{type.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteRepairType(type.id, type.name)} // Passem ID i nom per a la confirmació/missatge
                    aria-label={`Eliminar ${type.name}`}
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
