"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { BENCHMARKS, BenchmarkData } from "@/lib/types";

function AnimatedNumber({ target, duration = 2 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
      else setCurrent(target);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{current.toLocaleString()}</span>;
}

function BenchmarkCard({
  data,
  index,
}: {
  data: BenchmarkData;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const gradients = [
    "from-violet-500/10 to-transparent hover:from-violet-500/15",
    "from-cyan-500/10 to-transparent hover:from-cyan-500/15",
    "from-rose-500/10 to-transparent hover:from-rose-500/15",
    "from-amber-500/10 to-transparent hover:from-amber-500/15",
    "from-emerald-500/10 to-transparent hover:from-emerald-500/15",
    "from-fuchsia-500/10 to-transparent hover:from-fuchsia-500/15",
  ];
  const glows = [
    "group-hover:shadow-violet-500/10",
    "group-hover:shadow-cyan-500/10",
    "group-hover:shadow-rose-500/10",
    "group-hover:shadow-amber-500/10",
    "group-hover:shadow-emerald-500/10",
    "group-hover:shadow-fuchsia-500/10",
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`group relative rounded-2xl border border-white/[0.04] bg-gradient-to-b ${gradients[index]} p-6 transition-all duration-500 hover:border-white/10 ${glows[index]} hover:shadow-2xl`}
    >
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          <AnimatedNumber target={data.value} />
        </span>
        {data.unit && (
          <span className="text-lg text-white/30 font-light">{data.unit}</span>
        )}
      </div>
      <h3 className="text-sm font-medium text-white/70 mb-1">{data.label}</h3>
      <p className="text-xs text-white/30 leading-relaxed">
        {data.description}
      </p>
    </motion.div>
  );
}

export default function Benchmarks() {
  return (
    <section className="py-32 px-6 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/5 blur-[150px] rounded-full" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight">
            The Numbers
          </h2>
          <p className="text-white/30 max-w-lg mx-auto text-lg font-light">
            Production metrics from real agents running Engram.
            <br />
            <span className="text-white/50">Not benchmarks — battle scars.</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BENCHMARKS.map((benchmark, i) => (
            <BenchmarkCard key={benchmark.label} data={benchmark} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
