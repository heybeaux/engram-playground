"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Memory } from "@/lib/types";

interface MemoryFeedProps {
  memories: Memory[];
  isDreaming?: boolean;
}

const LAYER_CONFIG: Record<string, { color: string; glow: string; bg: string; border: string }> = {
  EPISODIC: {
    color: "text-sky-300",
    glow: "shadow-sky-500/20",
    bg: "bg-sky-500/5",
    border: "border-sky-500/20",
  },
  IDENTITY: {
    color: "text-violet-300",
    glow: "shadow-violet-500/20",
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
  },
  PREFERENCE: {
    color: "text-amber-300",
    glow: "shadow-amber-500/20",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
  },
  EMOTIONAL: {
    color: "text-rose-300",
    glow: "shadow-rose-500/20",
    bg: "bg-rose-500/5",
    border: "border-rose-500/20",
  },
  SEMANTIC: {
    color: "text-emerald-300",
    glow: "shadow-emerald-500/20",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
  },
  PROCEDURAL: {
    color: "text-cyan-300",
    glow: "shadow-cyan-500/20",
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/20",
  },
  PROJECT: {
    color: "text-orange-300",
    glow: "shadow-orange-500/20",
    bg: "bg-orange-500/5",
    border: "border-orange-500/20",
  },
};

function getConfig(layer: string) {
  return LAYER_CONFIG[layer] || {
    color: "text-gray-300",
    glow: "shadow-gray-500/20",
    bg: "bg-gray-500/5",
    border: "border-gray-500/20",
  };
}

function ImportanceOrb({ score }: { score: number }) {
  const hue = score > 0.7 ? 0 : score > 0.4 ? 35 : 150; // red → amber → green
  const size = 6 + score * 10;

  return (
    <motion.div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, hsla(${hue}, 90%, 65%, 0.9), hsla(${hue}, 80%, 40%, 0.3))`,
        boxShadow: `0 0 ${score * 12}px hsla(${hue}, 90%, 60%, 0.4)`,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function MemoryFeed({ memories, isDreaming }: MemoryFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h2 className="text-xs font-medium text-white/40 uppercase tracking-widest">
            Memory Stream
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {isDreaming && (
            <motion.div
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{
                  background: "radial-gradient(circle, #a78bfa, #7c3aed)",
                  boxShadow: "0 0 12px rgba(167, 139, 250, 0.6)",
                }}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-[10px] text-violet-400 font-medium">
                consolidating
              </span>
            </motion.div>
          )}
          <span className="text-[10px] text-white/20 tabular-nums">
            {memories.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {memories.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
            <motion.div
              className="w-8 h-8 rounded-full border border-white/10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="text-[11px] text-white/30">
              Waiting for memories...
            </span>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {memories.map((memory, i) => {
            const config = getConfig(memory.layer);
            return (
              <motion.div
                key={memory.id}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.9, filter: "blur(8px)" }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  y: 10,
                  filter: "blur(4px)",
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1], // custom bezier — snappy
                }}
                className={`group relative rounded-xl border p-3 transition-all duration-500 ${
                  isDreaming
                    ? "border-violet-500/20 bg-violet-500/[0.03]"
                    : `${config.border} ${config.bg}`
                } hover:bg-white/[0.04]`}
              >
                {/* Subtle glow on new memories */}
                {i === 0 && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: `radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1), transparent 70%)`,
                    }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 3, delay: 0.5 }}
                  />
                )}

                <div className="relative flex items-start gap-3">
                  <div className="pt-1">
                    <ImportanceOrb score={memory.importanceScore} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider ${config.color}`}
                      >
                        {memory.layer}
                      </span>
                      <span className="text-[9px] text-white/15 tabular-nums">
                        {memory.importanceScore.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[13px] text-white/60 leading-relaxed">
                      {memory.raw}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
