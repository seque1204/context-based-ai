import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAi from "openai";

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
});
// Utility function to chunk text
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        if (end === text.length) break;
        start += chunkSize - overlap;
    }
    return chunks;
}
export async function POST(req: Request) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.getAll().find(
        c => c.name.endsWith('-auth-token.0') || c.name.endsWith('-auth-token.1')
    );
    if (!authCookie) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 403 }
        );
    }
    const request = await req.json();
    console.log('Received request:', request);

    if (!request?.text) {
        return NextResponse.json(
            {
                error: 'Invalid request missing key',
            },
            { status: 422 }
        );
    }
    try {
        // Chunk text by fixed size with overlap
        const paragraphs = chunkText(request.text, 1000, 200);
        
        // Console log the first 4 chunks
        console.log('First 4 chunks:', paragraphs.slice(0, 4));

        const embeddings: number[][] = [];
        let totalTokens = 0;

        for (const paragraph of paragraphs) {
            if (paragraph.trim().length < 10) continue;

            const result = await openai.embeddings.create({
                input: paragraph,
                model: "text-embedding-3-small"
            });
            embeddings.push(result.data[0].embedding);
            totalTokens += result.usage.total_tokens;
        }

        return NextResponse.json({
            embeddings,
            token: totalTokens,
            chunks: paragraphs,
        });
    } catch (error) {
        console.error('Error creating embedding:', error);
        return NextResponse.json(
            {
                error: 'Failed to create embedding',
            },
            { status: 500 }
        );
    }
}
