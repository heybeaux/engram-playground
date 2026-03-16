"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";
import Playground from "@/components/Playground";
import Benchmarks from "@/components/Benchmarks";

export default function Home() {
  const [showPlayground, setShowPlayground] = useState(false);

  return (
    <main className="min-h-screen bg-[#09090b]">
      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="fixed top-0 w-full z-50 bg-[#09090b]/60 backdrop-blur-2xl border-b border-white/[0.04]"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-white tracking-tight">
              ◆ engram
            </span>
            <span className="text-[10px] text-white/20 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.04]">
              playground
            </span>
          </div>
          <div className="flex items-center gap-8">
            <a
              href="#playground"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Demo
            </a>
            <a
              href="#benchmarks"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Benchmarks
            </a>
            <a
              href="https://api.openengram.ai/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              API
            </a>
            <a
              href="https://github.com/heybeaux/engram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 rounded-lg px-4 py-2 text-white/50 hover:text-white/70 transition-all"
            >
              GitHub
            </a>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <Hero
        onStart={() => {
          setShowPlayground(true);
          setTimeout(() => {
            document
              .getElementById("playground")
              ?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }}
      />

      {/* Playground */}
      {showPlayground && <Playground />}

      {/* Benchmarks */}
      <div id="benchmarks">
        <Benchmarks />
      </div>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.08),transparent_60%)]" />
        <div className="max-w-2xl mx-auto relative">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight"
          >
            Give your agents
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              a brain.
            </span>
          </motion.h2>
          <p className="text-white/30 mb-10 text-lg font-light">
            Self-hosted or cloud. Open source. One API call to never forget.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://api.openengram.ai/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-2xl px-10 py-4 text-sm shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30"
            >
              Get API Key
            </a>
            <a
              href="https://github.com/heybeaux/engram"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/15 rounded-2xl px-10 py-4 text-sm font-medium transition-all"
            >
              Self-Host →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[11px] text-white/20">
          <span>heybeaux.dev</span>
          <span className="text-white/10">◆</span>
          <span>Engram — Open Source Agent Memory</span>
        </div>
      </footer>
    </main>
  );
}
