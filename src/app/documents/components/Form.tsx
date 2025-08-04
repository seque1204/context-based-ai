"use client"
import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { LiaSpinnerSolid } from "react-icons/lia";
import { createClient } from '@/utils/supabase/client';
import { toast } from "sonner"


export default function Form() {
    const [supabase] = useState(() => createClient());
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [loading, setLoading] = useState(false);
    const showToast = (message: string, type: "success" | "error" = "success") => {
        if (type === "error") {
            toast("Error: " + message, { style: { background: "#f87171", color: "#fff" } });
        } else {
            toast(message, { style: { background: "#4ade80", color: "#fff" } });
        }
    };
    const handleSubmit = async () => {
        setLoading(true);
        const content = inputRef.current?.value;
        if (content && content.trim()) {
            const res = await fetch(location.origin + "/embedding", {
                method: "POST",
                body: JSON.stringify({ text: content.replace(/\n/g, " ") }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },

            });

            if (res.status !== 200) {
                showToast("Failed to create embedding: " + res.statusText, "error");
                console.error("Error submitting data:", res.statusText);
                setLoading(false);
                return;
            } else {
                const result = await res.json();
                const embedding = result.embedding;
                const token = result.token;
                const client = await supabase;
                const { data: { user } } = await client.auth.getUser();
                const { data:  userRow }  = await client
                    .from("users")
                    .select("school_id")
                    .eq("id", user?.id)
                    .single();
                const { error } = await client.from("documents").insert({
                    content,
                    embedding,
                    token,
                    user_id: user?.id,
                    created_at : new Date().toISOString(),
                    school_id : userRow?.school_id,
                });

                if (error) {
                    showToast("Failed to insert data: " + error.message, "error");
                } else {
                    showToast("Data submitted successfully", "success");
                    inputRef.current!.value = "";
                }

            }
        }
        setLoading(false);
    };

    return (
        <>
            <Textarea
                placeholder="Add your dataset"
                className="h-96"
                ref={inputRef}
            />
            <Button
                className="w-full"
                onClick={handleSubmit}>
                {loading && <LiaSpinnerSolid className="w-5 h-5 animate-spin" />}
                submit
            </Button>
        </>
    )
}
