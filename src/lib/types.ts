export type RepairType = "Electrical" | "Plumbing" | "Carpentry" | "Lights" | "HVAC" | "General";
export const repairTypes: RepairType[] = ["Electrical", "Plumbing", "Carpentry", "Lights", "HVAC", "General"];

export type TicketStatus = "Open" | "In Progress" | "Closed";
export const ticketStatuses: TicketStatus[] = ["Open", "In Progress", "Closed"];

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
