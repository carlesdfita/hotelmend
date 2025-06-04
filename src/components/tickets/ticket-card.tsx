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
import type { Ticket, TicketStatus, RepairType } from "@/lib/types";
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
  CalendarDays,
  MapPin,
  Construction, // Generic icon for other types
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from 'lucide-react';
import React from "react";

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
}

const repairTypeIcons: Record<string, React.ElementType> = {
  "Eléctrico": Zap,
  "Fontanería": Wrench,
  "Carpintería": Hammer,
  "Iluminación": Lightbulb,
  "Climatización": Wind,
  "General": ClipboardList,
  // Add more specific icons here if needed
};

const statusInfo: Record<TicketStatus, { icon: React.ElementType; colorClass: string; variant: "default" | "secondary" | "destructive" | "outline" | null | undefined }> = {
  "Abierta": { icon: CircleAlert, colorClass: "bg-red-500", variant: "destructive" },
  "En Progreso": { icon: CircleDotDashed, colorClass: "bg-yellow-500", variant: "secondary" },
  "Cerrada": { icon: CheckCircle2, colorClass: "bg-green-500", variant: "default" },
};


export default function TicketCard({ ticket, onUpdateStatus }: TicketCardProps) {
  const RepairIcon = repairTypeIcons[ticket.repairType] || Construction; // Fallback to a generic icon
  const StatusIcon = statusInfo[ticket.status].icon;

  const handleStatusChange = (newStatus: TicketStatus) => {
    onUpdateStatus(ticket.id, newStatus);
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-headline flex items-center">
              <RepairIcon className="mr-2 h-6 w-6 text-primary" />
              Incidencia de {ticket.repairType}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="mr-1 h-4 w-4 text-muted-foreground" /> {ticket.location}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ticket.status !== "En Progreso" && ticket.status !== "Cerrada" && (
                <DropdownMenuItem onClick={() => handleStatusChange("En Progreso")}>
                  Marcar En Progreso
                </DropdownMenuItem>
              )}
              {ticket.status !== "Cerrada" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Cerrada")}>
                   Marcar Completa
                 </DropdownMenuItem>
              )}
               {ticket.status === "Cerrada" && ticket.status !== "Abierta" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Abierta")}>
                   Reabrir Incidencia
                 </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">{ticket.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-4">
        <div className="flex items-center">
          <Badge variant={statusInfo[ticket.status].variant || 'default'} className="text-xs">
             <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
            {ticket.status}
          </Badge>
        </div>
        <div className="flex items-center">
          <CalendarDays className="mr-1.5 h-4 w-4" />
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
