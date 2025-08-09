"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LiaSpinnerSolid } from "react-icons/lia";
import { toast } from "sonner";

export default function UploadForm() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload-document", {
            method: "POST",
            body: formData,
        });
        console.log("here")
        setLoading(false);

        if (!res.ok) {
            const { error } = await res.json();
            toast(`Error: ${error}`, { style: { background: "#f87171", color: "#fff" } });
        } else {
            toast("Document uploaded & processed!", { style: { background: "#4ade80", color: "#fff" } });
        }

    };

    return (
        <>
            <input
                type="file"
                accept="application/pdf"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleUpload}
            />
            <Button
                variant="outline"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
            >
                {loading ? <LiaSpinnerSolid className="w-5 h-5 animate-spin" /> : "Import PDF"}
            </Button>
        </>
    );
}
