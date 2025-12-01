'use server';
/**
 * @fileOverview A flow to analyze the demand for a specific PUC.
 *
 * - analyzePucDemand - A function that handles the PUC demand analysis.
 * - PucDemandAnalysisInput - The input type for the analyzePucDemand function.
 * - PucDemandAnalysisOutput - The return type for the analyzePucDemand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PucDemandAnalysisInputSchema = z.object({
    pucCode: z.string().describe('The code of the PUC to analyze.'),
    variety: z.string().describe('The variety of the produce from the PUC.'),
    commodity: z.string().describe('The commodity type of the produce.'),
    qualityMetrics: z.string().describe('Key quality metrics for the PUC (e.g., packout, defects).'),
});
export type PucDemandAnalysisInput = z.infer<typeof PucDemandAnalysisInputSchema>;

const PucDemandAnalysisOutputSchema = z.object({
    summary: z.string().describe('A brief summary of the demand analysis.'),
    qualityRating: z.object({
        rating: z.number().min(1).max(5).describe('A 1-5 star rating of the PUC quality, can be a float.'),
        assessment: z.string().describe('A short assessment of the quality.'),
    }),
    globalDemand: z.array(z.object({
        country: z.string().describe('The target country or market.'),
        demand_level: z.enum(['High', 'Medium', 'Low']).describe('The level of demand in that market.'),
        notes: z.string().describe('Specific notes about the demand in this market.'),
    })).describe('An array of global demand analysis for different markets.'),
    licenseRequirements: z.array(z.object({
        licenseName: z.string().describe('The name of the required license or certification.'),
        importance: z.enum(['Crucial', 'Recommended', 'Optional']).describe('The importance of the license.'),
        details: z.string().describe('Details about the license and why it is required.'),
    })).describe('An array of license and certification requirements for target markets.'),
    recommendations: z.string().describe('Actionable recommendations for the producer to improve demand and market access.'),
});
export type PucDemandAnalysisOutput = z.infer<typeof PucDemandAnalysisOutputSchema>;

const prompt = ai.definePrompt({
    name: 'pucDemandAnalysisPrompt',
    input: { schema: PucDemandAnalysisInputSchema },
    output: { schema: PucDemandAnalysisOutputSchema },
    prompt: `
    You are an expert agricultural market analyst for the South African produce export industry.
    Your task is to provide a detailed demand analysis for a specific Production Unit Code (PUC).

    Analyze the following PUC details:
    - PUC Code: {{{pucCode}}}
    - Commodity: {{{commodity}}}
    - Variety: {{{variety}}}
    - Quality Metrics: {{{qualityMetrics}}}

    Based on this information, provide the following analysis:

    1.  **Summary**: Write a concise, one-sentence summary of the overall market outlook for this PUC.
    2.  **Quality Rating**: 
        -   Give a quality rating from 1 to 5 stars (e.g., 4.5).
        -   Write a brief, insightful assessment of the quality based on the provided metrics, explaining your rating.
    3.  **Global Demand**: Identify 3-4 key global markets for this commodity and variety. For each market, specify the country, the demand level (High, Medium, or Low), and provide brief notes on market preferences, competition, or price points.
    4.  **License Requirements**: List 2-3 crucial or recommended licenses/certifications needed to access these key markets (e.g., GlobalG.A.P., SIZA, FairTrade). For each, state its importance (Crucial, Recommended, Optional) and provide a short detail on why it's needed.
    5.  **Recommendations**: Provide a detailed, multi-paragraph set of actionable recommendations for the producer. This should cover suggestions for quality improvement, targeting specific markets, and any other strategies to enhance profitability and demand. Use markdown for formatting.
    `,
});

const pucDemandAnalysisFlow = ai.defineFlow(
    {
        name: 'pucDemandAnalysisFlow',
        inputSchema: PucDemandAnalysisInputSchema,
        outputSchema: PucDemandAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('Failed to generate analysis.');
        }
        return output;
    }
);


export async function analyzePucDemand(input: PucDemandAnalysisInput): Promise<PucDemandAnalysisOutput> {
    return pucDemandAnalysisFlow(input);
}
