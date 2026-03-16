"use client";

import { motion } from "framer-motion";

interface DreamButtonProps {
  onClick: () => void;
  isDreaming: boolean;
  disabled?: boolean;
  memoryCount: number;
}

export default function DreamButton({
  onClick,
  isDreaming,
  disabled,
  memoryCount,
}: DreamButtonProps) {
  const canDream = memoryCount >= 3 && !isDreaming && !disabled;

  return (
    <div className="relative">
      {/* Glow effect */}
      {canDream && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-violet-600/30 blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.button
        onClick={onClick}
        disabled={!canDream}
        whileHover={canDream ? { scale: 1.02 } : undefined}
        whileTap={canDream ? { scale: 0.98 } : undefined}
        className={`relative w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all ${
          isDreaming
            ? "bg-violet-900/50 text-violet-300 border border-violet-500/30 cursor-wait"
            : canDream
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25 cursor-pointer"
              : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
        }`}
      >
        {isDreaming ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🌙
            </motion.span>
            Dreaming...
          </span>
        ) : canDream ? (
          <span className="flex items-center justify-center gap-2">
            ✨ Trigger Dream Cycle
          </span>
        ) : (
          <span>
            {memoryCount < 3
              ? `Chat more to dream (${memoryCount}/3 memories)`
              : "Dream Cycle"}
          </span>
        )}
      </motion.button>
    </div>
  );
}
