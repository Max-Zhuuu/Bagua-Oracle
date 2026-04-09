"use client";

import type { Reading } from "@/lib/types";
import { InterpretationMarkdown } from "@/components/InterpretationMarkdown";
import { hexagramSymbol } from "@/lib/bones";
import { chineseDate } from "@/lib/formatInterpretation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { playPrintTick } from "@/lib/sounds";

interface FortuneSlipProps {
  reading: Reading;
}

const rule = "━━━━━━━━━━━━━━━━━━━━";

function SlipLine({
  children,
  delay,
  className,
}: {
  children: ReactNode;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay }}
      className={className ?? "whitespace-pre-wrap"}
    >
      {children}
    </motion.div>
  );
}

export function FortuneSlip({ reading }: FortuneSlipProps) {
  const { hexagram, interpretation, question } = reading;
  const ct = hexagram.classical_text;
  const judgment = ct?.judgment ?? "";
  const nameFull = ct?.name_full ?? "";
  useEffect(() => {
    const t = window.setTimeout(() => playPrintTick(), 400);
    return () => clearTimeout(t);
  }, []);

  let d = 0;
  const next = (n = 0.12) => {
    const v = d;
    d += n;
    return v;
  };

  return (
    <div
      className="relative mx-auto w-[320px] max-w-full px-6 py-10 text-ink"
      style={{
        background:
          "linear-gradient(180deg, #faf6ee 0%, #f2ebe0 45%, #efe8dc 100%)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
      }}
    >
      {/* Perforated edges */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-3 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 6px, #1a1a1a 6px, #1a1a1a 8px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-3 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 6px, #1a1a1a 6px, #1a1a1a 8px)",
        }}
      />

      <div className="font-mono text-[13px] leading-relaxed text-ink">
        <SlipLine delay={next(0)}>{rule}</SlipLine>
        <SlipLine delay={next()}>
          {"     "}AI 八卦骨卜
        </SlipLine>
        <SlipLine delay={next()}>{"   "}Oracle Reading</SlipLine>
        <SlipLine delay={next()}>{rule}</SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>Question:</SlipLine>
        <SlipLine delay={next()}>&quot;{question}&quot;</SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>{rule}</SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()} className="whitespace-pre-wrap text-center">
          <span className="text-2xl">{hexagramSymbol(hexagram.number)}</span>
        </SlipLine>
        <SlipLine delay={next()}>
          {"   "}
          {hexagram.number}. {hexagram.name_zh}
        </SlipLine>
        <SlipLine delay={next()}>{"   "}{nameFull}</SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>
          {"  "}
          {hexagram.upper.image_en}
        </SlipLine>
        <SlipLine delay={next()}>{"     "}above</SlipLine>
        <SlipLine delay={next()}>
          {"  "}
          {hexagram.lower.image_en}
        </SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>{rule}</SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>卦辞 JUDGMENT</SlipLine>
        <SlipLine delay={next()}>
          <span className="font-noto-sc text-[14px] leading-snug">{judgment}</span>
        </SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>{rule}</SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>
          <InterpretationMarkdown text={interpretation} />
        </SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>{rule}</SlipLine>
        <SlipLine delay={next()}>{""}</SlipLine>
        <SlipLine delay={next()}>
          {"   "}
          {chineseDate()}
        </SlipLine>
      </div>
    </div>
  );
}
