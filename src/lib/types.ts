// export type RepairType = "Eléctrico" | "Fontanería" | "Carpintería" | "Iluminación" | "Climatización" | "General";
// export const repairTypes: RepairType[] = ["Eléctrico", "Fontanería", "Carpintería", "Iluminación", "Climatización", "General"];
// The above is commented out as repairTypes will now be managed dynamically.
// We keep the type definition for clarity in function signatures and state.
export type RepairType = string; 

// Default repair types, can be overridden or extended via settings page
export const defaultRepairTypes: RepairType[] = ["Eléctrico", "Fontanería", "Carpintería", "Iluminación", "Climatización", "General"];


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
