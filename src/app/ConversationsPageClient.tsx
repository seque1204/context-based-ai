"use client";
import Conversations from "./components/Conversations";
import Search from "./components/Search";
import React from "react";

export default function ConversationsPageClient() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const handleSelect = (id: string) => setSelectedId(id);
  const handleNew = (id: string) => setSelectedId(id);

  return (
    <div className="h-screen flex justify-center">
      <div className="max-w-5xl w-full h-80vh rounded-sm shadow-sm border flex flex-row p-0 ">
        <Conversations selectedId={selectedId} onSelect={handleSelect} onNew={() => setSelectedId(null)} />
        <div className="flex-1 p-5">
          <Search conversationId={selectedId} onNewConversation={setSelectedId}/>
        </div>
      </div>
    </div>
  );
}
