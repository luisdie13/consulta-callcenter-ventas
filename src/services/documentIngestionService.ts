import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { supabaseClient } from '../db/supabaseClient';
import { embeddingModel } from '../ai/embeddingModel';

export async function ingestTextDocument(
  title: string,
  category: string,
  content: string,
  tags: string,
  fileName: string
): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 120,
  });

  const doc = new Document({
    pageContent: content,
    metadata: {
      title,
      category,
      tags: tags.split(',').map((t) => t.trim()),
      fileName,
      ingestionDate: new Date().toISOString(),
    },
  });

  const chunks = await splitter.splitDocuments([doc]);

  const vectorStore = await SupabaseVectorStore.fromDocuments(chunks, embeddingModel, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents',
  });

  const ids = chunks.map((_, index) => `${title}-chunk-${index}`);
  return ids;
}
