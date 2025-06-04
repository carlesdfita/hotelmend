'use server';

/**
 * @fileOverview A flow to suggest related past tickets based on the current ticket's description.
 *
 * - suggestRelatedTickets - A function that suggests related tickets.
 * - SuggestRelatedTicketsInput - The input type for the suggestRelatedTickets function.
 * - SuggestRelatedTicketsOutput - The return type for the suggestRelatedTickets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedTicketsInputSchema = z.object({
  description: z.string().describe('La descripción de la incidencia de mantenimiento.'),
});
export type SuggestRelatedTicketsInput = z.infer<typeof SuggestRelatedTicketsInputSchema>;

const SuggestRelatedTicketsOutputSchema = z.array(
  z.object({
    ticketId: z.string().describe('El ID de la incidencia relacionada.'),
    description: z.string().describe('La descripción de la incidencia relacionada.'),
  })
).describe('Una lista de incidencias relacionadas.');
export type SuggestRelatedTicketsOutput = z.infer<typeof SuggestRelatedTicketsOutputSchema>;

export async function suggestRelatedTickets(input: SuggestRelatedTicketsInput): Promise<SuggestRelatedTicketsOutput> {
  return suggestRelatedTicketsFlow(input);
}

const searchTickets = ai.defineTool({
  name: 'searchTickets',
  description: 'Buscar incidencias de mantenimiento existentes basadas en palabras clave.',
  inputSchema: z.object({
    keywords: z.string().describe('Palabras clave para buscar en incidencias existentes.'),
  }),
  outputSchema: z.array(
    z.object({
      ticketId: z.string().describe('El ID de la incidencia encontrada.'),
      description: z.string().describe('La descripción de la incidencia encontrada.'),
    })
  ),
},
async (input) => {
  // TODO: Implement the actual search for tickets here, replace with database call
  // For now, return some dummy data.
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {ticketId: '123', description: 'Ejemplo de incidencia relacionada 1.'},
    {ticketId: '456', description: 'Ejemplo de incidencia relacionada 2.'},
  ];
});

const prompt = ai.definePrompt({
  name: 'suggestRelatedTicketsPrompt',
  input: {schema: SuggestRelatedTicketsInputSchema},
  output: {schema: SuggestRelatedTicketsOutputSchema},
  tools: [searchTickets],
  prompt: `Basándose en la siguiente descripción de la incidencia de mantenimiento, sugiera incidencias relacionadas utilizando la herramienta searchTickets para encontrar incidencias anteriores relevantes.\n\nDescripción de la Incidencia: {{{description}}}`,
});

const suggestRelatedTicketsFlow = ai.defineFlow(
  {
    name: 'suggestRelatedTicketsFlow',
    inputSchema: SuggestRelatedTicketsInputSchema,
    outputSchema: SuggestRelatedTicketsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
