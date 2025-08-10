"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Search, ScrollText  } from "lucide-react"; // Add at the top
import { LogOut, User } from "lucide-react"; // Optional: modern icon
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from '@/utils/supabase/client'

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

interface ConversationsProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function SidebarHeader({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#8B0000]">
      <Image
        src="/VICILogo.png"
        alt="VICI Logo"
        width={40}
        height={40}
        className="object-contain"
        priority
      />
      <button
        onClick={() => setSidebarOpen(false)}
        className="ml-auto bg-[#C5A572] text-[#1A1A1A] rounded-full p-2 shadow transition hover:bg-[#C5A574]"
        style={{ fontFamily: 'Inter, Arial, sans-serif' }}
        aria-label="Collapse sidebar"
      >
        ⟨
      </button>
    </div>
  );
}

function SidebarActions({ onNew }: { onNew: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 px-4 py-4">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#C5A572]/10 text-[#C5A572] hover:bg-[#C5A572]/20 transition font-medium"
        onClick={onNew}
      >
        <Plus className="w-4 h-4" />
        New chat
      </button>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#C5A572]/10 text-[#C5A572] transition font-medium"
        onClick={() => toast("Search functionality coming soon!")}
      >
        <Search className="w-4 h-4" />
        Search chats
      </button>
      <button 
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#C5A572]/10 text-[#C5A572] transition font-medium"
        onClick={() => router.push("/documents")}
      >
        <ScrollText className="w-4 h-4" />
        Documents
      </button>
    </div>
  );
}

function SidebarDivider() {
  return (
    <div className="px-4">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C5A572]/30 to-transparent my-2" />
    </div>
  );
}

function SidebarChatsList({
  conversations,
  selectedId,
  onSelect,
  loading,
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-2 px-1 hide-scrollbar">
      {loading ? (
        <div className="p-4 text-[#C5A572] text-center text-sm">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="p-4 text-[#C5A572] text-center text-sm">No conversations</div>
      ) : (
        <ul className="space-y-1">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`
                group p-3 rounded-xl cursor-pointer transition
                ${selectedId === conv.id
                  ? "bg-[#C5A572]/20 border border-[#C5A572]/40 shadow-inner"
                  : "hover:bg-[#C5A572]/10"}
              `}
              onClick={() => onSelect(conv.id)}
            >
              <div className="font-medium truncate text-[#1A1A1A] group-hover:text-[#C5A572]">
                {conv.title}
              </div>
              <div className="text-xs text-[#C5A572]/60 mt-1">
                {new Date(conv.updated_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarUser() {
  // Placeholder user info
  const user = {
    name: "John Smith",
    organization: "Your Organization",
    initials: "JS",
  };
  const [open, setOpen] = React.useState(false);

  // Replace with your logout logic
  const supabase = createClient();
  const router = useRouter();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div
      className="relative px-4 py-4 border-t border-[#C5A572]/10 bg-[#FAF7F2]"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-[#C5A572]/10 transition cursor-pointer">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C5A572] to-[#C5A574] flex items-center justify-center text-[#1A1A1A] font-bold text-lg">
          {user.initials}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-medium text-[#1A1A1A]">{user.name}</span>
          <span className="text-xs text-[#C5A572]">{user.organization}</span>
        </div>
      </div>
      {open && (
        <div className="absolute left-4 bottom-16 w-48 bg-[#FAF7F2] border border-[#C5A572]/20 rounded-xl shadow-lg z-10">
          <button
            className="flex items-center gap-2 w-full px-4 py-3 text-[#C5A572] hover:bg-[#C5A572]/10 rounded-xl transition"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Conversations({ selectedId, onSelect, onNew, sidebarOpen, setSidebarOpen }: ConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => {
    const onCreated = () => { fetchConversations(); };
    window.addEventListener('conversation:created', onCreated);
    return () => window.removeEventListener('conversation:created', onCreated);
  }, []);

  async function fetchConversations() {
    setLoading(true);
    const res = await fetch("/api/conversations", { cache: "no-store" });
    const data = await res.json();
    setConversations(data.conversations || []);
    setLoading(false);
  }

  async function handleNewConversation() {
    onNew();
  }

  // Sliver width when closed
  const sliverWidth = "w-16";
  // Full width when open
  const fullWidth = "w-72";

  return (
    <aside
      className={`
        h-full flex flex-col bg-[#FAF7F2] backdrop-blur-xl border-r border-[#8B0000] rounded-l-3xl shadow-2xl shadow-[#C5A572]/20 overflow-hidden
        transition-all duration-300
        ${sidebarOpen ? fullWidth : sliverWidth}
      `}
      style={{ minWidth: sidebarOpen ? "18rem" : "4rem" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#8B0000]">
        <Image
          src="/VICILogo.png"
          alt="VICI Logo"
          width={32}
          height={32}
          className="object-contain"
          priority
        />
        {sidebarOpen ? (
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto bg-[#C5A572] text-[#1A1A1A] rounded-full p-2 shadow transition hover:bg-[#C5A574]"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            aria-label="Collapse sidebar"
          >
            ⟨
          </button>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="ml-auto bg-[#C5A572] text-[#1A1A1A] rounded-full p-2 shadow transition hover:bg-[#C5A574]"
            style={{ fontFamily: 'Inter, Arial, sans-serif' }}
            aria-label="Expand sidebar"
          >
            ⟩
          </button>
        )}
      </div>

      {/* Sliver content when closed */}
      {!sidebarOpen && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            className="bg-[#C5A572]/10 text-[#C5A572] rounded-lg p-2 hover:bg-[#C5A572]/20 transition"
            onClick={handleNewConversation}
            aria-label="New chat"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Full sidebar content when open */}
      {sidebarOpen && (
        <>
          <SidebarActions onNew={handleNewConversation} />
          <SidebarDivider />
          <SidebarChatsList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={onSelect}
            loading={loading}
          />
          <SidebarDivider />
          <SidebarUser />
        </>
      )}
    </aside>
  );
}