
'use server';

/**
 * @fileOverview Un flux per suggerir incidències anteriors relacionades basant-se en la descripció de la incidència actual.
 *
 * - suggestRelatedTickets - Una funció que suggereix incidències relacionades.
 * - SuggestRelatedTicketsInput - El tipus d'entrada per a la funció suggestRelatedTickets.
 * - SuggestRelatedTicketsOutput - El tipus de retorn per a la funció suggestRelatedTickets.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedTicketsInputSchema = z.object({
  description: z.string().describe('La descripció de la incidència de manteniment.'),
});
export type SuggestRelatedTicketsInput = z.infer<typeof SuggestRelatedTicketsInputSchema>;

const SuggestRelatedTicketsOutputSchema = z.array(
  z.object({
    ticketId: z.string().describe("L'ID de la incidència relacionada."),
    description: z.string().describe('La descripció de la incidència relacionada.'),
  })
).describe("Una llista d'incidències relacionades.");
export type SuggestRelatedTicketsOutput = z.infer<typeof SuggestRelatedTicketsOutputSchema>;

export async function suggestRelatedTickets(input: SuggestRelatedTicketsInput): Promise<SuggestRelatedTicketsOutput> {
  return suggestRelatedTicketsFlow(input);
}

const searchTickets = ai.defineTool({
  name: 'searchTickets',
  description: 'Cercar incidències de manteniment existents basant-se en paraules clau.',
  inputSchema: z.object({
    keywords: z.string().describe('Paraules clau per cercar en incidències existents.'),
  }),
  outputSchema: z.array(
    z.object({
      ticketId: z.string().describe("L'ID de la incidència trobada."),
      description: z.string().describe('La descripció de la incidència trobada.'),
    })
  ),
},
async (input) => {
  // TODO: Implement the actual search for tickets here, replace with database call
  // For now, return some dummy data.
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {ticketId: '123', description: "Exemple d'incidència relacionada 1."},
    {ticketId: '456', description: "Exemple d'incidència relacionada 2."},
  ];
});

const prompt = ai.definePrompt({
  name: 'suggestRelatedTicketsPrompt',
  input: {schema: SuggestRelatedTicketsInputSchema},
  output: {schema: SuggestRelatedTicketsOutputSchema},
  tools: [searchTickets],
  prompt: `Basant-se en la següent descripció de la incidència de manteniment, suggeriu incidències relacionades utilitzant l'eina searchTickets per trobar incidències anteriors rellevants.\n\nDescripció de la Incidència: {{{description}}}`,
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
