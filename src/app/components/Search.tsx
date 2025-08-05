"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react'
import { SiAseprite } from "react-icons/si";
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';


interface SearchProps {
  conversationId: string | null;
}

export default function Search({ conversationId }: SearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  interface Message {
    role: string;
    content: string;
  }
  const [messages, setMessages] = useState<Message[]>([]);
  const supabase = createClient();
  // Ref for auto-scroll
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load messages when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    fetch(`/api/messages/${conversationId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages.map((msg: any) => ({ role: msg.role, content: msg.content })));
        } else {
          setMessages([]);
        }
        setLoading(false);
      });
  }, [conversationId]);

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
    if (!conversationId) {
      showToast("Please select or create a conversation first.", "error");
      return;
    }
    const searchText = inputRef.current?.value;
    if (!searchText || !searchText.trim()) return;


    setLoading(true);
    // Add user message and placeholder assistant message before building history
    setMessages(prev => {
      const updated = [...prev, { role: 'user', content: searchText }, { role: 'assistant', content: '' }];
      return updated;
    });
    if (inputRef.current) inputRef.current.value = "";

    // 1. Get embedding
    const res = await fetch(location.origin + "/embedding", {
      method: "POST",
      body: JSON.stringify({ text: searchText.replace(/\n/g, " ") }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (res.status !== 200) {
      showToast("Failed to create embedding: " + res.statusText, "error");
      setMessages(prev => {
        const updated = [...prev];
        // Find the last assistant message (placeholder) and update its content
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant' && updated[i].content === '') {
            updated[i] = { ...updated[i], content: 'Sorry, something went wrong.' };
            break;
          }
        }
        return updated;
      });
      setLoading(false);
      return;
    }

    const data = await res.json();

    // 2. Get context documents
    const { data: documents } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: data.embedding,
        match_threshold: 0.35,
        match_count: 3,
      }
    );
    let tokenCount = 0;
    let contextText = "";
    for (let i = 0; i < (documents?.length || 0); i++) {
      const document = documents[i];
      const content = document.content;
      tokenCount += document.token || 0;
      if (tokenCount > 1500) break;
      contextText += `${content.trim()}\n--\n`;
    }

    // 3. Build history from updated messages
    // Use a ref to always get the latest messages
    const getLatestMessages = () => {
      // This will be called inside setMessages below
      return [
        ...messages,
        { role: 'user', content: searchText },
        { role: 'assistant', content: '' },
      ];
    };
    const history = getLatestMessages().filter(m => m.role && m.content !== undefined);

    // 4. Stream answer from /chat
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: searchText,
        context: contextText, // will be "" if no context
        history: history,
      }),
    });

    if (!response.body) {
      showToast("Failed to get answer from chat service", "error");
      setMessages(prev => {
        const updated = [...prev];
        // Find the last assistant message (placeholder) and update its content
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant' && updated[i].content === '') {
            updated[i] = { ...updated[i], content: 'Sorry, something went wrong.' };
            break;
          }
        }
        return updated;
      });
      setLoading(false);
      return;
    }

    // 5. Save user message to DB
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        role: "user",
        content: searchText,
      }),
    });


    // 6. Stream and save assistant message
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let streamedAnswer = "";
    // Use a ref to avoid stale closure
    const streamedAnswerRef = { current: "" };
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        streamedAnswerRef.current += decoder.decode(value);
        streamedAnswer = streamedAnswerRef.current;
        setMessages(prev => {
          const updated = [...prev];
          // Find the last assistant message (placeholder) and update its content
          for (let i = updated.length - 1; i >= 0; i--) {
            if (updated[i].role === 'assistant') {
              updated[i] = { ...updated[i], content: streamedAnswer };
              break;
            }
          }
          return updated;
        });
      }
    }

    // Save assistant message to DB
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: conversationId,
        role: "assistant",
        content: streamedAnswer,
      }),
    });

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between border-b pb-3 px-2">
        <div className="flex items-center gap-2">
          <SiAseprite className="w-5 h-5" />
          <h1>CustomAI</h1>
        </div>
        <Button onClick={handleLogout}> Logout </Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-10 px-2 py-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isLoading = loading && index === messages.length - 1 && msg.role === 'assistant' && !msg.content;
          return (
            <div className="space-y-3" key={index}>
              <div className={`flex items-center gap-2 ${isUser ? 'text-indigo-500' : 'text-green-700'}`}>
                <SiAseprite className="w-5 h-5" />
                {isUser ? (
                  <h1>{msg.content}</h1>
                ) : null}
              </div>
              {isLoading && (
                <h1>Loading...</h1>
              )}
              {!isUser && msg.content && !isLoading && (
                <div className="prose max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>
      <div className="border-t px-2 bg-white">
        <Input
          ref={inputRef}
          placeholder="Ask me a question"
          className="p-5"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
      </div>
    </div>
  );
}
