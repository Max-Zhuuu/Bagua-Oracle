"use client";

import type { Line, TrigramId } from "@/lib/bones";
import { TRIGRAM_META } from "@/lib/bones";
import { motion } from "framer-motion";

interface TrigramProps {
  lines: [Line, Line, Line];
  trigramId: TrigramId;
  label?: string;
  animateIn?: boolean;
}

function LineBar({ line }: { line: Line }) {
  const yang = line === 1;
  if (yang) {
    return (
      <div className="h-2 w-14 rounded-[1px] bg-ink" role="presentation" />
    );
  }
  return (
    <div className="flex w-14 justify-between gap-2" role="presentation">
      <div className="h-2 flex-1 rounded-[1px] bg-ink" />
      <div className="h-2 flex-1 rounded-[1px] bg-ink" />
    </div>
  );
}

/** Visual stack: bottom line at bottom of column */
export function Trigram({ lines, trigramId, label, animateIn }: TrigramProps) {
  const meta = TRIGRAM_META[trigramId];
  const order: [Line, Line, Line] = [lines[2], lines[1], lines[0]];

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex flex-col-reverse items-center gap-2 py-2">
        {order.map((ln, i) => (
          <motion.div
            key={i}
            initial={animateIn ? { opacity: 0, y: 6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animateIn ? i * 0.12 : 0, duration: 0.35 }}
          >
            <LineBar line={ln} />
          </motion.div>
        ))}
      </div>
      <p className="font-serif text-lg text-ink">
        <span className="mr-2 font-normal">{meta.symbol}</span>
        <span className="font-noto-sc text-[1.05em]">{meta.name_zh}</span>
        <span className="ml-2 text-base text-ink/80">{meta.pinyin}</span>
      </p>
      <p className="text-sm tracking-wide text-ink/60">— {meta.image_en} —</p>
      {label && (
        <p className="text-xs uppercase tracking-[0.2em] text-jade">{label}</p>
      )}
    </div>
  );
}
