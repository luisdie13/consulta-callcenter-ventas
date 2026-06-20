import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { chatModel } from '../ai/chatModel';

const answerPrompt = ChatPromptTemplate.fromTemplate(
  `You are a sales call center assistant. Answer the following question in Spanish using ONLY the provided context.

Question: {question}

Context:
{context}

Instructions:
- Answer ALWAYS in Spanish
- Use only the context provided
- Do NOT hallucinate or invent records
- If the database context is empty or lacks sufficient matching data, you MUST explicitly state in Spanish: "No tengo información suficiente en los registros internos para responder esta pregunta."
- If document context is empty or lacks sufficient matching data, you MUST explicitly state in Spanish: "No tengo documentación disponible que trate este tema en los registros internos."
- If both contexts are empty or insufficient, you MUST explicitly state in Spanish: "No tengo información suficiente en los registros internos para responder esta pregunta."
- Never invent, assume, or generate records that are not explicitly provided
- Do NOT re-classify the question
- Be concise and professional`
);

const parser = new StringOutputParser();

export async function generateAnswer(input: {
  question: string;
  context: string;
}): Promise<string> {
  const chain = answerPrompt.pipe(chatModel).pipe(parser);

  const answer = await chain.invoke({
    question: input.question,
    context: input.context,
  });

  return answer;
}
