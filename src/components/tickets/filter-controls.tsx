
"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RepairType, TicketStatus, ImportanceLevel } from "@/lib/types";
import { defaultRepairTypes, ticketStatuses, importanceLevels as allImportanceLevels } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, ListFilter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from 'react';


interface FilterControlsProps {
  filters: {
    repairType: RepairType[];
    location: string[];
    status: TicketStatus[];
    importance: ImportanceLevel[];
  };
  onFilterChange: (filters: FilterControlsProps["filters"]) => void;
}

export default function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
  const [availableRepairTypes, setAvailableRepairTypes] = useState<RepairType[]>(defaultRepairTypes);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  useEffect(() => {
    const storedRepairTypes = localStorage.getItem('repairTypes');
    if (storedRepairTypes) {
      setAvailableRepairTypes(JSON.parse(storedRepairTypes));
    } else {
        localStorage.setItem('repairTypes', JSON.stringify(defaultRepairTypes));
    }
    const storedLocations = localStorage.getItem('locations');
    if (storedLocations) {
      setAvailableLocations(JSON.parse(storedLocations));
    } else {
        const defaultLocations = ["Recepción Vestíbulo", "Cocina Principal", "Gimnasio", "Piscina", "Habitación 305"];
        localStorage.setItem('locations', JSON.stringify(defaultLocations));
        setAvailableLocations(defaultLocations);
    }
  }, []);
  
  const handleResetFilters = () => {
    onFilterChange({
      repairType: [],
      location: [],
      status: ['Abierta', 'En Progreso'],
      importance: [],
    });
  };

  const handleMultiSelectChange = (
    filterKey: keyof FilterControlsProps["filters"],
    value: string // RepairType, Location, Status, or ImportanceLevel
  ) => {
    const currentFilterValues = filters[filterKey] as string[];
    const newFilterValues = currentFilterValues.includes(value)
      ? currentFilterValues.filter(v => v !== value)
      : [...currentFilterValues, value];
    onFilterChange({ ...filters, [filterKey]: newFilterValues });
  };
  
  const getButtonText = (selectedItems: string[], allItems: readonly string[] | string[], defaultText: string, singularName: string, pluralName: string) => {
    if (selectedItems.length === 0) return defaultText;
    if (selectedItems.length === allItems.length) return `Todos los ${pluralName}`;
    if (selectedItems.length === 1) return selectedItems[0];
    return `${selectedItems.length} ${pluralName} seleccionados`;
  };

  const locationButtonText = getButtonText(filters.location, availableLocations, "Todas las ubicaciones", "ubicación", "ubicaciones");
  const repairTypeButtonText = getButtonText(filters.repairType, availableRepairTypes, "Todos los tipos", "tipo", "tipos");
  const statusButtonText = getButtonText(filters.status, ticketStatuses, "Ningún estado", "estado", "estados");
  const importanceButtonText = getButtonText(filters.importance, allImportanceLevels, "Toda importancia", "importancia", "importancias");

  return (
    <Card className="mb-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <Label htmlFor="filter-location-dropdown">Ubicación</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-location-dropdown" className="w-full justify-between mt-1">
                <span className="truncate max-w-[150px] sm:max-w-full">{locationButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Ubicaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableLocations.map((loc) => (
                <DropdownMenuCheckboxItem
                  key={loc}
                  checked={filters.location.includes(loc)}
                  onCheckedChange={() => handleMultiSelectChange('location', loc)}
                >
                  {loc}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <Label htmlFor="filter-repair-type-dropdown">Tipo de Reparación</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-repair-type-dropdown" className="w-full justify-between mt-1">
                 <span className="truncate max-w-[150px] sm:max-w-full">{repairTypeButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Tipos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableRepairTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={filters.repairType.includes(type)}
                  onCheckedChange={() => handleMultiSelectChange('repairType', type)}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <Label htmlFor="filter-status-dropdown">Estado</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-status-dropdown" className="w-full justify-between mt-1">
                <span className="truncate max-w-[150px] sm:max-w-full">{statusButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Estados</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ticketStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleMultiSelectChange('status', status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <Label htmlFor="filter-importance-dropdown">Importancia</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-importance-dropdown" className="w-full justify-between mt-1">
                <span className="truncate max-w-[150px] sm:max-w-full">{importanceButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Importancia</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allImportanceLevels.map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={filters.importance.includes(level)}
                  onCheckedChange={() => handleMultiSelectChange('importance', level)}
                >
                  {level}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={handleResetFilters} variant="outline" className="w-full lg:w-auto">
          <X className="mr-2 h-4 w-4" /> Restablecer
        </Button>
      </div>
    </Card>
  );
}
