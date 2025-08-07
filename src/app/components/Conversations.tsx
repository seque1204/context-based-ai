"use client";
import React, { useEffect, useState } from "react";
import { Button } from '@/components/ui/button';
import { MessageCirclePlus } from "lucide-react"; // Optional: modern icon

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationsProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export default function Conversations({ selectedId, onSelect, onNew }: ConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    setLoading(true);
    const res = await fetch("/api/conversations");
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
      <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/10 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <MessageCirclePlus className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-cyan-100 tracking-wide text-lg">Conversations</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-400/10 shadow transition"
          onClick={handleNewConversation}
          aria-label="New Conversation"
        >
          <MessageCirclePlus className="w-5 h-5" />
        </Button>
      </div>
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto py-2 px-1 scrollbar-fade">
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
    </aside>
  );
}