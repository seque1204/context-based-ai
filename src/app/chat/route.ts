import OpenAI from "openai";
import { NextRequest } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  const { question, context, history = [] } = await req.json();
  const systemPrompt = `
  You are CustomAI., an educational AI assistant. Your main goal is to help students learn by providing concise, clear, and thought-provoking answers.
  You may be provided with a "Context" section containing relevant information. Use this context to inform your answers, but do not copy it verbatim. If the context is not sufficient to answer the question, say so honestly and anwer based on your best judgment.

    Your answers should:
    - Be brief and to the point.
    - Encourage the student to think critically or explore further, rather than just giving away the answer.
    - Use simple, accessible language.
    - Ask follow-up questions or suggest next steps when appropriate.
    - If you don't know, say "I'm not sure based on the provided context." and answer based on your general knowledge.
    - If you answer a question, always provide a brief explanation of the concept or reasoning behind it.
    - If the question is about a specific topic, provide a brief overview or explanation of that topic.
    - If the question is about a problem, guide the student through the thought process to solve it, rather than just providing the solution.

Always prioritize helping the student understand concepts and develop problem-solving skills. 

Respond in markdown format, using appropriate formatting for code, equations, and lists.`;

  const messages: ChatCompletionMessageParam[] = [
  { role: "system", content: systemPrompt } as const,
  ...history,
  ...(context ? [{ role: "system", content: `Context:\n${context}` } as const] : []),
  { role: "user", content: question } as const,
];
    console.log("Messages:", messages);
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true,
  });
  const encoder = new TextEncoder();
  const transformStream = new TransformStream<string>({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0].delta?.content;
        if (text) controller.enqueue(encoder.encode(text));
      }
      controller.terminate?.(); // Close the stream when done
    }
  });

  return new Response(transformStream.readable, {
    headers: { "Content-Type": "text/event-stream" },
  });
}