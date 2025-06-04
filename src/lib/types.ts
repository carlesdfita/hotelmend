
export type RepairType = string; 
export const defaultRepairTypes: RepairType[] = ["Elèctric", "Lampisteria", "Fusteria", "Il·luminació", "Climatització", "General"];

export type TicketStatus = "Oberta" | "En Progrés" | "Tancada";
export const ticketStatuses: TicketStatus[] = ["Oberta", "En Progrés", "Tancada"];

export type ImportanceLevel = "Urgent" | "Important" | "Poc Important";
export const importanceLevels: ImportanceLevel[] = ["Urgent", "Important", "Poc Important"];

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
  importance: ImportanceLevel;
  createdAt: Date;
  updatedAt: Date;
  suggestedTickets?: SuggestedTicket[];
}
