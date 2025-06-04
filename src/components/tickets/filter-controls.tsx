
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
        const defaultLocations = ["Recepció Vestíbul", "Cuina Principal", "Gimnàs", "Piscina", "Habitació 305"];
        localStorage.setItem('locations', JSON.stringify(defaultLocations));
        setAvailableLocations(defaultLocations);
    }
  }, []);
  
  const handleResetFilters = () => {
    onFilterChange({
      repairType: [],
      location: [],
      status: ['Oberta', 'En Progrés'],
      importance: [],
    });
  };

  const handleMultiSelectChange = (
    filterKey: keyof FilterControlsProps["filters"],
    value: string 
  ) => {
    const currentFilterValues = filters[filterKey] as string[];
    const newFilterValues = currentFilterValues.includes(value)
      ? currentFilterValues.filter(v => v !== value)
      : [...currentFilterValues, value];
    onFilterChange({ ...filters, [filterKey]: newFilterValues });
  };
  
  const getButtonText = (selectedItems: string[], allItems: readonly string[] | string[], defaultText: string, singularName: string, pluralName: string) => {
    if (selectedItems.length === 0) return defaultText;
    if (selectedItems.length === allItems.length) return `Tots els ${pluralName}`;
    if (selectedItems.length === 1) return selectedItems[0];
    return `${selectedItems.length} ${pluralName} seleccionats`;
  };

  const locationButtonText = getButtonText(filters.location, availableLocations, "Totes les ubicacions", "ubicació", "ubicacions");
  const repairTypeButtonText = getButtonText(filters.repairType, availableRepairTypes, "Tots els tipus", "tipus", "tipus");
  const statusButtonText = getButtonText(filters.status, ticketStatuses, "Cap estat", "estat", "estats");
  const importanceButtonText = getButtonText(filters.importance, allImportanceLevels, "Totes les importàncies", "importància", "importàncies");

  return (
    <Card className="mb-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <Label htmlFor="filter-location-dropdown">Ubicació</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-location-dropdown" className="w-full justify-between mt-1">
                <span className="truncate max-w-[150px] sm:max-w-full">{locationButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Ubicacions</DropdownMenuLabel>
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
          <Label htmlFor="filter-repair-type-dropdown">Tipus de Reparació</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-repair-type-dropdown" className="w-full justify-between mt-1">
                 <span className="truncate max-w-[150px] sm:max-w-full">{repairTypeButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Tipus</DropdownMenuLabel>
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
          <Label htmlFor="filter-status-dropdown">Estat</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-status-dropdown" className="w-full justify-between mt-1">
                <span className="truncate max-w-[150px] sm:max-w-full">{statusButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Estats</DropdownMenuLabel>
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
          <Label htmlFor="filter-importance-dropdown">Importància</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-importance-dropdown" className="w-full justify-between mt-1">
                <span className="truncate max-w-[150px] sm:max-w-full">{importanceButtonText}</span>
                <ListFilter className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Importància</DropdownMenuLabel>
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
          <X className="mr-2 h-4 w-4" /> Restablir
        </Button>
      </div>
    </Card>
  );
}
