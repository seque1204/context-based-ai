"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react'
import { SiAseprite } from "react-icons/si";
import { toast } from 'sonner';

export default function Search() {

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);


  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  }

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (type === "error") {
      toast("Error: " + message, { style: { background: "#f87171", color: "#fff" } });
    } else {
      toast(message, { style: { background: "#4ade80", color: "#fff" } });
    }
  };

  const handleSearch = async () => {
    const searchText = inputRef.current?.value;

    if (searchText && searchText.trim()) {
      const res = await fetch(location.origin + "/embedding", {
        method: "POST",
        body: JSON.stringify({ text: searchText.replace(/\n/g, " ") }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status !== 200) {
        showToast("Failed to create embedding: " + res.statusText, "error");
      } else {
        const data = await res.json();

        const { data: documents } = await supabase.rpc(
          "match_documents",
          {
            query_embedding: data.embedding,
            match_threshold: 0.01,
            match_count: 10,
          }
        );
        console.log(documents);
      }
    }
  };

  return <>
    <div className="flex-1 h-80vh overflow-y-auto space-y-10">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <SiAseprite className="w-5 h-5" />
          <h1>CustomAI</h1>
        </div>
        <Button onClick={handleLogout}> Logout </Button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-indigo-500">
          <SiAseprite className="w-5 h-5" />
          <h1>How to set up supabase with next js</h1>
        </div>
        <p>This is the answer</p>
      </div>
    </div>
    <Input
      ref={inputRef}
      placeholder="Ask me a question"
      className="p-5"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }} />
  </>
}
