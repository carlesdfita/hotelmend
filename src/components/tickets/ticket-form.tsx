"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Ticket, RepairType, SuggestedTicket } from "@/lib/types";
import { repairTypes } from "@/lib/types";
import { suggestRelatedTickets } from "@/ai/flows/suggest-related-tickets";
import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ticketFormSchema = z.object({
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  location: z.string().min(1, { message: "La ubicación es obligatoria." }),
  repairType: z.enum(repairTypes, { message: "Tipo de reparación no válido." }),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSubmit: (data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  initialData?: Partial<TicketFormValues>;
}

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resolve(func(...args)), delay);
    });
  };
};

export default function TicketForm({ onSubmit, initialData }: TicketFormProps) {
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: initialData || {
      description: "",
      location: "",
      repairType: "General",
    },
  });

  const [suggestedTickets, setSuggestedTickets] = useState<SuggestedTicket[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async (desc: string) => {
    if (desc.trim().length < 10) {
      setSuggestedTickets([]);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const results = await suggestRelatedTickets({ description: desc });
      setSuggestedTickets(results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestedTickets([]);
    }
    setIsLoadingSuggestions(false);
  }, []);

  const debouncedFetchSuggestions = useMemo(() => debounce(fetchSuggestions, 1000), [fetchSuggestions]);

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = event.target.value;
    form.setValue("description", newDescription, { shouldValidate: true }); // Update RHF state
    debouncedFetchSuggestions(newDescription);
  };
  
  function handleSubmit(data: TicketFormValues) {
    onSubmit(data);
    form.reset();
    setSuggestedTickets([]);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa el problema en detalle (ej: 'El grifo de la habitación 203 gotea')"
                  {...field}
                  onChange={handleDescriptionChange} 
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isLoadingSuggestions && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando sugerencias...
          </div>
        )}

        {suggestedTickets.length > 0 && !isLoadingSuggestions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Incidencias Anteriores Sugeridas</CardTitle>
              <CardDescription>Estas incidencias anteriores podrían estar relacionadas con su problema:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {suggestedTickets.map((ticket) => (
                <div key={ticket.ticketId} className="text-sm p-2 border rounded-md bg-muted/50">
                  <p className="font-medium">ID de Incidencia: {ticket.ticketId}</p>
                  <p className="text-muted-foreground">{ticket.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área / Número de Habitación</FormLabel>
              <FormControl>
                <Input placeholder="ej: Habitación 101, Vestíbulo, Cocina" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repairType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Reparación</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de reparación" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {repairTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Crear Incidencia</Button>
      </form>
    </Form>
  );
}
