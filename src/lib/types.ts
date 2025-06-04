export type RepairType = "Eléctrico" | "Fontanería" | "Carpintería" | "Iluminación" | "Climatización" | "General";
export const repairTypes: RepairType[] = ["Eléctrico", "Fontanería", "Carpintería", "Iluminación", "Climatización", "General"];

export type TicketStatus = "Abierta" | "En Progreso" | "Cerrada";
export const ticketStatuses: TicketStatus[] = ["Abierta", "En Progreso", "Cerrada"];

export interface SuggestedTicket {
  ticketId: string;
  description: string;
}

export interface Ticket {
  id: string;
  description: string;
  location: string; 
  repairType: RepairType;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  suggestedTickets?: SuggestedTicket[];
}
