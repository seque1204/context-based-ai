"use client";
import React, { useEffect, useState } from "react";
import { Button } from '@/components/ui/button';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationsProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: (id: string) => void;
}

export default function Conversations({ selectedId, onSelect, onNew }: ConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

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
    setCreating(true);
    const title = prompt("Enter a title for the new conversation:");
    if (!title) {
      setCreating(false);
      return;
    }
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.conversation) {
      setConversations([data.conversation, ...conversations]);
      onNew(data.conversation.id);
    }
  }

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="font-bold">Conversations</span>
        <Button size="sm" onClick={handleNewConversation} disabled={creating}>
          +
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3 text-gray-500">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-3 text-gray-500">No conversations</div>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedId === conv.id ? "bg-gray-200" : ""}`}
                onClick={() => onSelect(conv.id)}
              >
                <div className="font-medium truncate">{conv.title}</div>
                <div className="text-xs text-gray-500">{new Date(conv.updated_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
