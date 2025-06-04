"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RepairType, TicketStatus } from "@/lib/types";
import { defaultRepairTypes, ticketStatuses } from "@/lib/types"; // Using default as a fallback
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from 'react';


interface FilterControlsProps {
  filters: {
    repairType: RepairType | "All";
    location: string;
    status: TicketStatus | "All";
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
      status: "All",
    });
  };

  return (
    <Card className="mb-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <Label htmlFor="filter-location">Ubicación</Label>
          {availableLocations.length > 0 ? (
            <Select
              value={filters.location || "All"} // Use "All" or "" if no specific value is selected
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
              <SelectItem value="All">Todos los Tipos de Reparación</SelectItem>
              {availableRepairTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-status">Estado</Label>
          <Select
            value={filters.status}
            onValueChange={(value: TicketStatus | "All") => onFilterChange({ ...filters, status: value })}
          >
            <SelectTrigger id="filter-status" className="mt-1">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Todos los Estados</SelectItem>
              {ticketStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleResetFilters} variant="outline" className="w-full lg:w-auto">
          <X className="mr-2 h-4 w-4" /> Restablecer Filtros
        </Button>
      </div>
    </Card>
  );
}
