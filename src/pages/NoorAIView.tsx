import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Sparkles, User, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getSupabaseClient } from "../lib/supabase";
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export function NoorAIView({ setView }: { setView: (v: string) => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = getSupabaseClient();
  // We'll use a mocked AI response if no Gemini API key is present in env,
  // but let's try to initialize the real one using a generic endpoint or client side.
  // Wait, Gemini API should NOT be client-side usually.
  // For this prototype, I'll build the UI to save/load from Supabase and simulate the AI or call an API route.

  useEffect(() => {
    if (!supabase) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("noor_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else if (data) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !supabase) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Save user message to Supabase
      await supabase.from("noor_messages").insert([
        {
          id: userMsg.id,
          user_id: user?.uid || "anonymous",
          role: "user",
          content: userMsg.content,
          created_at: userMsg.created_at,
        },
      ]);

      // 2. Mock AI response for now since we don't have a backend Gemini setup route running
      // Let's create a simple timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Masha Allah. I have remembered your message: "${userMsg.content}". Insha Allah I will keep it in my memory.`,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // 3. Save Assistant message to Supabase
      await supabase.from("noor_messages").insert([
        {
          id: assistantMsg.id,
          user_id: user?.uid || "anonymous",
          role: "assistant",
          content: assistantMsg.content,
          created_at: assistantMsg.created_at,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center text-emerald-100">
        <Sparkles className="w-12 h-12 mb-4 text-emerald-400 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Noor AI Requires Setup</h2>
        <p className="text-emerald-200/70 mb-6 font-medium text-sm">
          Please configure your Supabase URL & Anon Key in the Settings to
          enable Noor's memory.
        </p>
        <button
          onClick={() => setView("settings")}
          className="px-6 py-2 bg-emerald-600 rounded-full font-medium hover:bg-emerald-500 transition-colors"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-emerald-950 pb-[80px]">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 z-10 bg-emerald-950/80 backdrop-blur-md border-b border-emerald-900/50">
        <button
          onClick={() => setView("home")}
          className="p-2 hover:bg-emerald-900/50 rounded-full transition-colors text-emerald-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <h1 className="text-emerald-100 font-bold text-lg">Noor AI</h1>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Sparkles className="w-12 h-12 mb-4 text-emerald-300" />
            <p className="text-emerald-200 font-medium">
              Assalamu Alaikum!
              <br />I am Noor. How can I help you today?
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-emerald-900/60 text-emerald-100 rounded-bl-none border border-emerald-800/30"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Noor
                    </span>
                  </div>
                )}
                <p className="text-sm text-left whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </motion.div>
          ))
        )}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-emerald-900/60 text-emerald-300 rounded-2xl rounded-bl-none p-3 px-4 border border-emerald-800/30 font-medium text-sm flexitems-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-emerald-950 border-t border-emerald-900/50">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-800/50 rounded-full py-1 px-2 pr-1 focus-within:bg-emerald-900/50 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Noor..."
            className="flex-1 bg-transparent border-none text-emerald-100 pl-3 py-2 outline-none text-sm placeholder:text-emerald-100/30"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 outline-none text-white disabled:opacity-50 hover:bg-emerald-500 transition-colors shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
