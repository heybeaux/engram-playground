"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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

// Agent-driven conversation flow — the agent asks questions and extracts memories
const CONVERSATION_FLOW = [
  {
    question: "Hey! I'm an agent with Engram memory. Let's try something — what's your name?",
    memoryExtract: (answer: string) => ({
      raw: `User's name is ${answer.replace(/^(i'm |my name is |it's |i am )/i, "").trim()}`,
      layer: "IDENTITY",
    }),
  },
  {
    question: (name: string) =>
      `Nice to meet you, ${name}! What do you do for work? Or what are you passionate about?`,
    memoryExtract: (answer: string) => ({
      raw: `User works in or is passionate about: ${answer}`,
      layer: "IDENTITY",
    }),
  },
  {
    question: "Got it — that's stored. Now tell me something personal. What's a favourite hobby, food, or random fact about you?",
    memoryExtract: (answer: string) => ({
      raw: `Personal preference: ${answer}`,
      layer: "INSIGHT",
    }),
  },
  {
    question: "Last one. What's something you're working on or thinking about lately?",
    memoryExtract: (answer: string) => ({
      raw: `Currently working on or thinking about: ${answer}`,
      layer: "PROJECT",
    }),
  },
];

const POST_FLOW_RESPONSES = [
  "All four memories stored! 🧠 Hit the **Dream** button below and watch what happens — I'll consolidate, find patterns, extract entities, and cluster everything you told me.",
  "Keep chatting if you want — every message becomes a memory. Or hit Dream now to see consolidation in action.",
  "The more you share, the richer the Dream Cycle results. But you've got enough to see something interesting already.",
];

function extractName(message: string): string {
  const cleaned = message
    .replace(/^(i'm |my name is |it's |i am |hey,? i'm |hi,? i'm )/i, "")
    .replace(/[.!?,].*$/, "")
    .trim();
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function Playground() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isDreaming, setIsDreaming] = useState(false);
  const [dreamResult, setDreamResult] = useState<DreamResult | null>(null);
  const [flowStep, setFlowStep] = useState(0);
  const [userName, setUserName] = useState("");
  const flowStepRef = useRef(0);
  const userNameRef = useRef("");

  // Keep refs in sync
  useEffect(() => {
    flowStepRef.current = flowStep;
    userNameRef.current = userName;
  }, [flowStep, userName]);

  const addAgentMessage = useCallback((content: string) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: "assistant",
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const storeMemoryAndUpdate = useCallback(
    async (content: string, layer: string) => {
      if (!session) return;
      try {
        const res = await fetch("/api/memories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.userId,
            content,
            layer,
            isLive: session.isLive,
          }),
        });
        const memory = await res.json();
        if (memory && !memory.error) {
          setMemories((prev) => [memory, ...prev]);
          return memory;
        }
      } catch (err) {
        console.error("Memory store failed:", err);
      }
      return null;
    },
    [session]
  );

  const initSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session", { method: "POST" });
      const data = await res.json();
      setSession(data);
      setMessages([]);
      setMemories([]);
      setDreamResult(null);
      setFlowStep(0);
      setUserName("");

      // Agent kicks off the conversation
      setTimeout(() => {
        const firstQ = CONVERSATION_FLOW[0].question;
        const msg: ChatMessage = {
          id: `msg-init`,
          role: "assistant",
          content: typeof firstQ === "string" ? firstQ : firstQ(""),
          timestamp: Date.now(),
        };
        setMessages([msg]);
      }, 500);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!session) return;

      // Add user message
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const currentStep = flowStepRef.current;

      if (currentStep < CONVERSATION_FLOW.length) {
        // We're in the guided flow
        const step = CONVERSATION_FLOW[currentStep];
        const extracted = step.memoryExtract(content);

        // Extract name from first answer
        if (currentStep === 0) {
          const name = extractName(content);
          setUserName(name);
          userNameRef.current = name;
        }

        // Store the memory
        await storeMemoryAndUpdate(extracted.raw, extracted.layer);

        const nextStep = currentStep + 1;
        setFlowStep(nextStep);
        flowStepRef.current = nextStep;

        // Next question or completion
        setTimeout(() => {
          if (nextStep < CONVERSATION_FLOW.length) {
            const nextQ = CONVERSATION_FLOW[nextStep].question;
            const questionText =
              typeof nextQ === "function"
                ? nextQ(userNameRef.current)
                : nextQ;
            addAgentMessage(questionText);
          } else {
            addAgentMessage(POST_FLOW_RESPONSES[0]);
          }
        }, 800);
      } else {
        // Free chat after guided flow
        await storeMemoryAndUpdate(
          `${userNameRef.current} said: ${content}`,
          "SESSION"
        );

        setTimeout(() => {
          const idx =
            (currentStep - CONVERSATION_FLOW.length) %
            (POST_FLOW_RESPONSES.length - 1);
          addAgentMessage(POST_FLOW_RESPONSES[idx + 1]);
        }, 600);

        setFlowStep(currentStep + 1);
        flowStepRef.current = currentStep + 1;
      }
    },
    [session, storeMemoryAndUpdate, addAgentMessage]
  );

  const handleDream = useCallback(async () => {
    if (!session || isDreaming) return;

    setIsDreaming(true);
    setDreamResult(null);

    addAgentMessage(
      "Initiating Dream Cycle... watch the memory stream. 🌙"
    );

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

      addAgentMessage(
        `Dream complete! I consolidated ${result.consolidated || 0} memories, found ${result.entitiesExtracted || 0} entities, and formed ${result.clustersFormed || 0} clusters. Scroll down to see the full breakdown.`
      );
    } catch (err) {
      console.error("Dream cycle failed:", err);
      addAgentMessage("Dream cycle hit an error — but the concept is real. Check the API docs to try it yourself.");
    } finally {
      setIsDreaming(false);
    }
  }, [session, isDreaming, addAgentMessage]);

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
                <span className="text-emerald-400/80">
                  Connected to live Engram API
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400/80">
                  Running simulated demo
                </span>
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_1fr] gap-4 mb-8">
          <div className="bg-white/[0.015] border border-white/[0.04] rounded-3xl h-[520px] overflow-hidden backdrop-blur-sm">
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="w-[200px] h-[300px]">
              <MemoryOrb
                memoryCount={memories.length}
                isDreaming={isDreaming}
              />
            </div>
          </div>

          <div className="bg-white/[0.015] border border-white/[0.04] rounded-3xl h-[520px] overflow-hidden backdrop-blur-sm">
            <MemoryFeed memories={memories} isDreaming={isDreaming} />
          </div>
        </div>

        <div className="max-w-sm mx-auto mb-8">
          <DreamButton
            onClick={handleDream}
            isDreaming={isDreaming}
            memoryCount={memories.length}
          />
        </div>

        <DreamResults result={dreamResult} isVisible={!!dreamResult} />
      </div>
    </section>
  );
}
