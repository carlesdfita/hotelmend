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
import type { Ticket, TicketStatus } from "@/lib/types";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
}

const repairTypeIcons: Record<Ticket["repairType"], React.ElementType> = {
  Electrical: Zap,
  Plumbing: Wrench,
  Carpentry: Hammer,
  Lights: Lightbulb,
  HVAC: Wind,
  General: ClipboardList,
};

const statusInfo: Record<TicketStatus, { icon: React.ElementType; colorClass: string; variant: "default" | "secondary" | "destructive" | "outline" | null | undefined }> = {
  Open: { icon: CircleAlert, colorClass: "bg-red-500", variant: "destructive" },
  "In Progress": { icon: CircleDotDashed, colorClass: "bg-yellow-500", variant: "secondary" },
  Closed: { icon: CheckCircle2, colorClass: "bg-green-500", variant: "default" },
};


export default function TicketCard({ ticket, onUpdateStatus }: TicketCardProps) {
  const RepairIcon = repairTypeIcons[ticket.repairType];
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
              {ticket.repairType} Issue
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="mr-1 h-4 w-4 text-muted-foreground" /> Room/Area: {ticket.location}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ticket.status !== "In Progress" && ticket.status !== "Closed" && (
                <DropdownMenuItem onClick={() => handleStatusChange("In Progress")}>
                  Mark In Progress
                </DropdownMenuItem>
              )}
              {ticket.status !== "Closed" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Closed")}>
                   Mark Complete
                 </DropdownMenuItem>
              )}
               {ticket.status === "Closed" && ticket.status !== "Open" && (
                 <DropdownMenuItem onClick={() => handleStatusChange("Open")}>
                   Reopen Ticket
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
