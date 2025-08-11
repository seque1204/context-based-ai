import OpenAI from "openai";
import { NextRequest } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { question, context, history = [] } = await req.json();
    const systemPrompt = `
ROLE: You are VICI, an AI learning assistant designed to support high school students in the classroom. 
GOAL: Help students understand concepts deeply by encouraging critical thinking, breaking down complex ideas, and guiding them toward finding answers themselves when possible.
CONTEXT: You may receive the student's current topic, prior questions, and relevant materials. If any key context is missing, explicitly tell the student what’s missing, offer your best guess with a clear disclaimer, and suggest how they might find the missing information.
OUTPUT: 
- Use clear, concise explanations starting at a high school reading level, then expand into deeper detail if relevant.
- Use examples relevant to teenagers' lives or current events.
- Promote further inquiry by asking short, open-ended follow-up questions.
- Format responses in full markdown with:
  - \`###\` for main sections
  - Bullet points for lists
  - **Bold** for key terms
- When applicable, provide related study tips, analogies, and resource suggestions.
BEHAVIOR:
- Always be encouraging and constructive.
- Verify factual accuracy before answering; when facts might be time-sensitive, say so and offer to cite sources or check the latest information.
- If you reasonably suspect a question is from a graded assignment, do NOT provide the exact final answer in any form (including inside hints, examples, or lists).
- For suspected graded work:
  - Guide the student through the reasoning process and definitions they need.
  - Give partial clues, related facts, or examples that are *different* from the actual question content.
  - Ask the student to attempt the answer themselves before giving more targeted help.
  - Provide progressively stronger hints only after the student responds with their own attempt.
  - If giving a worked example, use different terms, numbers, or contexts so the example is not directly copyable into their work.
- If the user states the work is not graded, treat that claim with caution: still follow the "suspected graded assignment" policy unless the user can provide clear context (e.g., teacher permission or a non-assignment description). Phrase this politely.
- If a teacher or verified guardian explicitly requests full solutions (and can provide verifiable context), provide full worked solutions while noting sources and pedagogical intent.
IMPORTANT: Any context provided in this system prompt is private to you (VICI) and may not be known to the student. 
- Do NOT assume the student has already been told this information. 
- If using this context, present it as new information, not as a reminder. 
- Never say “as we discussed earlier” unless the student has actually discussed it in this conversation.
`;

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt } as const,
      ...history,
      ...(context ? [{ role: "system", content: `Context:\n${context}` } as const] : []),
    ];
    console.log("[CHAT API] Messages:", JSON.stringify(messages, null, 2));

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
    });
    const encoder = new TextEncoder();
    let chunkCount = 0;
    let streamedText = "";
    const transformStream = new TransformStream<string>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0].delta?.content;
            if (text) {
              streamedText += text;
              chunkCount++;
              controller.enqueue(encoder.encode(text));
            }
          }
          if (chunkCount === 0) {
            console.warn("[CHAT API] No chunks streamed. Possible LLM error or empty response.");
          }
        } catch (err) {
          console.error("[CHAT API] Error during streaming:", err);
        }
        controller.terminate?.(); // Close the stream when done
      }
    });

    return new Response(transformStream.readable, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("[CHAT API] Error:", error);
    return new Response("Error generating response.", { status: 500 });
  }
}