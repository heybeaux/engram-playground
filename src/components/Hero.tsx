"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MemoryOrb = dynamic(() => import("./MemoryOrb"), { ssr: false });

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Radial gradient base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.15),transparent_70%)]" />

        {/* Floating gradient blobs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px]"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px]"
          animate={{
            x: [0, -50, 40, 0],
            y: [0, 30, -60, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-rose-500/5 blur-[80px]"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 40, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* 3D Orb background */}
      <div className="absolute inset-0 opacity-40">
        <MemoryOrb memoryCount={5} isDreaming={false} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium text-violet-300/80 bg-violet-500/10 border border-violet-500/15 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Open Source Agent Memory
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-8 tracking-tight"
        >
          <span className="text-white">Your agent</span>
          <br />
          <span className="text-white">forgets </span>
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              everything
            </span>
            {/* Underline glow */}
            <motion.span
              className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500/0 via-fuchsia-500/60 to-cyan-500/0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="text-lg md:text-xl text-white/40 mb-12 max-w-lg mx-auto leading-relaxed font-light"
        >
          Engram gives agents persistent memory that consolidates, deduplicates,
          and evolves.{" "}
          <span className="text-white/60">Watch it happen live.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={onStart}
            className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-2xl px-10 py-4 text-sm transition-all hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]"
          >
            <span className="relative z-10">Try It Live</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>
          <a
            href="https://github.com/heybeaux/engram"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/15 rounded-2xl px-10 py-4 text-sm font-medium transition-all backdrop-blur-sm hover:bg-white/[0.03]"
          >
            View Source
          </a>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
    </section>
  );
}
