
"use client";

import React, { useState, useEffect } from 'react';
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
import type { Ticket, RepairType, TicketStatus, ImportanceLevel } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    // Initialize with dummy data and ensure localStorage for settings is populated
    const initialTickets: Ticket[] = [
      {
        id: '1',
        description: 'La llum del bany de l\'Habitació 305 parpelleja constantment. Necessita reemplaçament.',
        location: 'Habitació 305',
        repairType: 'Il·luminació',
        status: 'Oberta',
        importance: 'Important',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      },
      {
        id: '2',
        description: 'El lavabo de la cuina principal està embussat. L\'aigua drena molt lentament.',
        location: 'Cuina Principal',
        repairType: 'Lampisteria',
        status: 'En Progrés',
        importance: 'Urgent',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        updatedAt: new Date(),
      },
      {
        id: '3',
        description: 'L\'aire condicionat del gimnàs no refreda eficaçment. Sembla que expulsa aire calent.',
        location: 'Gimnàs',
        repairType: 'Climatització',
        status: 'Oberta',
        importance: 'Important',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
       {
        id: '4',
        description: 'El panell de fusta del taulell de recepció està solt.',
        location: 'Recepció Vestíbul',
        repairType: 'Fusteria',
        status: 'Tancada',
        importance: 'Poc Important',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)),
      },
    ];
    if (typeof window !== 'undefined') {
        if (!localStorage.getItem('locations')) {
            localStorage.setItem('locations', JSON.stringify(["Recepció Vestíbul", "Cuina Principal", "Gimnàs", "Piscina", "Habitació 305"]));
        }
        if (!localStorage.getItem('repairTypes')) {
            localStorage.setItem('repairTypes', JSON.stringify(["Elèctric", "Lampisteria", "Fusteria", "Il·luminació", "Climatització", "General"]));
        }
    }
    setTickets(initialTickets);
  }, []);
  
  const addTicket = (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const ticket: Ticket = {
      ...newTicketData,
      id: crypto.randomUUID(), 
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Oberta',
    };
    setTickets(prevTickets => [ticket, ...prevTickets]);
    setIsCreateFormOpen(false);
  };

  const handleOpenEditForm = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsEditFormOpen(true);
  };

  const handleUpdateTicket = (updatedData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!editingTicket) return;
    setTickets(prevTickets =>
      prevTickets.map(t =>
        t.id === editingTicket.id ? { ...editingTicket, ...updatedData, updatedAt: new Date() } : t
      )
    );
    setIsEditFormOpen(false);
    setEditingTicket(null);
  };

  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prevTickets =>
      prevTickets.map(t =>
        t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t
      )
    );
  };

  const [filters, setFilters] = useState<{ repairType: RepairType[]; location: string[]; status: TicketStatus[]; importance: ImportanceLevel[] }>({
    repairType: [], 
    location: [],   
    status: ['Oberta', 'En Progrés'], 
    importance: [], 
  });

  useEffect(() => {
    let tempTickets = [...tickets];
    
    if (filters.repairType.length > 0) {
      tempTickets = tempTickets.filter(t => filters.repairType.includes(t.repairType));
    }
    if (filters.location.length > 0) {
      tempTickets = tempTickets.filter(t => filters.location.includes(t.location));
    }
    if (filters.status.length > 0) {
      tempTickets = tempTickets.filter(t => filters.status.includes(t.status));
    } else {
      // If no status filters are selected, show no tickets (as per previous logic)
      // If you want to show all tickets when no status is selected, change this to:
      // tempTickets = tempTickets; // or simply remove the else block if that's the desired default
      tempTickets = []; 
    }
    if (filters.importance.length > 0) {
      tempTickets = tempTickets.filter(t => filters.importance.includes(t.importance));
    }

    tempTickets.sort((a, b) => {
      const importanceOrder: Record<ImportanceLevel, number> = { 'Urgent': 1, 'Important': 2, 'Poc Important': 3 };
      const statusOrder: Record<TicketStatus, number> = { 'Oberta': 1, 'En Progrés': 2, 'Tancada': 3 };

      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[a.importance] - importanceOrder[b.importance];
      }
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
            Incidències de Manteniment
          </h1>
          <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Crear Nova Incidència
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Crear Nova Incidència de Manteniment</DialogTitle>
                <DialogDescription>
                  Completeu els detalls a continuació per informar d'un problema de manteniment.
                </DialogDescription>
              </DialogHeader>
              <TicketForm 
                onSubmit={addTicket} 
                submitButtonText="Crear Incidència" 
                />
            </DialogContent>
          </Dialog>
        </div>
        
        <FilterControls filters={filters} onFilterChange={setFilters} />
        
        <TicketList tickets={filteredTickets} onUpdateStatus={updateTicketStatus} onEditTicket={handleOpenEditForm} />

        <Dialog open={isEditFormOpen} onOpenChange={(isOpen) => {
          setIsEditFormOpen(isOpen);
          if (!isOpen) {
            setEditingTicket(null); 
          }
        }}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Editar Incidència</DialogTitle>
              <DialogDescription>
                Modifiqueu els detalls de la incidència a continuació.
              </DialogDescription>
            </DialogHeader>
            {editingTicket && (
              <TicketForm 
                onSubmit={handleUpdateTicket} 
                initialData={{
                  description: editingTicket.description,
                  location: editingTicket.location,
                  repairType: editingTicket.repairType,
                  importance: editingTicket.importance,
                }}
                submitButtonText="Desar Canvis"
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
      <footer className="text-center p-6 text-muted-foreground text-sm border-t">
        HotelMend &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
