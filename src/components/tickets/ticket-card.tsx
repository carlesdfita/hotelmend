
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
  CircleAlert, // Status: Abierta
  CircleDotDashed, // Status: En Progreso
  CheckCircle2, // Status: Cerrada
  AlertTriangle, // Importance: Urgente
  ShieldAlert, // Importance: Importante (icono)
  ChevronDownCircle, // Importance: Poco Importante
  CalendarDays,
  MapPin,
  Construction, 
  Edit3,
  MoreVertical,
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
}

const repairTypeIcons: Record<string, React.ElementType> = {
  "Eléctrico": Zap,
  "Fontanería": Wrench,
  "Carpintería": Hammer,
  "Iluminación": Lightbulb,
  "Climatización": Wind,
  "General": ClipboardList,
};

const statusInfo: Record<TicketStatus, { icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "attention" | null | undefined }> = {
  "Abierta": { icon: CircleAlert, variant: "destructive" }, // Rojo
  "En Progreso": { icon: CircleDotDashed, variant: "warning" }, // Amarillo
  "Cerrada": { icon: CheckCircle2, variant: "success" }, // Verde (accent color)
};

const importanceInfo: Record<ImportanceLevel, { icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "attention" | null | undefined; label: string }> = {
  "Urgente": { icon: AlertTriangle, variant: "destructive", label: "Urgente" }, // Rojo
  "Importante": { icon: ShieldAlert, variant: "warning", label: "Importante" }, // Amarillo
  "Poco Importante": { icon: ChevronDownCircle, variant: "warning", label: "Poco Imp." }, // Amarillo
};


export default function TicketCard({ ticket, onUpdateStatus, onEditTicket }: TicketCardProps) {
  const RepairIcon = repairTypeIcons[ticket.repairType] || Construction;
  const StatusIcon = statusInfo[ticket.status].icon;
  const ImportanceIcon = importanceInfo[ticket.importance].icon;

  const handleStatusChange = (newStatus: TicketStatus) => {
    onUpdateStatus(ticket.id, newStatus);
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
                <span className="sr-only">Más opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditTicket(ticket)} className="text-sm">
                <Edit3 className="mr-2 h-3.5 w-3.5" />
                Editar Incidencia
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {ticket.status !== "En Progreso" && ticket.status !== "Cerrada" && (
                <DropdownMenuItem onClick={() => handleStatusChange("En Progreso")} className="text-sm">
                  Marcar En Progreso
                </DropdownMenuItem>
              )}
              {ticket.status !== "Cerrada" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Cerrada")} className="text-sm">
                   Marcar Completa
                 </DropdownMenuItem>
              )}
               {ticket.status === "Cerrada" && ticket.status !== "Abierta" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Abierta")} className="text-sm">
                   Reabrir Incidencia
                 </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </Card>
  );
}
