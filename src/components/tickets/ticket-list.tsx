"use client";

import type { Ticket, TicketStatus } from "@/lib/types";
import TicketCard from "./ticket-card";

interface TicketListProps {
  tickets: Ticket[];
  onUpdateStatus: (ticketId: string, newStatus: TicketStatus) => void;
}

export default function TicketList({ tickets, onUpdateStatus }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">No se encontraron incidencias de mantenimiento.</p>
        <p className="text-sm text-muted-foreground">Intente ajustar sus filtros o cree una nueva incidencia.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} onUpdateStatus={onUpdateStatus} />
      ))}
    </div>
  );
}
