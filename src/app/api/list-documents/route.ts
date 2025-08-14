import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const supabase = await createClient();

    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.user.id;

    // Query docs table (RLS will filter)
    const { data, error } = await supabase
        .from("docs")
        .select("*")
        .limit(100);

    if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // // Optionally, add a public URL for each file
    // const documents = await Promise.all(data.map(async (doc: any) => {
    //     const { data: urlData } = await supabase
    //         .storage
    //         .from("FileUploads")
    //         .getPublicUrl(doc.storage_path); // storage_path is the file's path in the bucket
    //     return {
    //         ...doc,
    //         publicUrl: urlData?.publicUrl || null,
    //     };
    // }));
    console.log("Documents fetched:", data);
    return NextResponse.json({ documents : data });
}
