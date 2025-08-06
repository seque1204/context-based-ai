import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  // Use a cheap model and a simple prompt
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      { role: "system", content: `You are a helpful assistant that generates concise and natural-sounding conversation titles. "
                        "Limit titles to 5–8 words in title case. Suggest a title based only on the user's most recent query. "
                        "Here are a few examples:\n"
                        "User: What are the top country artists right now?\n"
                        "Title: Top Country Artists Right Now\n"
                        "User: How does photosynthesis work?\n"
                        "Title: Understanding Photosynthesis\n"
                        "User: Tips for studying for finals?\n"
                        "Title: Study Tips for Finals` },

      { role: "user", content: prompt }
    ],
    max_tokens: 12,
    temperature: 0.7,
  });

  const title = completion.choices[0]?.message?.content?.trim() || "New Chat";
  return NextResponse.json({ title });
}