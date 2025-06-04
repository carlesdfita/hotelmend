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
  description: z.string().describe('The description of the maintenance ticket.'),
});
export type SuggestRelatedTicketsInput = z.infer<typeof SuggestRelatedTicketsInputSchema>;

const SuggestRelatedTicketsOutputSchema = z.array(
  z.object({
    ticketId: z.string().describe('The ID of the related ticket.'),
    description: z.string().describe('The description of the related ticket.'),
  })
).describe('A list of related tickets.');
export type SuggestRelatedTicketsOutput = z.infer<typeof SuggestRelatedTicketsOutputSchema>;

export async function suggestRelatedTickets(input: SuggestRelatedTicketsInput): Promise<SuggestRelatedTicketsOutput> {
  return suggestRelatedTicketsFlow(input);
}

const searchTickets = ai.defineTool({
  name: 'searchTickets',
  description: 'Search for existing maintenance tickets based on keywords.',
  inputSchema: z.object({
    keywords: z.string().describe('Keywords to search for in existing tickets.'),
  }),
  outputSchema: z.array(
    z.object({
      ticketId: z.string().describe('The ID of the found ticket.'),
      description: z.string().describe('The description of the found ticket.'),
    })
  ),
},
async (input) => {
  // TODO: Implement the actual search for tickets here, replace with database call
  // For now, return some dummy data.
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {ticketId: '123', description: 'Example related ticket 1.'},
    {ticketId: '456', description: 'Example related ticket 2.'},
  ];
});

const prompt = ai.definePrompt({
  name: 'suggestRelatedTicketsPrompt',
  input: {schema: SuggestRelatedTicketsInputSchema},
  output: {schema: SuggestRelatedTicketsOutputSchema},
  tools: [searchTickets],
  prompt: `Based on the following maintenance ticket description, suggest related tickets by using the searchTickets tool to find relevant past tickets.\n\nTicket Description: {{{description}}}`,
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
