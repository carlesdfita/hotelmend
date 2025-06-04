
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { RepairType } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

// Default repair types, can be overridden or extended via settings page
const initialRepairTypes: RepairType[] = ["Eléctrico", "Fontanería", "Carpintería", "Iluminación", "Climatización", "General"];

export default function RepairTypesPage() {
  const [repairTypes, setRepairTypes] = useState<RepairType[]>([]);
  const [newRepairType, setNewRepairType] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const storedRepairTypes = localStorage.getItem('repairTypes');
    if (storedRepairTypes) {
      setRepairTypes(JSON.parse(storedRepairTypes));
    } else {
      setRepairTypes(initialRepairTypes);
      localStorage.setItem('repairTypes', JSON.stringify(initialRepairTypes));
    }
  }, []);

  const handleAddRepairType = () => {
    if (newRepairType.trim() === '') {
      toast({
        title: "Error",
        description: "El nombre de la tipología no puede estar vacío.",
        variant: "destructive",
      });
      return;
    }
    if (repairTypes.map(rt => rt.toLowerCase()).includes(newRepairType.trim().toLowerCase())) {
       toast({
        title: "Error",
        description: "Esta tipología ya existe.",
        variant: "destructive",
      });
      return;
    }
    const updatedRepairTypes = [...repairTypes, newRepairType.trim() as RepairType];
    setRepairTypes(updatedRepairTypes);
    localStorage.setItem('repairTypes', JSON.stringify(updatedRepairTypes));
    setNewRepairType('');
    toast({
      title: "Éxito",
      description: `Tipología "${newRepairType.trim()}" añadida.`,
    });
  };

  const handleDeleteRepairType = (typeToDelete: RepairType) => {
    const updatedRepairTypes = repairTypes.filter(type => type !== typeToDelete);
    setRepairTypes(updatedRepairTypes);
    localStorage.setItem('repairTypes', JSON.stringify(updatedRepairTypes));
     toast({
      title: "Éxito",
      description: `Tipología "${typeToDelete}" eliminada.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Configurar Tipologías de Reparación</CardTitle>
        <CardDescription>Añada, edite o elimine los tipos de reparación disponibles en el sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <h3 className="text-lg font-semibold">Añadir Nueva Tipología</h3>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newRepairType}
              onChange={(e) => setNewRepairType(e.target.value)}
              placeholder="Ej: Jardinería, Pintura"
              className="max-w-sm"
            />
            <Button onClick={handleAddRepairType}>
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Tipología
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Listado de Tipologías Existentes</h3>
          {repairTypes.length === 0 ? (
            <p className="text-muted-foreground">No hay tipologías configuradas.</p>
          ) : (
            <ul className="space-y-2">
              {repairTypes.map((type) => (
                <li key={type} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <span className="font-medium">{type}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRepairType(type)} aria-label={`Eliminar ${type}`}>
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
