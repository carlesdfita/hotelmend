
export type RepairType = string; 
export const defaultRepairTypes: RepairType[] = ["Eléctrico", "Fontanería", "Carpintería", "Iluminación", "Climatización", "General"];

export type TicketStatus = "Abierta" | "En Progreso" | "Cerrada";
export const ticketStatuses: TicketStatus[] = ["Abierta", "En Progreso", "Cerrada"];

export type ImportanceLevel = "Urgente" | "Importante" | "Poco Importante";
export const importanceLevels: ImportanceLevel[] = ["Urgente", "Importante", "Poco Importante"];

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
  importance: ImportanceLevel; // Nuevo campo
  createdAt: Date;
  updatedAt: Date;
  suggestedTickets?: SuggestedTicket[];
}
