"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export type ShellPose = "open" | "closed";

interface TurtleShellProps {
  pose: ShellPose;
  isShaking: boolean;
  className?: string;
}

/** Top-down stylized carapace: plates + hinged lid */
export function TurtleShell({ pose, isShaking, className }: TurtleShellProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (isShaking) {
      controls.start({
        x: [0, 3, -4, 2, -3, 0],
        y: [0, -2, 2, -1, 1, 0],
        rotate: [0, -2, 3, -2, 2, 0],
        transition: { repeat: Infinity, duration: 0.12, ease: "linear" },
      });
    } else {
      controls.stop();
      controls.start({ x: 0, y: 0, rotate: 0, transition: { duration: 0.25 } });
    }
  }, [isShaking, controls]);

  const lidOpen = pose === "open";

  return (
    <motion.div
      className={className}
      animate={controls}
      style={{ transformOrigin: "50% 60%" }}
    >
      <svg
        viewBox="0 0 240 260"
        className="w-full max-w-[min(100%,280px)] h-auto"
        aria-hidden
      >
        <defs>
          <linearGradient id="plate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d5c4f" />
            <stop offset="100%" stopColor="#2d4a3e" />
          </linearGradient>
          <linearGradient id="rim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2d4a3e" />
            <stop offset="50%" stopColor="#3a5648" />
            <stop offset="100%" stopColor="#2d4a3e" />
          </linearGradient>
        </defs>

        {/* Outer rim / body */}
        <ellipse cx="120" cy="138" rx="102" ry="88" fill="#2d4a3e" opacity={0.35} />
        <ellipse cx="120" cy="132" rx="98" ry="84" fill="url(#rim)" stroke="#1a2e26" strokeWidth={1} />

        {/* Central plates cluster */}
        <g fill="url(#plate)" stroke="#1a2e26" strokeWidth={0.8}>
          <path d="M120 52 L152 78 L138 112 L102 112 L88 78 Z" />
          <path d="M88 78 L102 112 L78 148 L52 120 Z" />
          <path d="M152 78 L188 118 L158 152 L138 112 Z" />
          <path d="M102 112 L138 112 L148 158 L112 178 L76 158 Z" />
          <path d="M52 120 L78 148 L68 188 L38 160 Z" />
          <path d="M188 118 L210 158 L172 198 L158 152 Z" />
          <path d="M76 158 L112 178 L98 218 L62 198 Z" />
          <path d="M148 158 L172 198 L130 228 L98 218 Z" />
        </g>

        {/* Hinged lid — rotates from bottom edge */}
        <motion.g
          style={{ originX: "120px", originY: "175px" }}
          animate={{ rotate: lidOpen ? -38 : 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        >
          <path
            d="M40 175 Q120 125 200 175 L190 198 Q120 155 50 198 Z"
            fill="#355547"
            stroke="#1a2e26"
            strokeWidth={1}
          />
          <ellipse cx="120" cy="168" rx="72" ry="22" fill="#2d4a3e" opacity={0.5} />
        </motion.g>

        {/* Inner well hint when conceptually open (subtle) */}
        {lidOpen && (
          <ellipse cx="120" cy="188" rx="56" ry="28" fill="#1a1a1a" opacity={0.06} />
        )}
      </svg>
    </motion.div>
  );
}
