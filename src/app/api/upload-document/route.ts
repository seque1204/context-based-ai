export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const formData = await req.formData();
        const file = formData.get("file") as File;
        console.log("File object:", file);

        if (!file) {
            return NextResponse.json({ error: "No file" }, { status: 400 });
        }
        /*
                // Convert file to Node Buffer
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                console.log("Buffer type:", typeof buffer, "Is Buffer:", Buffer.isBuffer(buffer));
        
                // // Parse PDF
                // console.log("About to parse PDF, buffer length:", buffer.length);
                // const data = await pdfParse(buffer);
                // console.log("PDF parsed successfully", data.text);
                // const text = data.text.replace(/\n+/g, " ").trim();
        
                // // Get user
                // const { data: { user } } = await supabase.auth.getUser();
        
                // // Generate embedding
                // const embeddingRes = await fetch(process.env.NEXT_PUBLIC_URL + "/embedding", {
                //     method: "POST",
                //     body: JSON.stringify({ text }),
                //     headers: {
                //         "Content-Type": "application/json",
                //         Cookie: req.headers.get("cookie") || ""
                //     },
                // });
                // const { embeddings, chunks, token } = await embeddingRes.json();
        
                // // Get org_id
                // const { data: userRow } = await supabase
                //     .from("users")
                //     .select("org_id")
                //     .eq("id", user?.id)
                //     .single();
        
                // // Store in DB
                // // Store each chunk and its embedding in DB
                // for (let i = 0; i < chunks.length; i++) {
                //     const { error } = await supabase.from("documents").insert({
                //         content: chunks[i],
                //         embedding: embeddings[i],
                //         token,
                //         user_id: user?.id,
                //         org_id: userRow?.org_id,
                //         created_at: new Date().toISOString(),
                //     });
        
                //     if (error) {
                //         console.error("Database insert error:", error);
                //         return NextResponse.json({ error: error.message }, { status: 500 });
                //     }
                // }
        */

        interface UploadResult {
            data: any;
            error: { message: string } | null;
        }

        async function uploadFile(file: File): Promise<UploadResult> {
            return await supabase.storage.from("FileUploads").upload(`/${file.name}`, file);
        }

        const { data, error }: UploadResult = await uploadFile(file);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        } else {
            return NextResponse.json({ success: true });
        }

    } catch (err: any) {
        console.error("Upload error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}


