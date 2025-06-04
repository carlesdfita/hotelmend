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
          <Label htmlFor="filter-location">Location</Label>
          <Input
            id="filter-location"
            placeholder="Search by area/room..."
            value={filters.location}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="filter-repair-type">Repair Type</Label>
          <Select
            value={filters.repairType}
            onValueChange={(value: RepairType | "All") => onFilterChange({ ...filters, repairType: value })}
          >
            <SelectTrigger id="filter-repair-type" className="mt-1">
              <SelectValue placeholder="Filter by repair type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Repair Types</SelectItem>
              {repairTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={filters.status}
            onValueChange={(value: TicketStatus | "All") => onFilterChange({ ...filters, status: value })}
          >
            <SelectTrigger id="filter-status" className="mt-1">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              {ticketStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleResetFilters} variant="outline" className="w-full lg:w-auto">
          <X className="mr-2 h-4 w-4" /> Reset Filters
        </Button>
      </div>
    </Card>
  );
}

// Minimal Label and Card components to avoid full import if not already there
// Usually these would be imported from "@/components/ui/label" and "@/components/ui/card"
const Label = React.forwardRef<
  React.ElementRef<"label">,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={`block text-sm font-medium text-foreground ${className || ''}`}
    {...props}
  />
));
Label.displayName = "Label";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}
    {...props}
  />
));
Card.displayName = "Card";

import * as React from 'react';
