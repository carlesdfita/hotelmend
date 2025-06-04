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
import { repairTypes, ticketStatuses } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card"; // Assuming Card is imported from ui
import { Label } from "@/components/ui/label"; // Assuming Label is imported from ui
import * as React from 'react';


interface FilterControlsProps {
  filters: {
    repairType: RepairType | "All";
    location: string;
    status: TicketStatus | "All";
  };
  onFilterChange: (filters: FilterControlsProps["filters"]) => void;
}

export default function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
  
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
          <Input
            id="filter-location"
            placeholder="Buscar por área/habitación..."
            value={filters.location}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
            className="mt-1"
          />
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
              {repairTypes.map((type) => (
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
