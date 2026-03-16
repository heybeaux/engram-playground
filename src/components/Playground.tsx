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
  const count = memories.length;
  const msg = userMessage.toLowerCase();

  // First message ever
  if (count === 0) {
    return "Hey! I'm a demo agent with Engram memory. Tell me things about yourself and watch the Memory Stream light up in real-time. Once you've shared a few things, you can trigger a Dream Cycle and watch me consolidate everything.";
  }

  // Early messages — varied responses
  if (count === 1) {
    return `Stored! You can see that memory appearing in the stream. Keep going — tell me more about yourself. I need at least 3 memories before we can dream.`;
  }

  if (count === 2) {
    return `Two memories and counting. One more and you'll unlock the Dream Cycle button — that's where the magic happens. What else should I know about you?`;
  }

  if (count === 3) {
    return `Three memories stored! The Dream button is now active. Hit it whenever you're ready — you'll watch me consolidate, deduplicate, cluster, and extract patterns from everything you've told me. Or keep chatting to build a richer memory graph first.`;
  }

  // Handle "remember" queries
  if (msg.includes("remember") || msg.includes("what do you know")) {
    const recalled = memories
      .slice(0, 3)
      .map((m) => m.raw.replace("User said: ", ""))
      .join(". ");
    return `From my memory: ${recalled}. That's semantic recall — I found the most relevant memories, not just the most recent. Try the Dream Cycle to see deeper consolidation.`;
  }

  // Later messages — contextual variety
  const responses = [
    `Got it — memory #${count} stored. The more you share, the more interesting the Dream Cycle patterns become.`,
    `Interesting. I'm building a richer picture of you with every message. ${count} memories so far — try hitting Dream to see what patterns emerge.`,
    `Noted. Each message gets embedded, scored for importance, and linked to what I already know. Watch the importance scores in the memory stream — some memories matter more than others.`,
    `Stored. Fun fact: when you trigger the Dream Cycle, I'll look for duplicates to merge, clusters to form, and entities to extract across all ${count} of your memories.`,
    `Another memory captured. The real power shows when you Dream — I consolidate everything, find patterns you didn't explicitly state, and build a knowledge graph of entities.`,
  ];

  return responses[count % responses.length];
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

      // Store memory and wait for result before generating response
      let newMemory: Memory | null = null;
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
          newMemory = memory;
          setMemories((prev) => [memory, ...prev]);
        }
      } catch (err) {
        console.error("Memory store failed:", err);
      }

      // Use functional state to get current memories count (avoids stale closure)
      setMemories((currentMemories) => {
        const response = generateAgentResponse(content, currentMemories);
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-a`,
          role: "assistant",
          content: response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return currentMemories; // don't modify, just read
      });
    },
    [session]
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
