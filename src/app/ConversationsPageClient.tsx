"use client";
import Conversations from "./components/Conversations";
import Search from "./components/Search";
import React from "react";

export default function ConversationsPageClient() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const handleSelect = (id: string) => setSelectedId(id);
  const handleNew = (id: string) => setSelectedId(id);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      {sidebarOpen && (
        <Conversations
          selectedId={selectedId}
          onSelect={handleSelect}
          onNew={() => setSelectedId(null)}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}
      {/* Expand Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 bg-[#C5A572] text-[#1A1A1A] rounded-full p-2 shadow transition hover:bg-[#C5A574]"
          style={{ fontFamily: 'Inter, Arial, sans-serif' }}
          aria-label="Expand sidebar"
        >
          ⟩
        </button>
      )}
      {/* Main Content */}
      <div className="flex-1">
        <Search conversationId={selectedId} onNewConversation={setSelectedId} />
      </div>
    </div>
  );
}
