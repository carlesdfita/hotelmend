
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Ticket, TicketStatus, RepairType, ImportanceLevel } from "@/lib/types";
import {
  Zap,
  Wrench,
  Hammer,
  Lightbulb,
  Wind,
  ClipboardList,
  CircleAlert, 
  CircleDotDashed, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ChevronDownCircle, 
  CalendarDays,
  MapPin,
  Construction, 
  Edit3,
  MoreVertical,
  Trash2 // Importem la icona d'eliminar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onEditTicket: (ticket: Ticket) => void; 
  onDeleteTicket: (ticketId: string) => void; // Afegim la prop per eliminar
}

const repairTypeIcons: Record<string, React.ElementType> = {
  "Elèctric": Zap,
  "Lampisteria": Wrench,
  "Fusteria": Hammer,
  "Il·luminació": Lightbulb,
  "Climatització": Wind,
  "General": ClipboardList,
};

const statusInfo: Record<TicketStatus, { icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "attention" | null | undefined }> = {
  "Oberta": { icon: CircleAlert, variant: "destructive" }, 
  "En Progrés": { icon: CircleDotDashed, variant: "warning" }, 
  "Tancada": { icon: CheckCircle2, variant: "success" }, 
};

const importanceInfo: Record<ImportanceLevel, { icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "attention" | null | undefined; label: string }> = {
  "Urgent": { icon: AlertTriangle, variant: "destructive", label: "Urgent" }, 
  "Important": { icon: ShieldAlert, variant: "warning", label: "Important" }, 
  "Poc Important": { icon: ChevronDownCircle, variant: "default", label: "Poc Imp." }, 
};


// Afegim onDeleteTicket a les props
export default function TicketCard({ ticket, onUpdateStatus, onEditTicket, onDeleteTicket }: TicketCardProps) {
  const RepairIcon = repairTypeIcons[ticket.repairType] || Construction;
  const StatusIcon = statusInfo[ticket.status].icon;
  const ImportanceIcon = importanceInfo[ticket.importance].icon;

  const handleStatusChange = (newStatus: TicketStatus) => {
    onUpdateStatus(ticket.id, newStatus);
  };

  // Funció per manejar l'eliminació del tiquet
  const handleDeleteClick = () => {
      // Opcional: Podries afegir una confirmació aquí abans de cridar onDeleteTicket
      if (window.confirm(`Est\u00E0s segur que vols eliminar la incidència "${ticket.description}"?`)) { // \u00E0 és la seqüència d'escapament per 'à'
           onDeleteTicket(ticket.id);
      }
  };

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col sm:flex-row">
      <div className="flex-grow p-3 pr-2">
        <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-sm font-headline flex items-center">
              <RepairIcon className="mr-1.5 h-3.5 w-3.5 text-primary" />
              {ticket.repairType}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant={importanceInfo[ticket.importance].variant || 'default'} className="text-xs px-1.5 py-0.5 h-[18px] leading-tight">
                <ImportanceIcon className="mr-1 h-2.5 w-2.5" />
                {importanceInfo[ticket.importance].label}
              </Badge>
              <Badge variant={statusInfo[ticket.status].variant || 'default'} className="text-xs px-1.5 py-0.5 h-[18px] leading-tight">
                <StatusIcon className="mr-1 h-2.5 w-2.5" />
                {ticket.status}
              </Badge>
            </div>
        </div>
        <p className="text-xs text-foreground leading-snug line-clamp-2 mb-1 sm:mb-1.5">{ticket.description}</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" /> {ticket.location}
            </div>
            <div className="flex items-center">
              <CalendarDays className="mr-1 h-3 w-3" />
              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
      </div>
      <div className="flex-shrink-0 p-2 sm:border-l sm:pl-2 flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Més opcions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTicket(ticket)} className="text-sm">
                <Edit3 className="mr-2 h-3.5 w-3.5" />
                Editar Incidència
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Opcions de canvi d'estat */}
              {ticket.status !== "En Progrés" && ticket.status !== "Tancada" && (
                <DropdownMenuItem onClick={() => handleStatusChange("En Progrés")} className="text-sm">
                  Marcar En Progrés
                </DropdownMenuItem>
              )}
              {ticket.status !== "Tancada" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Tancada")} className="text-sm">
                   Marcar Com Completa
                 </DropdownMenuItem>
              )}
               {ticket.status === "Tancada" && ticket.status !== "Oberta" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Oberta")} className="text-sm">
                   Reobrir Incidència
                 </DropdownMenuItem>
              )}
              {/* Afegim l'opció d'eliminar */}
              <DropdownMenuSeparator /> {/* Separador abans d'eliminar */}
              <DropdownMenuItem onClick={handleDeleteClick} className="text-sm text-red-600 focus:text-red-700 focus:bg-red-50">
                 <Trash2 className="mr-2 h-3.5 w-3.5" /> {/* Icona d'escombraries */}
                 Eliminar Incidència
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </Card>
  );
}
