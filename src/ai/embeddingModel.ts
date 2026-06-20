import { OllamaEmbeddings } from '@langchain/ollama';

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaEmbeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

export const embeddingModel = new OllamaEmbeddings({
  baseUrl: ollamaBaseUrl,
  model: ollamaEmbeddingModel,
});
