import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { supabaseClient } from '../db/supabaseClient';
import { embeddingModel } from '../ai/embeddingModel';

export interface DocumentResult {
  id: number;
  content: string;
  metadata: Record<string, unknown>;
}

export async function searchDocuments(searchText: string): Promise<DocumentResult[]> {
  const vectorStore = new SupabaseVectorStore(embeddingModel, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents',
  });

  const results = await vectorStore.similaritySearch(searchText, 4);

  return results.map((doc, index: number) => ({
    id: index + 1,
    content: doc.pageContent,
    metadata: doc.metadata || {},
  }));
}
