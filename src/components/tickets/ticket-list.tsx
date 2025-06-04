
"use client";

import type { Ticket, TicketStatus } from "@/lib/types";
import TicketCard from "./ticket-card";

interface TicketListProps {
  tickets: Ticket[];
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onEditTicket: (ticket: Ticket) => void; 
}

export default function TicketList({ tickets, onUpdateStatus, onEditTicket }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No s'han trobat incidències de manteniment.</p>
        <p className="text-sm text-muted-foreground">Intenteu ajustar els filtres o creeu una nova incidència.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4"> 
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={onUpdateStatus} onEditTicket={onEditTicket} />
      ))}
    </div>
  );
}
