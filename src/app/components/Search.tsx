"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect } from 'react'
import { SiAseprite } from "react-icons/si";
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface SearchProps {
  conversationId: string | null;
  onNewConversation?: (id: string) => void;
}

interface Message {
  role: string;
  content: string;
}
function ChatHeader() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center shadow">
        <SiAseprite className="w-5 h-5 text-white" />
      </div>
      <span className="text-2xl font-bold text-cyan-100 tracking-wide">CustomAI</span>
    </div>
  );
}

function ChatMessages({ messages, bottomRef, loading, streaming }: any) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-fade">
      {messages.map((msg: any, idx: number) => {
        const isAssistant = msg.role === "assistant";
        const isLastAssistant = isAssistant && idx === messages.length - 1;
        const isLoading = isLastAssistant && (loading || streaming) && !msg.content;

        return (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-center"}`}
          >
            {isAssistant ? (
              <div className="w-full flex justify-center">
                <div className="max-w-4xl mx-auto p-4 text-white text-xl leading-relaxed">
                  {isLoading ? (
                    <div className="text-slate-100 leading-relaxed flex items-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-cyan-400"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none break-words
                                    prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3
                                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2
                                    prose-p:leading-relaxed prose-li:my-1">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        skipHtml
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="px-5 py-4 rounded-2xl shadow max-w-2xl
                           bg-cyan-500/20 text-cyan-100 rounded-br-sm ml-auto text-xl leading-relaxed"
                style={{ minWidth: 0 }}
              >
                <span className="whitespace-pre-line">{msg.content}</span>
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}


function ChatInput({ inputRef, onSend, loading, pending }: any) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSend();
      }}
      className="flex items-center gap-3 px-6 py-5"
    >
      <input
        ref={inputRef}
        placeholder="Ask me a question"
        className="flex-1 bg-white/10 text-cyan-100 placeholder-cyan-300 rounded-xl px-4 py-3 border border-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition"
        disabled={loading || pending}
      />
      <button
        type="submit"
        className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl px-5 py-3 shadow transition"
        disabled={loading || pending}
      >
        Send
      </button>
    </form>
  );
}


export default function Search({ conversationId, onNewConversation }: SearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const isNewChat = conversationId === null;
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);

  // Ref to cancel streaming if user switches chats
  const cancelStreamRef = useRef(false);

  const supabase = createClient();
  // Ref for auto-scroll
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  // Auto-submit pending message when conversationId updates after new chat creation
  useEffect(() => {
    if (pendingMessage && conversationId) {
      // Add user message and assistant placeholder to UI
      setMessages(prev => {
        // Only add if not already present (prevents duplicate flicker)
        if (
          prev.length === 0 ||
          prev[prev.length - 1].role !== 'assistant' ||
          prev[prev.length - 1].content !== ''
        ) {
          return [
            ...prev,
            { role: 'user', content: pendingMessage },
            { role: 'assistant', content: '' }
          ];
        }
        return prev;
      });
      if (inputRef.current) inputRef.current.value = pendingMessage;
      const msg = pendingMessage;
      setPendingMessage(null); // Clear before calling handleSearch
      // Call handleSearch after a tick to allow state to update
      setTimeout(() => {
        handleSearch();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);
  // Reset pending and cancel streaming when switching chats
  useEffect(() => {
    if (pending) {
      cancelStreamRef.current = true;
    }
    setPending(false);
  }, [conversationId]);

  // Load messages when conversationId changes
  useEffect(() => {
    if (!conversationId || pending) {
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
  }, [conversationId, pending]);

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
    if (loading || pending) return; // Prevent multiple submissions

    setLoading(true);
    setPending(true);

    let convId = conversationId;
    let createdNewConversation = false;
    let searchText = inputRef.current?.value;
    if (!searchText || !searchText.trim()) {
      setLoading(false);
      setPending(false);
      return;
    }

    cancelStreamRef.current = false;

    if (isNewChat) {
      // 1. Generate title
      const titleRes = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: searchText }),
      });
      const { title } = await titleRes.json();

      // 2. Create conversation
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const { id: newConvId } = await convRes.json();

      // Notify the sidebar immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('conversation:created', {
          detail: { id: newConvId, title }
        }));
      }


      // 3. Store the pending message and notify parent
      setPendingMessage(searchText);
      if (onNewConversation && typeof newConvId === 'string') {
        onNewConversation(newConvId);
        setPending(false);
        setLoading(false);
        return;
      }
    }
    // GUARD: If convId is still not set, abort
    if (!convId) {
      showToast("Could not determine conversation ID", "error");
      setLoading(false);
      setPending(false);
      return;
    }

    // 4.5. Reload messages from DB (optional but best practice)
    const dbRes1 = await fetch(`/api/messages/${convId}`);
    const dbData = await dbRes1.json();
    const dbMessages = dbData.messages || [];
    // Sanitize DB messages
    const sanitizedDbMessages = dbMessages.map((m: { role: any; content: any; }) => ({
      role: m.role,
      content: m.content
    }));

    console.log("DB messages:", sanitizedDbMessages);
    // 5. Build history for /chat: all DB messages + new user message (no assistant placeholder)
    const lastSanitized = sanitizedDbMessages[sanitizedDbMessages.length - 1];
    const isDuplicate =
      lastSanitized &&
      lastSanitized.role === 'user' &&
      lastSanitized.content?.trim() === searchText.trim();

    const history = [
      ...sanitizedDbMessages,
      ...(!isDuplicate ? [{ role: 'user', content: searchText }] : [])
    ];
    // 6. Add user message and placeholder assistant message before building history
    setMessages(prev => {
      const updated = [...prev, { role: 'user', content: searchText }, { role: 'assistant', content: '' }];
      messagesRef.current = updated;
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

    // 4. Stream answer from /chat
    console.log("History sent to /chat:", history);
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: searchText,
        context: contextText, // will be "" if no context
        history: history,
      }),
    });
    console.log("Response from /chat:", response);
    console.log("Response body:", response.body);
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
    // 6. Stream and save assistant message
    setStreaming(true);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let streamedAnswer = "";
    // Use a ref to avoid stale closure
    const streamedAnswerRef = { current: "" };
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      console.log("Received chunk 1:", value, "cancelStreamRef.current:", cancelStreamRef.current);
      if (value && !cancelStreamRef.current) {
        console.log("Received chunk 2:", value);
        streamedAnswerRef.current += decoder.decode(value);
        streamedAnswer = streamedAnswerRef.current;
        setMessages(prev => {
          const lastAssistantIdx = [...prev].reverse().findIndex(m => m.role === 'assistant');
          if (lastAssistantIdx === -1) return prev;
          const idx = prev.length - 1 - lastAssistantIdx;
          const updated = prev.map((msg, i) =>
            i === idx ? { ...msg, content: streamedAnswerRef.current } : msg
          );
          return updated;
        });
      }
    }
    setStreaming(false);
    // 4. Save user message to DB
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: convId,
        role: "user",
        content: searchText,
      }),
    });

    // Save assistant message to DB
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation_id: convId,
        role: "assistant",
        content: streamedAnswer,
      }),
    });

    // notify sidebar to re-sort by updated_at
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('conversation:updated', {
        detail: { id: convId }
      }));
    }
    // After saving assistant message to DB
    setLoading(false);
    setPending(false);
  };

  // --- UI ---

  if (isNewChat) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-slate-800/60 backdrop-blur-2xl rounded-r-3xl shadow-2xl shadow-cyan-900/20 border-l border-cyan-500/20">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4">
            <SiAseprite className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-cyan-100 ">Welcome to CustomAi</h2>
          <p className="text-cyan-300 text-center mt-2">
            Start a new conversation by asking me anything!
          </p>
        </div>
        <div className="w-full max-w-4xl">
          <ChatInput
            inputRef={inputRef}
            onSend={handleSearch}
            loading={loading}
            pending={pending}
          />
          {(loading || pending) && (
            <div className="flex items-center justify-center mt-4 text-cyan-300">
              <svg className="animate-spin h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Working...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-800/60 backdrop-blur-2xl rounded-r-3xl shadow-2xl shadow-cyan-900/20 border-l border-cyan-500/20 overflow-hidden">
      <ChatHeader />
      {/* Messages */}
      <ChatMessages
        messages={messages}
        bottomRef={bottomRef}
        loading={loading}
        streaming={streaming}
      />
      <ChatInput
        inputRef={inputRef}
        onSend={handleSearch}
        loading={loading || pending}
        pending={pending}
      />

    </div>
  );
}