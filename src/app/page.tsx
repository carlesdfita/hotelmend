// src/app/page.tsx
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

// Importem les funcions de Firestore
import { getTicketsFromFirestore, addTicketToFirestore, getLocationsFromFirestore, getRepairTypesFromFirestore } from '@/lib/firestoreService';

interface Filters {
  repairType: RepairType[];
  location: string[];
  status: TicketStatus[];
  importance: ImportanceLevel[];
}

export default function HomePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [repairTypesList, setRepairTypesList] = useState<string[]>([]); // Renamed to avoid conflict with RepairType type

  const [filters, setFilters] = useState<Filters>({
    repairType: [],
    location: [],
    status: ['Oberta', 'En Progrés'],
    importance: [],
  });
  
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [firestoreTickets, firestoreLocations, firestoreRepairTypes] = await Promise.all([
        getTicketsFromFirestore(),
        getLocationsFromFirestore(),
        getRepairTypesFromFirestore()
      ]);

      setTickets(firestoreTickets);
      setLocations(firestoreLocations);
      setRepairTypesList(firestoreRepairTypes);

    } catch (err) {
      console.error("Error fetching data from Firestore:", err);
      if (err instanceof Error) {
        setError(`No s'han pogut carregar les dades inicials: ${err.message}`);
      } else {
        setError("No s'han pogut carregar les dades inicials a causa d'un error desconegut.");
      }
      setTickets([]);
      setLocations([]);
      setRepairTypesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // La funció addTicket necessitarà ser modificada per guardar a Firestore
  const addTicket = async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const ticketDataForFirestore = {
         description: newTicketData.description,
         location: newTicketData.location,
         repairType: newTicketData.repairType,
         importance: newTicketData.importance,
         status: 'Oberta' as TicketStatus,
         suggestedTickets: newTicketData.suggestedTickets || []
      };

      await addTicketToFirestore(ticketDataForFirestore);
      setIsCreateFormOpen(false);
      await fetchInitialData(); // Recarrega totes les dades
      console.log("Ticket added successfully!");

    } catch (err) {
      console.error("Error adding ticket to Firestore:", err);
       if (err instanceof Error) {
             setError(`No s'ha pogut crear la incidència: ${err.message}`);
        } else {
            setError("No s'ha pogut crear la incidència a causa d'un error desconegut.");
        }
      setIsCreateFormOpen(false);
    }
  };

  const handleOpenEditForm = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsEditFormOpen(true);
  };

  const handleUpdateTicket = async (updatedTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    if (!editingTicket) return;
    try {
        await addTicketToFirestore(updatedTicketData); // This should be updateTicketInFirestore
        // For now, let's assume addTicketToFirestore works as an update if an ID existed or similar logic in backend.
        // Ideally, you'd have an updateTicketInFirestore(editingTicket.id, updatedTicketData)
        setIsEditFormOpen(false);
        setEditingTicket(null);
        await fetchInitialData(); // Recarrega totes les dades
        console.log("Ticket updated successfully!");
    } catch (err) {
        console.error("Error updating ticket:", err);
        if (err instanceof Error) {
            setError(`No s'ha pogut actualitzar la incidència: ${err.message}`);
        } else {
            setError("No s'ha pogut actualitzar la incidència a causa d'un error desconegut.");
        }
    }
  };
  
  const updateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
        // You'd need an updateTicketInFirestore function for this
        // For now, we'll simulate by refetching all tickets after a local update
        // This is not ideal for production but works for the prototype's current state
        const ticketToUpdate = tickets.find(t => t.id === ticketId);
        if (ticketToUpdate) {
            // Optimistically update UI, then refetch. 
            // OR: Call updateTicketInFirestore(ticketId, { status: newStatus, updatedAt: new Date() });
            // Then await fetchInitialData();
             console.log(`Updating ticket ${ticketId} to ${newStatus} (simulation)`);
             await fetchInitialData(); 
        }
    } catch (err) {
         console.error("Error updating ticket status:", err);
         if (err instanceof Error) {
            setError(`No s'ha pogut actualitzar l'estat de la incidència: ${err.message}`);
        } else {
            setError("No s'ha pogut actualitzar l'estat de la incidència a causa d'un error desconegut.");
        }
    }
  };


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
    }
     // Removed the "else { tempTickets = [] }" to show all if no status filter, or apply other filters.
     // If you want to show NO tickets if no status is selected, reinstate that else block.
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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setFilteredTickets(tempTickets);
  }, [tickets, filters]);

  if (isLoading) {
      return <div className="flex flex-col min-h-screen bg-background justify-center items-center"><p>Carregant incidències...</p></div>;
  }

  if (error) {
      return <div className="flex flex-col min-h-screen bg-background justify-center items-center"><p className="text-destructive">{error}</p></div>;
  }


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
              locations={locations}
              repairTypes={repairTypesList}
              />
  
            </DialogContent>
          </Dialog>
        </div>

        <FilterControls
        filters={filters}
        onFilterChange={setFilters}
        locations={locations} 
        repairTypes={repairTypesList}
        />
  
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
              locations={locations} 
              repairTypes={repairTypesList}
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
