
"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RepairType, TicketStatus, ImportanceLevel } from "@/lib/types";
import { defaultRepairTypes, ticketStatuses, importanceLevels } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, ListFilter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from 'react';


interface FilterControlsProps {
  filters: {
    repairType: RepairType | "All";
    location: string;
    status: TicketStatus[];
    importance: ImportanceLevel | "All";
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
    }
    const storedLocations = localStorage.getItem('locations');
    if (storedLocations) {
      setAvailableLocations(JSON.parse(storedLocations));
    }
  }, []);
  
  const handleResetFilters = () => {
    onFilterChange({
      repairType: "All",
      location: "",
      status: ['Abierta', 'En Progreso'],
      importance: "All",
    });
  };

  const handleStatusChange = (statusValue: TicketStatus) => {
    const newStatusFilter = filters.status.includes(statusValue)
      ? filters.status.filter(s => s !== statusValue)
      : [...filters.status, statusValue];
    onFilterChange({ ...filters, status: newStatusFilter });
  };
  
  const getStatusButtonText = () => {
    if (filters.status.length === 0) return "Ningún estado";
    if (filters.status.length === ticketStatuses.length) return "Todos los estados";
    if (filters.status.length === 2 && filters.status.includes('Abierta') && filters.status.includes('En Progreso')) return "Abierta y En Progreso";
    if (filters.status.length === 1) return filters.status[0];
    return `${filters.status.length} estados seleccionados`;
  };


  return (
    <Card className="mb-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <Label htmlFor="filter-location">Ubicación</Label>
          {availableLocations.length > 0 ? (
            <Select
              value={filters.location || "All"}
              onValueChange={(value) => onFilterChange({ ...filters, location: value === "All" ? "" : value })}
            >
              <SelectTrigger id="filter-location" className="mt-1">
                <SelectValue placeholder="Filtrar por ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todas las Ubicaciones</SelectItem>
                {availableLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="filter-location"
              placeholder="Buscar por área/habitación..."
              value={filters.location}
              onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
              className="mt-1"
            />
          )}
        </div>
        <div>
          <Label htmlFor="filter-repair-type">Tipo de Reparación</Label>
          <Select
            value={filters.repairType}
            onValueChange={(value: RepairType | "All") => onFilterChange({ ...filters, repairType: value })}
          >
            <SelectTrigger id="filter-repair-type" className="mt-1">
              <SelectValue placeholder="Filtrar por tipo de reparación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Todos los Tipos</SelectItem>
              {availableRepairTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-status-dropdown">Estado</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" id="filter-status-dropdown" className="w-full justify-between mt-1">
                {getStatusButtonText()}
                <ListFilter className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Seleccionar Estados</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ticketStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleStatusChange(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <Label htmlFor="filter-importance">Importancia</Label>
          <Select
            value={filters.importance}
            onValueChange={(value: ImportanceLevel | "All") => onFilterChange({ ...filters, importance: value })}
          >
            <SelectTrigger id="filter-importance" className="mt-1">
              <SelectValue placeholder="Filtrar por importancia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Toda Importancia</SelectItem>
              {importanceLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleResetFilters} variant="outline" className="w-full lg:w-auto">
          <X className="mr-2 h-4 w-4" /> Restablecer
        </Button>
      </div>
    </Card>
  );
}
