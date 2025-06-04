"use client";

import React, { useState, useEffect, useMemo } from 'react';
import AppHeader from '@/components/layout/app-header';
import TicketForm from '@/components/tickets/ticket-form';
import TicketList from '@/components/tickets/ticket-list';
import FilterControls from '@/components/tickets/filter-controls';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Ticket, RepairType, TicketStatus } from '@/lib/types';
import { PlusCircle, Hotel } from 'lucide-react'; // Added Hotel icon for potential use

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const initialTickets: Ticket[] = [
      {
        id: '1',
        description: 'Bathroom light in Room 305 flickers constantly. Needs replacement.',
        location: 'Room 305',
        repairType: 'Lights',
        status: 'Open',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      },
      {
        id: '2',
        description: 'Sink in the main kitchen is clogged. Water drains very slowly.',
        location: 'Main Kitchen',
        repairType: 'Plumbing',
        status: 'In Progress',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), // 1 day ago
        updatedAt: new Date(),
      },
      {
        id: '3',
        description: 'Air conditioning in the gym is not cooling effectively. Seems to be blowing warm air.',
        location: 'Gym',
        repairType: 'HVAC',
        status: 'Open',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
       {
        id: '4',
        description: 'Wooden panel on the reception desk is loose.',
        location: 'Lobby Reception',
        repairType: 'Carpentry',
        status: 'Closed',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)),
      },
    ];
    setTickets(initialTickets);
  }, []);
  
  const addTicket = (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const ticket: Ticket = {
      ...newTicketData,
      id: crypto.randomUUID(), 
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Open',
    };
    setTickets(prevTickets => [ticket, ...prevTickets]);
    setIsFormOpen(false);
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prevTickets =>
      prevTickets.map(t =>
        t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t
      )
    );
  };

  const [filters, setFilters] = useState<{ repairType: RepairType | 'All'; location: string; status: TicketStatus | 'All' }>({
    repairType: 'All',
    location: '',
    status: 'All',
  });

  useEffect(() => {
    let tempTickets = [...tickets];
    if (filters.repairType !== 'All') {
      tempTickets = tempTickets.filter(t => t.repairType === filters.repairType);
    }
    if (filters.location) {
      tempTickets = tempTickets.filter(t => t.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.status !== 'All') {
      tempTickets = tempTickets.filter(t => t.status === filters.status);
    }
    // Sort tickets: Open, In Progress, then Closed. Within each status, sort by newest first.
    tempTickets.sort((a, b) => {
      const statusOrder = { 'Open': 1, 'In Progress': 2, 'Closed': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    setFilteredTickets(tempTickets);
  }, [tickets, filters]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-headline font-bold text-foreground mb-4 sm:mb-0">
            Maintenance Tickets
          </h1>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Create New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Create New Maintenance Ticket</DialogTitle>
                <DialogDescription>
                  Fill in the details below to report a maintenance issue.
                </DialogDescription>
              </DialogHeader>
              <TicketForm onSubmit={addTicket} />
            </DialogContent>
          </Dialog>
        </div>
        
        <FilterControls filters={filters} onFilterChange={setFilters} />
        
        <TicketList tickets={filteredTickets} onUpdateStatus={updateTicketStatus} />
      </main>
      <footer className="text-center p-6 text-muted-foreground text-sm border-t">
        HotelMend &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
