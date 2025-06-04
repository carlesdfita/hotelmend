
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
import { defaultRepairTypes } from "@/lib/types"; 
import { suggestRelatedTickets } from "@/ai/flows/suggest-related-tickets";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ticketFormSchema = z.object({
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  location: z.string().min(1, { message: "La ubicación es obligatoria." }),
  repairType: z.string().min(1, { message: "El tipo de reparación es obligatorio."}),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  onSubmit: (data: TicketFormValues) => void;
  initialData?: Partial<TicketFormValues>;
  submitButtonText?: string;
}

const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resolve(func(...args)), delay);
    });
  };
};

export default function TicketForm({ onSubmit, initialData, submitButtonText = "Crear Incidencia" }: TicketFormProps) {
  const [availableRepairTypes, setAvailableRepairTypes] = useState<RepairType[]>(defaultRepairTypes);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  
  const [customLocationValue, setCustomLocationValue] = useState('');
  const [isCustomLocationActive, setIsCustomLocationActive] = useState(false);

  useEffect(() => {
    const storedRepairTypes = localStorage.getItem('repairTypes');
    if (storedRepairTypes) {
      setAvailableRepairTypes(JSON.parse(storedRepairTypes));
    }
    const storedLocations = localStorage.getItem('locations');
    if (storedLocations) {
      setAvailableLocations(JSON.parse(storedLocations));
    }
  }, []);
  
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: initialData || {}, // Default values are now more effectively handled by useEffect
  });
  
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      form.reset(initialData);
      // Handle "Otra" location for editing
      if (initialData.location && !availableLocations.includes(initialData.location) && initialData.location !== 'Otra') {
        setIsCustomLocationActive(true);
        setCustomLocationValue(initialData.location);
        // We keep initialData.location as is in the form, Select will display it if not in options
      } else {
        setIsCustomLocationActive(false);
        setCustomLocationValue("");
      }
    } else {
      // For creating a new ticket or if initialData is empty
      form.reset({
        description: "",
        location: availableLocations.length > 0 ? availableLocations[0] : "",
        repairType: availableRepairTypes.length > 0 ? availableRepairTypes[0] : "General",
      });
      setIsCustomLocationActive(false);
      setCustomLocationValue("");
    }
    setSuggestedTickets([]);
  }, [initialData, form, availableRepairTypes, availableLocations]);


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
    form.setValue("description", newDescription, { shouldValidate: true }); 
    debouncedFetchSuggestions(newDescription);
  };
  
  function handleSubmit(data: TicketFormValues) {
    let finalData = { ...data };
    if (data.location === 'Otra' && isCustomLocationActive) {
      if (customLocationValue.trim() === "") {
        form.setError("location", {type: "manual", message: "Especifique la ubicación personalizada o seleccione una existente."});
        return;
      }
      finalData.location = customLocationValue.trim();
    } else if (data.location === 'Otra' && !isCustomLocationActive) {
       // This case should ideally not happen if UI is right, but as a safeguard
       form.setError("location", {type: "manual", message: "Seleccione 'Otra' y especifique la ubicación."});
       return;
    }
    
    onSubmit(finalData);
    // Form reset is handled by parent dialog closing or by useEffect when initialData changes.
    setSuggestedTickets([]);
    // Reset custom location fields for next use if it's a create form context
    if (!initialData) {
        setIsCustomLocationActive(false);
        setCustomLocationValue("");
    }
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
              {availableLocations.length > 0 ? (
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'Otra') {
                      setIsCustomLocationActive(true);
                      // If editing and switching to 'Otra', preserve existing custom text if any, or clear for new input.
                      // For now, if they switch to 'Otra', they are expected to type/confirm.
                      // If initialData.location was custom, customLocationValue is already set.
                      // If they select 'Otra' from a predefined, customLocationValue may be empty.
                      if (initialData?.location && !availableLocations.includes(initialData.location) && value === 'Otra') {
                         setCustomLocationValue(initialData.location); // Keep if was custom
                      } else {
                         setCustomLocationValue(''); // Clear for new custom input or if switched from predefined
                      }
                    } else {
                      setIsCustomLocationActive(false);
                      setCustomLocationValue(""); 
                    }
                  }} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar ubicación predefinida" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                     <SelectItem value="Otra">Otra (especificar)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                 // Fallback to input if no predefined locations (also handles initial custom value for edit)
                <FormControl>
                  <Input 
                    placeholder="ej: Habitación 101, Vestíbulo, Cocina" 
                    {...field} 
                    // If there are no available locations, this input is the direct source
                    // and the "Otra" logic is not needed here.
                    // isCustomLocationActive should be true in this scenario.
                    // And customLocationValue should mirror field.value.
                    // This part is simplified: if no availableLocations, it's just a text input.
                    // The 'useEffect' populates field.value correctly for edit.
                    // For create, it's an empty input.
                    onChange={(e) => {
                        field.onChange(e.target.value);
                        // If there are no predefined locations, this input is the direct source.
                        // We can treat this as a custom location scenario by default.
                        setIsCustomLocationActive(true); 
                        setCustomLocationValue(e.target.value);
                    }}
                  />
                </FormControl>
              )}
              {isCustomLocationActive && availableLocations.length > 0 && ( // Only show custom input if 'Otra' is selected AND there are predefined options
                 <FormControl>
                    <Input 
                        placeholder="Especificar otra ubicación" 
                        value={customLocationValue}
                        onChange={(e) => setCustomLocationValue(e.target.value)}
                        className="mt-2"
                    />
                 </FormControl>
              )}
               {!availableLocations.length && ( // If no predefined locations, ensure the input is directly tied to the form value
                  <Input
                    placeholder="ej: Habitación 101, Vestíbulo, Cocina"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="hidden" // This is just to satisfy RHF, actual input rendered above
                  />
                )}
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
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de reparación" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableRepairTypes.map((type) => (
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
        <Button type="submit" className="w-full">{submitButtonText}</Button>
      </form>
    </Form>
  );
}
