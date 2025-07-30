import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAi from "openai";

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
});

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
        const result = await openai.embeddings.create({
            input: request.text,
            model: "text-embedding-3-small"
        });
        const embedding = result.data[0].embedding;
        const token = result.usage.total_tokens;
        return NextResponse.json({
            embedding,
            token,
        });
    }
    catch (error) {
        console.error('Error creating embedding:', error);
        return NextResponse.json(
            {
                error: 'Failed to create embedding',
            },
            { status: 500 }
        );
    }
}
