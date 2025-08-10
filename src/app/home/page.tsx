"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #C5A572 100%)', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-gradient-to-br from-[#C5A572] to-[#C5A574] rounded-2xl flex items-center justify-center shadow-lg shadow-[#C5A572]/25 mb-6">
          <Image src="/VICILogo.png" alt="VICI Logo" width={56} height={56} className="w-14 h-14 object-contain" priority />
        </div>
        <h1 className="text-4xl font-bold mb-2 tracking-wide" style={{ fontFamily: 'Cinzel, \"Times New Roman\", serif', color: '#1A1A1A' }}>
          Welcome to VICI
        </h1>
        <p className="text-[#1A1A1A] text-center max-w-xl" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
          Your context-aware AI assistant. Start chatting, manage your conversations, and get instant answers with a modern, glassy interface.
        </p>
      </div>
      <Button
        className="bg-[#C5A572] hover:bg-[#C5A574] text-[#1A1A1A] font-bold rounded-xl px-8 py-4 shadow transition text-lg border border-[#C5A572]/30"
        style={{ fontFamily: 'Inter, Arial, sans-serif' }}
        onClick={() => router.push("/login")}
      >
        Login
      </Button>
    </div>
  );
}
