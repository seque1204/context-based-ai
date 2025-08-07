"use client";
import React from "react";
import { SiAseprite } from "react-icons/si";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-6">
          <SiAseprite className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-cyan-100 mb-2 tracking-wide">
          Welcome to CustomAI
        </h1>
        <p className="text-cyan-200 text-center max-w-xl">
          Your context-aware AI assistant. Start chatting, manage your
          conversations, and get instant answers with a modern, glassy interface.
        </p>
      </div>
      <Button
        className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl px-8 py-4 shadow transition text-lg"
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    </div>
  );
}
