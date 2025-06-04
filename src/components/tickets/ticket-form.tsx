
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
import type { Ticket, RepairType, SuggestedTicket, ImportanceLevel } from "@/lib/types";
import { defaultRepairTypes, importanceLevels } from "@/lib/types"; 
import { suggestRelatedTickets } from "@/ai/flows/suggest-related-tickets";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ticketFormSchema = z.object({
  description: z.string().min(10, { message: "La descripció ha de tenir almenys 10 caràcters." }),
  location: z.string().min(1, { message: "La ubicació és obligatòria." }),
  repairType: z.string().min(1, { message: "El tipus de reparació és obligatori."}),
  importance: z.enum(importanceLevels, { message: "La importància és obligatòria."}),
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

export default function TicketForm({ onSubmit, initialData, submitButtonText = "Crear Incidència" }: TicketFormProps) {
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
    defaultValues: initialData || { importance: "Important" },
  });
  
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      form.reset(initialData);
      if (initialData.location && !availableLocations.includes(initialData.location) && initialData.location !== 'Altra') {
        setIsCustomLocationActive(true);
        setCustomLocationValue(initialData.location);
      } else {
        setIsCustomLocationActive(false);
        setCustomLocationValue("");
      }
    } else {
      form.reset({
        description: "",
        location: availableLocations.length > 0 ? availableLocations[0] : "",
        repairType: availableRepairTypes.length > 0 ? availableRepairTypes[0] : "General",
        importance: "Important",
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
    if (data.location === 'Altra' && isCustomLocationActive) {
      if (customLocationValue.trim() === "") {
        form.setError("location", {type: "manual", message: "Especifiqueu la ubicació personalitzada o seleccioneu-ne una d'existent."});
        return;
      }
      finalData.location = customLocationValue.trim();
    } else if (data.location === 'Altra' && !isCustomLocationActive) {
       form.setError("location", {type: "manual", message: "Seleccioneu 'Altra' i especifiqueu la ubicació."});
       return;
    }
    
    onSubmit(finalData);
    setSuggestedTickets([]);
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
              <FormLabel>Descripció</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descriviu el problema en detall (ex: 'L'aixeta de l'habitació 203 degota')"
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
            Carregant suggeriments...
          </div>
        )}

        {suggestedTickets.length > 0 && !isLoadingSuggestions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Incidències Anteriors Suggerides</CardTitle>
              <CardDescription>Aquestes incidències anteriors podrien estar relacionades amb el vostre problema:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-48 overflow-y-auto">
              {suggestedTickets.map((ticket) => (
                <div key={ticket.ticketId} className="text-sm p-2 border rounded-md bg-muted/50">
                  <p className="font-medium">ID d'Incidència: {ticket.ticketId}</p>
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
              <FormLabel>Àrea / Número d'Habitació</FormLabel>
              {availableLocations.length > 0 ? (
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'Altra') {
                      setIsCustomLocationActive(true);
                      if (initialData?.location && !availableLocations.includes(initialData.location) && value === 'Altra') {
                         setCustomLocationValue(initialData.location);
                      } else {
                         setCustomLocationValue('');
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
                      <SelectValue placeholder="Seleccionar ubicació predefinida" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                     <SelectItem value="Altra">Altra (especificar)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <FormControl>
                  <Input 
                    placeholder="ex: Habitació 101, Vestíbul, Cuina" 
                    {...field} 
                    onChange={(e) => {
                        field.onChange(e.target.value);
                        setIsCustomLocationActive(true); 
                        setCustomLocationValue(e.target.value);
                    }}
                  />
                </FormControl>
              )}
              {isCustomLocationActive && availableLocations.length > 0 && (
                 <FormControl>
                    <Input 
                        placeholder="Especificar una altra ubicació" 
                        value={customLocationValue}
                        onChange={(e) => setCustomLocationValue(e.target.value)}
                        className="mt-2"
                    />
                 </FormControl>
              )}
               {!availableLocations.length && (
                  <Input
                    placeholder="ex: Habitació 101, Vestíbul, Cuina"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="hidden" 
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
              <FormLabel>Tipus de Reparació</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipus de reparació" />
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

        <FormField
          control={form.control}
          name="importance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importància</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivell d'importància" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {importanceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
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
