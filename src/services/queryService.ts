import { classifyQuestion } from '../ai/intentClassifier';
import { searchDatabase } from './databaseSearchService';
import { searchDocuments } from './ragSearchService';
import { generateAnswer } from './answerChain';
import { QueryExecutionResult } from '../types/query';

function formatDatabaseContext(results: Record<string, unknown>[]): string {
  if (results.length === 0) {
    return 'No database results found.';
  }

  return results
    .map((result) => {
      const entries = Object.entries(result)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
      return `{ ${entries} }`;
    })
    .join('\n');
}

function formatDocumentContext(
  documents: Array<{
    id: number;
    content: string;
    metadata: Record<string, unknown>;
  }>
): string {
  if (documents.length === 0) {
    return 'No relevant documents found.';
  }

  return documents
    .map((doc) => {
      const metadata = Object.entries(doc.metadata)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');
      return `Document ID ${doc.id} [${metadata}]:\n${doc.content}`;
    })
    .join('\n\n');
}

export async function handleQuery(question: string): Promise<QueryExecutionResult> {
  const classification = await classifyQuestion(question);

  if (classification.source === 'unsupported') {
    return {
      question,
      classification,
      answer:
        'Lo siento, no puedo ayudarte con esa solicitud. Por favor, verifica tu pregunta.',
      databaseResults: [],
      documentsUsed: [],
    };
  }

  let databaseResults: Record<string, unknown>[] = [];
  let documentsUsed: Array<{
    id: number;
    content: string;
    metadata: Record<string, unknown>;
  }> = [];

  if (classification.source === 'database' || classification.source === 'hybrid') {
    databaseResults = await searchDatabase(classification);
  }

  if (classification.source === 'rag' || classification.source === 'hybrid') {
    documentsUsed = await searchDocuments(question);
  }

  const databaseContext = formatDatabaseContext(databaseResults);
  const documentContext = formatDocumentContext(documentsUsed);

  const context =
    classification.source === 'hybrid'
      ? `Database Context:\n${databaseContext}\n\nDocument Context:\n${documentContext}`
      : classification.source === 'database'
        ? databaseContext
        : classification.source === 'rag'
          ? documentContext
          : 'General knowledge context.';

  const answer = await generateAnswer({
    question,
    context,
  });

  return {
    question,
    classification,
    answer,
    databaseResults,
    documentsUsed,
  };
}
