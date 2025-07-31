"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react'
import { SiAseprite } from "react-icons/si";
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function Search() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const supabase = createClient();

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
    const searchText = inputRef.current?.value;
    if (!searchText || !searchText.trim()) return;

    setLoading(true);
    setQuestions(prev => [...prev, searchText]);
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
      setAnswers(prev => [...prev, "Sorry, something went wrong."]);
      setLoading(false);
      return;
    }

    const data = await res.json();

    // 2. Get context documents
    const { data: documents } = await supabase.rpc(
      "match_documents",
      {
        query_embedding: data.embedding,
        match_threshold: 0.3,
        match_count: 3,
      }
    );

    // 3. Build context string (limit tokens if needed)
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
    // 4. Always stream answer from /chat, even if contextText is empty
    let answer = "";
    setAnswers(prev => [...prev, ""]); // Placeholder for streaming
    const history = [];
    for (let i = 0; i < questions.length; i++) {
      history.push({
        role: "user",
        content: questions[i],
      });
      if (answers[i]) {
        history.push({
          role: "assistant",
          content: answers[i],
        });
      }
    }
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
      setAnswers(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = "Sorry, something went wrong.";
        return updated;
      });
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        answer += decoder.decode(value);
        setAnswers(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = answer;
          return updated;
        });
      }
    }
    setLoading(false);
  };

  return <>
    <div className="flex-1 h-80vh overflow-y-auto space-y-10">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <SiAseprite className="w-5 h-5" />
          <h1>CustomAI</h1>
        </div>
        <Button onClick={handleLogout}> Logout </Button>
      </div>

      {questions.map((question, index) => {
        const answer = answers[index];
        const isLoading = loading && index === questions.length - 1 && !answer;
        return (
          <div className="space-y-3" key={index}>
            <div className="flex items-center gap-2 text-indigo-500">
              <SiAseprite className="w-5 h-5" />
              <h1>{question}</h1>
            </div>
            {isLoading ? (
              <h1>Loading...</h1>
            ) : (
              <div className="prose max-w-none">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
    <Input
      ref={inputRef}
      placeholder="Ask me a question"
      className="p-5"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }} />
  </>
}
