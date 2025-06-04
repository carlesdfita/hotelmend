
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
import type { Ticket, RepairType, TicketStatus, ImportanceLevel } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const initialTickets: Ticket[] = [
      {
        id: '1',
        description: 'La luz del baño de la Habitación 305 parpadea constantemente. Necesita reemplazo.',
        location: 'Habitación 305',
        repairType: 'Iluminación',
        status: 'Abierta',
        importance: 'Importante',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)), 
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      },
      {
        id: '2',
        description: 'El lavabo de la cocina principal está atascado. El agua drena muy lentamente.',
        location: 'Cocina Principal',
        repairType: 'Fontanería',
        status: 'En Progreso',
        importance: 'Urgente',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), 
        updatedAt: new Date(),
      },
      {
        id: '3',
        description: 'El aire acondicionado del gimnasio no enfría eficazmente. Parece que expulsa aire caliente.',
        location: 'Gimnasio',
        repairType: 'Climatización',
        status: 'Abierta',
        importance: 'Importante',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
       {
        id: '4',
        description: 'El panel de madera del mostrador de recepción está suelto.',
        location: 'Recepción Vestíbulo',
        repairType: 'Carpintería',
        status: 'Cerrada',
        importance: 'Poco Importante',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 3)),
      },
    ];
    // Simulate loading from localStorage for locations and repair types for demo consistency
    if (typeof window !== 'undefined') {
        if (!localStorage.getItem('locations')) {
            localStorage.setItem('locations', JSON.stringify(["Recepción Vestíbulo", "Cocina Principal", "Gimnasio", "Piscina", "Habitación 305"]));
        }
        if (!localStorage.getItem('repairTypes')) {
            localStorage.setItem('repairTypes', JSON.stringify(["Eléctrico", "Fontanería", "Carpintería", "Iluminación", "Climatización", "General"]));
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
      status: 'Abierta',
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
    repairType: [], // Empty array means all repair types
    location: [],   // Empty array means all locations
    status: ['Abierta', 'En Progreso'], // Default to open and in progress
    importance: [], // Empty array means all importance levels
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
      // If no statuses are selected, show no tickets (special behavior for status filter)
      tempTickets = [];
    }
    if (filters.importance.length > 0) {
      tempTickets = tempTickets.filter(t => filters.importance.includes(t.importance));
    }

    tempTickets.sort((a, b) => {
      const importanceOrder: Record<ImportanceLevel, number> = { 'Urgente': 1, 'Importante': 2, 'Poco Importante': 3 };
      const statusOrder: Record<TicketStatus, number> = { 'Abierta': 1, 'En Progreso': 2, 'Cerrada': 3 };

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
            Incidencias de Mantenimiento
          </h1>
          <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Crear Nueva Incidencia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Crear Nueva Incidencia de Mantenimiento</DialogTitle>
                <DialogDescription>
                  Complete los detalles a continuación para informar un problema de mantenimiento.
                </DialogDescription>
              </DialogHeader>
              <TicketForm 
                onSubmit={addTicket} 
                submitButtonText="Crear Incidencia" 
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
              <DialogTitle className="font-headline text-2xl">Editar Incidencia</DialogTitle>
              <DialogDescription>
                Modifique los detalles de la incidencia a continuación.
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
                submitButtonText="Guardar Cambios"
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
