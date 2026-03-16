"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DreamResult } from "@/lib/types";

interface DreamResultsProps {
  result: DreamResult | null;
  isVisible: boolean;
}

function GlowStat({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) {
  const glowMap: Record<string, string> = {
    violet: "from-violet-500/20 via-violet-500/5 to-transparent shadow-violet-500/10",
    cyan: "from-cyan-500/20 via-cyan-500/5 to-transparent shadow-cyan-500/10",
    rose: "from-rose-500/20 via-rose-500/5 to-transparent shadow-rose-500/10",
    amber: "from-amber-500/20 via-amber-500/5 to-transparent shadow-amber-500/10",
  };
  const glow = glowMap[color] || glowMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative group"
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${glow} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-center backdrop-blur-sm hover:border-white/10 transition-colors">
        <motion.div
          className="text-3xl font-bold text-white mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.4 }}
        >
          {value}
        </motion.div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

export default function DreamResults({ result, isVisible }: DreamResultsProps) {
  if (!result) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden"
        >
          <div className="relative rounded-3xl border border-violet-500/10 bg-gradient-to-b from-violet-500/[0.03] to-transparent p-8 space-y-8">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-500/10 blur-[100px] rounded-full" />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative flex items-center gap-3"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-violet-400"
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(167,139,250,0.5)",
                    "0 0 20px rgba(167,139,250,0.8)",
                    "0 0 0px rgba(167,139,250,0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h3 className="text-xs font-semibold text-violet-300/80 uppercase tracking-widest">
                Dream Cycle Complete
              </h3>
            </motion.div>

            {/* Stats grid */}
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3">
              <GlowStat label="Consolidated" value={result.consolidated} color="violet" delay={0.3} />
              <GlowStat label="Deduplicated" value={result.deduplicated} color="cyan" delay={0.4} />
              <GlowStat label="Clusters" value={result.clustersFormed} color="rose" delay={0.5} />
              <GlowStat label="Entities" value={result.entitiesExtracted} color="amber" delay={0.6} />
            </div>

            {/* Patterns */}
            {result.patterns.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="relative"
              >
                <h4 className="text-[10px] font-medium text-white/30 mb-3 uppercase tracking-widest">
                  Patterns Discovered
                </h4>
                <div className="space-y-2">
                  {result.patterns.map((pattern, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.15, duration: 0.4 }}
                      className="flex items-start gap-3 group"
                    >
                      <motion.div
                        className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400/60 flex-shrink-0"
                        animate={{
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                      <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                        {pattern}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Entities */}
            {result.entities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="relative"
              >
                <h4 className="text-[10px] font-medium text-white/30 mb-3 uppercase tracking-widest">
                  Entities Extracted
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.entities.map((entity, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4 + i * 0.08, duration: 0.3 }}
                      className="group text-xs px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white/80 hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-default"
                    >
                      {entity.name}
                      <span className="text-white/20 ml-1.5 text-[10px]">
                        {entity.type.toLowerCase()}
                      </span>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
