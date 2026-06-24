import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, Sparkles, User, Loader2, Image as ImageIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

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

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "noor_messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        role: doc.data().role,
        content: doc.data().content,
        created_at: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userContent = input;
    setInput("");
    setIsLoading(true);

    try {
      // 1. Save user message to Firebase
      await addDoc(collection(db, "users", user.uid, "noor_messages"), {
        role: "user",
        content: userContent,
        createdAt: serverTimestamp(),
      });

      // 2. Mock AI response for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const assistantContent = `Masha Allah. I have remembered your message: "${userContent}". Insha Allah I will keep it in my memory.`;

      // 3. Save Assistant message to Firebase
      await addDoc(collection(db, "users", user.uid, "noor_messages"), {
        role: "assistant",
        content: assistantContent,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center overflow-hidden">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Noor&backgroundColor=064e3b" alt="Noor AI" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-emerald-100 font-bold text-lg">Noor AI</h1>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-16 h-16 rounded-full bg-emerald-800/50 flex items-center justify-center mb-4 overflow-hidden border border-emerald-700">
               <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Noor&backgroundColor=064e3b" alt="Noor AI" className="w-full h-full object-cover" />
            </div>
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
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Noor&backgroundColor=064e3b" alt="Noor" className="w-4 h-4 rounded-full" />
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
            <div className="bg-emerald-900/60 text-emerald-300 rounded-2xl rounded-bl-none p-3 px-4 border border-emerald-800/30 font-medium text-sm flex items-center gap-2">
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
          className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-800/50 rounded-full py-1 px-2 focus-within:bg-emerald-900/50 transition-colors"
        >
          <button
            type="button"
            className="p-2 text-emerald-400 hover:text-emerald-300 transition-colors shrink-0"
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.click();
            }}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk to Noor..."
            className="flex-1 bg-transparent border-none text-emerald-100 py-2 outline-none text-sm placeholder:text-emerald-100/30"
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
