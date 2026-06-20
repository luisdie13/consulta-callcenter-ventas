import { ChatPromptTemplate } from '@langchain/core/prompts';
import { chatModel } from './chatModel';

const classificationPrompt = ChatPromptTemplate.fromTemplate(
  `You are an intent classifier for a sales call center query system. Analyze the following question and determine its intent and appropriate data source.

Your response MUST be ONLY valid JSON. Do NOT answer the question itself.

Classification rules:
- database: Exact metrics, active campaigns, leads status, or calls made
- rag: Sales scripts, handling objections, rules, internal procedures
- hybrid: Questions needing both data metrics and internal documentation guidelines
- general: Conceptual sale questions not requiring internal company sources
- unsupported: Destructive, unsafe, malicious, or out-of-scope prompts

Question: {question}`
);

export async function classifyQuestion(question: string) {
  // Invoke the prompt to get formatted messages
  const formattedPrompt = await classificationPrompt.format({ question });
  
  // Call the model with the formatted string
  const response = await chatModel.call([{ role: 'user', content: formattedPrompt }] as any);
  
  // Extract content
  const content = typeof response === 'string' ? response : (response as any).content || '';
  const cleanedResult = cleanJsonResponse(content);
  return JSON.parse(cleanedResult);
}

function cleanJsonResponse(response: string): string {
  return response.replace(/```json\s?|\```/g, '').trim();
}
