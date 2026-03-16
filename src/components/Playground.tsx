"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ChatPanel from "./ChatPanel";
import MemoryFeed from "./MemoryFeed";
import DreamButton from "./DreamButton";
import DreamResults from "./DreamResults";
import { ChatMessage, Memory, DreamResult } from "@/lib/types";

const MemoryOrb = dynamic(() => import("./MemoryOrb"), { ssr: false });

interface SessionState {
  id: string;
  userId: string;
  isLive: boolean;
}

function generateAgentResponse(
  userMessage: string,
  memories: Memory[]
): string {
  if (memories.length === 0) {
    return "Hi! I'm a demo agent powered by Engram. Tell me about yourself — I'll remember everything. When you're ready, hit the Dream button and watch what happens.";
  }

  if (memories.length < 3) {
    return "Got it — I'm building up memories about you. Keep chatting and watch the memory stream on the right. Once we have a few, you can trigger a Dream Cycle to see consolidation in action.";
  }

  if (userMessage.toLowerCase().includes("remember")) {
    return `Let me check... I remember: ${memories
      .slice(0, 3)
      .map((m) => m.raw)
      .join(" Also, ")}. Try triggering a Dream Cycle to see deeper pattern recognition.`;
  }

  return `That connects to what I already know about you. I've stored ${memories.length} memories so far. Hit Dream to watch me consolidate everything into deeper understanding.`;
}

export default function Playground() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [dreamResult, setDreamResult] = useState<DreamResult | null>(null);

  const initSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session", { method: "POST" });
      const data = await res.json();
      setSession(data);
      setMessages([]);
      setMemories([]);
      setDreamResult(null);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!session) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch("/api/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.userId,
            content: `User said: ${content}`,
            layer: "EPISODIC",
            isLive: session.isLive,
          }),
        });
        const memory = await res.json();
        if (memory && !memory.error) {
          setMemories((prev) => [memory, ...prev]);
        }
      } catch (err) {
        console.error("Memory store failed:", err);
      }

      setTimeout(() => {
        const response = generateAgentResponse(content, memories);
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }, 600);
    },
    [session, memories]
  );

  const handleDream = useCallback(async () => {
    if (!session || isDreaming) return;

    setIsDreaming(true);
    setDreamResult(null);

    try {
      const res = await fetch("/api/dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          isLive: session.isLive,
        }),
      });
      const result = await res.json();
      await new Promise((r) => setTimeout(r, 2500));
      setDreamResult(result);
    } catch (err) {
      console.error("Dream cycle failed:", err);
    } finally {
      setIsDreaming(false);
    }
  }, [session, isDreaming]);

  if (!session) {
    return (
      <div id="playground" className="flex items-center justify-center py-12">
        <button
          onClick={initSession}
          className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl px-10 py-4 text-sm transition-all hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
        >
          Start Demo Session
        </button>
      </div>
    );
  }

  return (
    <section id="playground" className="py-16 px-6 relative">
      {/* Orb background during dream */}
      {isDreaming && (
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <MemoryOrb memoryCount={memories.length} isDreaming={true} />
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Live Playground
          </h2>
          <p className="text-sm text-white/30">
            {session.isLive ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400/80">Connected to live Engram API</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400/80">Running simulated demo</span>
              </span>
            )}
          </p>
        </div>

        {/* Main playground — three columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_1fr] gap-4 mb-8">
          {/* Chat */}
          <div className="bg-white/[0.015] border border-white/[0.04] rounded-3xl h-[520px] overflow-hidden backdrop-blur-sm">
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
          </div>

          {/* Center orb */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-[200px] h-[300px]">
              <MemoryOrb memoryCount={memories.length} isDreaming={isDreaming} />
            </div>
          </div>

          {/* Memory feed */}
          <div className="bg-white/[0.015] border border-white/[0.04] rounded-3xl h-[520px] overflow-hidden backdrop-blur-sm">
            <MemoryFeed memories={memories} isDreaming={isDreaming} />
          </div>
        </div>

        {/* Dream button */}
        <div className="max-w-sm mx-auto mb-8">
          <DreamButton
            onClick={handleDream}
            isDreaming={isDreaming}
            memoryCount={memories.length}
          />
        </div>

        {/* Dream results */}
        <DreamResults result={dreamResult} isVisible={!!dreamResult} />
      </div>
    </section>
  );
}
