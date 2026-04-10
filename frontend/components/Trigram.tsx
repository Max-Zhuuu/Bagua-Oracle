"use client";

import type { Line, TrigramId } from "@/lib/bones";
import { TRIGRAM_META } from "@/lib/bones";
import { motion } from "framer-motion";

interface TrigramProps {
  lines: [Line, Line, Line];
  trigramId: TrigramId;
  label?: string;
  animateIn?: boolean;
  compact?: boolean;
}

function LineBar({ line, compact }: { line: Line; compact: boolean }) {
  const yang = line === 1;
  const w = compact ? "w-12" : "w-14";
  const h = compact ? "h-1.5" : "h-2";
  if (yang) {
    return (
      <div
        className={`${h} ${w} rounded-[1px] bg-ink`}
        role="presentation"
      />
    );
  }
  return (
    <div className={`flex ${w} justify-between gap-2`} role="presentation">
      <div className={`${h} flex-1 rounded-[1px] bg-ink`} />
      <div className={`${h} flex-1 rounded-[1px] bg-ink`} />
    </div>
  );
}

/** Visual stack: bottom line at bottom of column */
export function Trigram({
  lines,
  trigramId,
  label,
  animateIn,
  compact = false,
}: TrigramProps) {
  const meta = TRIGRAM_META[trigramId];
  const order: [Line, Line, Line] = [lines[2], lines[1], lines[0]];

  return (
    <div
      className={`flex flex-col items-center text-center ${compact ? "gap-1.5" : "gap-3"}`}
    >
      <div
        className={`flex flex-col-reverse items-center ${compact ? "gap-1.5 py-1" : "gap-2 py-2"}`}
      >
        {order.map((ln, i) => (
          <motion.div
            key={i}
            initial={animateIn ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animateIn ? i * 0.12 : 0, duration: 0.35 }}
          >
            <LineBar line={ln} compact={compact} />
          </motion.div>
        ))}
      </div>
      <p
        className={`font-serif text-ink ${compact ? "text-base" : "text-lg"}`}
      >
        <span className="mr-2 font-normal">{meta.symbol}</span>
        <span className="font-noto-sc text-[1.05em]">{meta.name_zh}</span>
        <span
          className={`ml-2 text-ink/80 ${compact ? "text-sm" : "text-base"}`}
        >
          {meta.pinyin}
        </span>
      </p>
      <p
        className={`tracking-wide text-ink/60 ${compact ? "text-xs" : "text-sm"}`}
      >
        — {meta.image_en} —
      </p>
      {label && (
        <p
          className={`uppercase tracking-[0.2em] text-jade ${compact ? "text-[10px]" : "text-xs"}`}
        >
          {label}
        </p>
      )}
    </div>
  );
}
