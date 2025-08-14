"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Document {
    object_id: string;
    name: string;
    uploaded_by: string;
    [key: string]: any;
}

export default function DocumentList() {
    const supabase = createClient();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setLoading(false);
                return;
            }
            setUserId(user.id);
            const res = await fetch("/api/list-documents");
            const data = await res.json();
            setDocuments(data.documents || []);
            setLoading(false);
        };
        fetchDocuments();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!documents.length) return <div>No documents available.</div>;

    const yourDocuments = documents.filter(doc => doc.uploaded_by === userId);
    const orgDocuments = documents.filter(doc => doc.uploaded_by !== userId);

    return (
        <div className="w-full text-left px-2">
            {/* Organizational Documents */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-3 text-[#C5A572]">Organizational Documents</h2>
                {orgDocuments.length ? (
                    <div className="grid grid-cols-2 gap-4">
                        {orgDocuments.map(doc => (
                            <div key={doc.object_id} className="py-2 px-3 rounded hover:bg-[#f5ecd6] transition">
                                <span className="font-semibold text-[#1A1A1A]">{doc.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[#8B0000]">No organizational documents.</p>
                )}
            </section>

            {/* Your Documents */}
            <section className="mb-10">
                <h2 className="text-2xl font-bold mb-3 text-[#C5A572]">Your Documents</h2>
                {yourDocuments.length ? (
                    <div className="grid grid-cols-2 gap-4">
                        {yourDocuments.map(doc => (
                            <div key={doc.object_id} className="py-2 px-3 rounded hover:bg-[#f5ecd6] transition">
                                <span className="font-semibold text-[#1A1A1A]">{doc.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[#8B0000]">No personal documents.</p>
                )}
            </section>
        </div>
    );
}