
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
import { ticketStatuses, importanceLevels as allImportanceLevels } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, ListFilter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import React from 'react'; // Ja no necessitem useState ni useEffect per carregar des de localstorage

// Definim el tipus per als items de Firestore (Localització o Tipologia amb ID)
interface FirestoreItem {
  id: string;
  name: string;
}

interface FilterControlsProps {
  filters: {
    repairType: string[]; // L'estat dels filtres segueix guardant només el nom
    location: string[]; // L'estat dels filtres segueix guardant només el nom
    status: TicketStatus[];
    importance: ImportanceLevel[];
  };
  onFilterChange: (filters: FilterControlsProps["filters"]) => void;
  // Afegim props per a les llistes que venen de Firestore
  locations: FirestoreItem[];
  repairTypes: FirestoreItem[];
}

// Rebem locations i repairTypes com a props
export default function FilterControls({ filters, onFilterChange, locations, repairTypes }: FilterControlsProps) {
  // Eliminem els estats locals i l'useEffect de localStorage
  // const [availableRepairTypes, setAvailableRepairTypes] = useState<RepairType[]>(defaultRepairTypes);
  // const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  // useEffect(() => { ... }, []);
  
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
    value: string // El valor que passem és el nom (string)
  ) => {
    const currentFilterValues = filters[filterKey] as string[];
    const newFilterValues = currentFilterValues.includes(value)
      ? currentFilterValues.filter(v => v !== value)
      : [...currentFilterValues, value];
    onFilterChange({ ...filters, [filterKey]: newFilterValues });
  };
  
  // Adaptem la funció per rebre la llista d'items (objectes) i la llista de noms seleccionats
  const getButtonText = (selectedNames: string[], allItems: FirestoreItem[] | readonly string[], defaultText: string, singularName: string, pluralName: string) => {
    // Si la llista d'items disponibles és l'array de strings com ticketStatuses o importanceLevels
     if (!Array.isArray(allItems) || typeof allItems[0] === 'string') {
       const allNames = allItems as readonly string[];
       if (selectedNames.length === 0) return defaultText;
       if (selectedNames.length === allNames.length) return `Tots els ${pluralName}`;
       if (selectedNames.length === 1) return selectedNames[0];
       return `${selectedNames.length} ${pluralName} seleccionats`;
     } else { // Si la llista d'items disponibles és l'array d'objectes FirestoreItem
        const allNames = (allItems as FirestoreItem[]).map(item => item.name);
        if (selectedNames.length === 0) return defaultText;
        if (selectedNames.length === allNames.length) return `Tots els ${pluralName}`;
        if (selectedNames.length === 1) return selectedNames[0];
        return `${selectedNames.length} ${pluralName} seleccionats`;
     }
  };

  // Passem les llistes d'objectes originals i l'array de noms seleccionats de l'estat del filtre
  const locationButtonText = getButtonText(filters.location, locations, "Totes les ubicacions", "ubicació", "ubicacions");
  const repairTypeButtonText = getButtonText(filters.repairType, repairTypes, "Tots els tipus", "tipus", "tipus");
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
              {/* Iterem sobre la llista d'objectes, però usem l'ID per a la key i el name per al text i el valor del filtre */}
              {locations.map((loc) => (
                <DropdownMenuCheckboxItem
                  key={loc.id} // Usem l'ID com a key
                  checked={filters.location.includes(loc.name)} // Comprovem si el nom està seleccionat
                  onCheckedChange={() => handleMultiSelectChange('location', loc.name)} // Passem el nom al handler
                >
                  {loc.name} {/* Mostrem el nom */}
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
               {/* Iterem sobre la llista d'objectes, però usem l'ID per a la key i el name per al text i el valor del filtre */}
              {repairTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.id} // Usem l'ID com a key
                  checked={filters.repairType.includes(type.name)} // Comprovem si el nom està seleccionat
                  onCheckedChange={() => handleMultiSelectChange('repairType', type.name)} // Passem el nom al handler
                >
                  {type.name} {/* Mostrem el nom */}
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
