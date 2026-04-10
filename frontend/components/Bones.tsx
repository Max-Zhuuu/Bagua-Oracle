"use client";

import type { Face } from "@/lib/types";
import { faceToLine, isBroad } from "@/lib/bones";
import { motion } from "framer-motion";

interface BonesProps {
  faces: [Face, Face, Face];
  jitter?: boolean;
  compact?: boolean;
  className?: string;
}

function BoneGlyph({
  face,
  jitter,
  compact,
}: {
  face: Face;
  jitter: boolean;
  compact: boolean;
}) {
  const broad = isBroad(face);
  return (
    <motion.div
      className="flex flex-col items-center gap-0.5"
      animate={
        jitter
          ? {
              x: [0, 2, -2, 1, 0],
              y: [0, -1, 1, 0],
              rotate: [0, 2, -2, 0],
            }
          : {}
      }
      transition={{ repeat: jitter ? Infinity : 0, duration: 0.1 }}
    >
      <svg
        viewBox="0 0 48 120"
        className={
          compact ? "h-16 w-8 text-ink sm:h-20 sm:w-9" : "h-24 w-10 text-ink"
        }
        aria-hidden
      >
        {/* Elongated bone */}
        <ellipse cx="24" cy="60" rx="14" ry="52" fill="#e8e2d6" stroke="currentColor" strokeWidth={1.2} />
        {/* Landed face highlight */}
        {broad ? (
          <ellipse cx="24" cy="38" rx="9" ry="14" fill="#2d4a3e" opacity={0.35} />
        ) : (
          <ellipse cx="24" cy="38" rx="5" ry="14" fill="#2d4a3e" opacity={0.45} />
        )}
      </svg>
      <span
        className={
          compact
            ? "font-sans text-[10px] tracking-wide text-ink/70"
            : "font-sans text-[11px] tracking-wide text-ink/70"
        }
      >
        {broad ? "broad" : "narrow"}
      </span>
      <span
        className={
          compact
            ? "font-mono text-base text-ink"
            : "font-mono text-lg text-ink"
        }
      >
        {faceToLine(face) === 0 ? "⚋" : "⚊"}
      </span>
    </motion.div>
  );
}

export function Bones({ faces, jitter = false, compact = false, className }: BonesProps) {
  return (
    <div
      className={`flex justify-center ${compact ? "gap-5 sm:gap-8" : "gap-8"} ${className ?? ""}`}
    >
      {faces.map((f, i) => (
        <BoneGlyph key={i} face={f} jitter={jitter} compact={compact} />
      ))}
    </div>
  );
}
