import { ChatOllama } from '@langchain/ollama';

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollamaChatModel = process.env.OLLAMA_CHAT_MODEL || 'gemma3';

export const chatModel = new ChatOllama({
  baseUrl: ollamaBaseUrl,
  model: ollamaChatModel,
  temperature: 0.7,
});
