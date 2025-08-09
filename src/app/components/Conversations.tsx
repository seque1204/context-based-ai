"use client";
import React, { useEffect, useState } from "react";
import { SiAseprite } from "react-icons/si";
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
};

function SidebarHeader() {
  return (
    <div className="flex items-center gap-3 px-5 py-6 border-b border-cyan-500/10">
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow">
        <SiAseprite className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

function SidebarActions({ onNew }: { onNew: () => void }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-2 px-4 py-4">
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition font-medium"
        onClick={onNew}
      >
        <Plus className="w-4 h-4" />
        New chat
      </button>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-cyan-200 transition font-medium"
        onClick={() => toast("Search functionality coming soon!")}
      >
        <Search className="w-4 h-4" />
        Search chats
      </button>
      <button 
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-500/10 text-cyan-200 transition font-medium"
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
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-2" />
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
        <div className="p-4 text-cyan-300/70 text-center text-sm">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="p-4 text-cyan-300/70 text-center text-sm">No conversations</div>
      ) : (
        <ul className="space-y-1">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`
                group p-3 rounded-xl cursor-pointer transition
                ${selectedId === conv.id
                  ? "bg-cyan-900/40 border border-cyan-400/30 shadow-inner"
                  : "hover:bg-cyan-900/20"}
              `}
              onClick={() => onSelect(conv.id)}
            >
              <div className="font-medium truncate text-cyan-100 group-hover:text-cyan-300">
                {conv.title}
              </div>
              <div className="text-xs text-cyan-300/60 mt-1">
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
      className="relative px-4 py-4 border-t border-cyan-500/10"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-cyan-500/10 transition cursor-pointer">
        <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-lg">
          {user.initials}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-medium text-cyan-100">{user.name}</span>
          <span className="text-xs text-cyan-300">{user.organization}</span>
        </div>
      </div>
      {open && (
        <div className="absolute left-4 bottom-16 w-48 bg-slate-800 border border-cyan-500/20 rounded-xl shadow-lg z-10">
          <button
            className="flex items-center gap-2 w-full px-4 py-3 text-cyan-200 hover:bg-cyan-500/10 rounded-xl transition"
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

export default function Conversations({ selectedId, onSelect, onNew }: ConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Refresh the list when a new conversation is created elsewhere
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

  return (
    <aside className="w-72 h-full flex flex-col bg-slate-800/60 backdrop-blur-xl border-r border-cyan-500/20 rounded-l-3xl shadow-2xl shadow-cyan-900/20 overflow-hidden">
      {/* Header */}
      <SidebarHeader />
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
    </aside>
  );
}