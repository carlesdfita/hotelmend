
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
import { importanceLevels } from "@/lib/types"; 
import { suggestRelatedTickets } from "@/ai/flows/suggest-related-tickets";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Definim el tipus per als items de Firestore (Localització o Tipologia amb ID)
interface FirestoreItem {
  id: string;
  name: string;
}

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
  // Rebem les llistes de Firestore com a props
  locations: FirestoreItem[];
  repairTypes: FirestoreItem[];
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

// Rebem locations i repairTypes com a props
export default function TicketForm({ onSubmit, initialData, submitButtonText = "Crear Incidència", locations, repairTypes }: TicketFormProps) {
  // Eliminem els estats locals i l'useEffect de localStorage
  // const [availableRepairTypes, setAvailableRepairTypes] = useState<RepairType[]>(defaultRepairTypes);
  // const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  // useEffect(() => { ... }, []);
  
  const [customLocationValue, setCustomLocationValue] = useState('');
  const [isCustomLocationActive, setIsCustomLocationActive] = useState(false);

  // Extraiem només els noms de les llistes de props per a validacions/comparacions
  const availableLocationNames = useMemo(() => locations.map(loc => loc.name), [locations]);
  const availableRepairTypeNames = useMemo(() => repairTypes.map(type => type.name), [repairTypes]);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    // Ajustem els valors per defecte per utilitzar les llistes de noms de les props
    defaultValues: initialData || {
      location: availableLocationNames.length > 0 ? availableLocationNames[0] : "",
      repairType: availableRepairTypeNames.length > 0 ? availableRepairTypeNames[0] : "General",
      importance: "Important",
      description: "" // Afegim descripció buida per a consistència
    },
  });
  
  // Usem aquest useEffect per fer el reset del formulari quan initialData o les llistes de props canvien
  useEffect(() => {
    // Quan les llistes de localitzacions o tipologies carreguen o canvien,
    // necessitem actualitzar els valors per defecte del formulari si no s'està editant.
    // També ajustem la lògica de ubicació personalitzada.

    const defaultLocation = availableLocationNames.length > 0 ? availableLocationNames[0] : "";
    const defaultRepairType = availableRepairTypeNames.length > 0 ? availableRepairTypeNames[0] : "General";

    if (initialData && Object.keys(initialData).length > 0) {
      form.reset(initialData);
      // Comprovem si la ubicació inicial és custom (existeix i no està a la llista de noms disponibles i no és 'Altra')
      if (initialData.location && !availableLocationNames.includes(initialData.location) && initialData.location !== 'Altra') {
        setIsCustomLocationActive(true);
        setCustomLocationValue(initialData.location);
         // Assegurem que el valor seleccionat al Select sigui 'Altra'
         form.setValue('location', 'Altra', { shouldValidate: true });
      } else {
        setIsCustomLocationActive(false);
        setCustomLocationValue("");
         // Si la ubicació inicial existeix a la llista disponible o és buida/Altra, assegurem que el Select tingui el valor correcte
        if (initialData.location && availableLocationNames.includes(initialData.location)) {
             form.setValue('location', initialData.location, { shouldValidate: true });
        } else if (initialData.location === 'Altra') {
             form.setValue('location', 'Altra', { shouldValidate: true });
        } else { // Si no hi ha initialData.location o no està a la llista, usem el per defecte
             form.setValue('location', defaultLocation, { shouldValidate: true });
        }
      }
      // Pel tipus de reparació, simplement assegurem que el valor initialData existeix a la llista, altrament usem el per defecte
      if (initialData.repairType && availableRepairTypeNames.includes(initialData.repairType)) {
          form.setValue('repairType', initialData.repairType, { shouldValidate: true });
      } else {
           form.setValue('repairType', defaultRepairType, { shouldValidate: true });
      }


    } else { // Mode creació
      form.reset({
        description: "",
        location: defaultLocation,
        repairType: defaultRepairType,
        importance: "Important",
      });
      setIsCustomLocationActive(false);
      setCustomLocationValue("");
    }
    // Reset suggestion state when form is reset (either for new ticket or editing a different one)
    setSuggestedTickets([]);

  }, [initialData, form, availableLocationNames, availableRepairTypeNames]); // Dependències correctes


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
    // La lògica d'ubicació personalitzada ja funciona amb el camp 'location' com a string, que és correcte.
    // Només necessitem assegurar-nos que si 'Altra' està seleccionat, el customLocationValue tingui valor.
    if (data.location === 'Altra') {
        if (customLocationValue.trim() === "") {
             form.setError("location", {type: "manual", message: "Especifiqueu la ubicació personalitzada."});
             return;
        }
        finalData.location = customLocationValue.trim();
    } else if (isCustomLocationActive && customLocationValue.trim() !== '') { // Si es passa de custom a una predefinida
         // No fem res, finalData.location ja té el valor correcte de la predefinida
    }

    onSubmit(finalData);
    setSuggestedTickets([]);
    // Reset custom location state només en mode creació (quan no hi ha initialData)
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
              {/* Utilitzem la prop locations per popular el Select */}
              {locations.length > 0 ? (
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === 'Altra') {
                      setIsCustomLocationActive(true);
                       // Quan se selecciona 'Altra' en mode edició, si la ubicació initialData no estava a la llista,
                       // mantenim aquest valor al camp customLocationValue.
                      if (initialData?.location && !availableLocationNames.includes(initialData.location) && value === 'Altra') {
                         setCustomLocationValue(initialData.location);
                      } else { // Altrament, buidem el camp custom per a que l'usuari introdueixi la nova ubicació
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
                    {/* Iterem sobre la prop locations (objectes {id, name}) */}
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.name}> {/* Usem loc.id per key i loc.name per value i text */}
                        {loc.name}
                      </SelectItem>
                    ))}
                     <SelectItem value="Altra">Altra (especificar)</SelectItem>
                  </SelectContent>
                </Select>
              ) : ( // Si no hi ha ubicacions de Firestore, encara permetem introduir una personalitzada
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
              {/* Mostrem el camp custom només si s'ha seleccionat 'Altra' o si no hi ha ubicacions disponibles de Firestore */}
              {(isCustomLocationActive || locations.length === 0) && (
                 <FormControl>
                    <Input 
                        placeholder="Especificar ubicació" // Canviat el placeholder per ser més general
                        value={customLocationValue}
                        onChange={(e) => setCustomLocationValue(e.target.value)}
                        className="mt-2"
                    />
                 </FormControl>
              )}
               {/* Eliminem el Input addicional ocult, ja no és necessari amb la lògica actual */}
               {/* {!locations.length && (
                  <Input
                    placeholder="ex: Habitació 101, Vestíbul, Cuina"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="hidden" 
                  />
                )}*/}
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
              {/* Utilitzem la prop repairTypes per popular el Select */}
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipus de reparació" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   {/* Iterem sobre la prop repairTypes (objectes {id, name}) */}
                  {repairTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}> {/* Usem type.id per key i type.name per value i text */}
                      {type.name}
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
