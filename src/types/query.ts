import { z } from 'zod';

export type QuerySource = 'database' | 'rag' | 'hybrid' | 'general' | 'unsupported';

export const IntentClassificationSchema = z.object({
  source: z.enum(['database', 'rag', 'hybrid', 'general', 'unsupported']),
  intent: z.string(),
  confidence: z.number().min(0).max(1),
  entities: z.object({
    table: z.enum(['agents', 'campaigns', 'leads', 'calls']).nullable(),
    leadStatus: z.string().nullable(),
    interestLevel: z.string().nullable(),
    agentName: z.string().nullable(),
    campaignStatus: z.string().nullable(),
    documentTopic: z.string().nullable(),
  }),
});

export type IntentClassification = z.infer<typeof IntentClassificationSchema>;

export interface QueryExecutionResult {
  question: string;
  classification: IntentClassification;
  answer: string;
  databaseResults: Record<string, unknown>[];
  documentsUsed: Array<{
    id: number;
    content: string;
    metadata: Record<string, unknown>;
  }>;
}
