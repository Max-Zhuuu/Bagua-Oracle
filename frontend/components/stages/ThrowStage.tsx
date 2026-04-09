"use client";

import { Bones } from "@/components/Bones";
import { Trigram } from "@/components/Trigram";
import { TurtleShell } from "@/components/TurtleShell";
import { Button } from "@/components/ui/button";
import type { Face } from "@/lib/types";
import { facesToLines, facesToTrigramId, randomThrow } from "@/lib/bones";
import { playRattleTick } from "@/lib/sounds";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "prep" | "closed" | "shaking" | "scanning" | "result";

interface ThrowStageProps {
  mode: "user" | "oracle";
  headline: string;
  subline?: string;
  advanceLabel: string;
  onFaces: (faces: [Face, Face, Face]) => void;
  onAdvance: () => void;
}

export function ThrowStage({
  mode,
  headline,
  subline,
  advanceLabel,
  onFaces,
  onAdvance,
}: ThrowStageProps) {
  const [phase, setPhase] = useState<Phase>("prep");
  const [faces, setFaces] = useState<[Face, Face, Face] | null>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const facesReported = useRef(false);
  const onFacesRef = useRef(onFaces);
  onFacesRef.current = onFaces;

  const shellOpen = phase === "prep" || phase === "result";
  const isShaking = phase === "shaking";

  useEffect(() => {
    if (!isShaking) return;
    const id = window.setInterval(() => playRattleTick(), 95);
    return () => clearInterval(id);
  }, [isShaking]);

  const runReveal = useCallback(() => {
    const t = randomThrow();
    setFaces(t);
    if (!facesReported.current) {
      facesReported.current = true;
      onFacesRef.current(t);
    }
    setPhase("scanning");
    window.setTimeout(() => {
      setPhase("result");
      window.setTimeout(() => setCanAdvance(true), 2000);
    }, 1400);
  }, []);

  const closeLid = () => setPhase("closed");

  const startShake = () => {
    if (phase === "closed") setPhase("shaking");
  };

  const endShake = () => {
    if (phase === "shaking") runReveal();
  };

  useEffect(() => {
    if (mode !== "oracle") return;
    let alive = true;
    const timers: number[] = [];
    const schedule = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => alive && fn(), ms));
    };
    schedule(900, () => setPhase("closed"));
    schedule(1600, () => setPhase("shaking"));
    schedule(3400, () => runReveal());
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [mode, runReveal]);

  const trigramId = faces ? facesToTrigramId(faces) : null;
  const lines = faces ? facesToLines(faces) : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-8 px-6 py-12 text-center">
      <div>
        <h2 className="font-serif text-2xl font-medium text-ink md:text-3xl">
          {headline}
        </h2>
        {subline && (
          <p className="mt-4 text-sm leading-relaxed text-ink/55 md:text-base">
            {subline}
          </p>
        )}
      </div>

      <div className="relative flex min-h-[200px] w-full flex-col items-center justify-center">
        <TurtleShell
          pose={shellOpen ? "open" : "closed"}
          isShaking={isShaking}
          className="z-10"
        />

        <AnimatePresence>
          {phase === "scanning" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-bone/80 backdrop-blur-[2px]"
            >
              <p className="font-serif text-lg text-jade">Reading the bones…</p>
              <motion.div
                className="absolute inset-6 rounded border border-jade/25"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {mode === "user" && phase === "prep" && (
        <Button type="button" variant="outline" onClick={closeLid}>
          Close the lid
        </Button>
      )}

      {mode === "user" && phase === "closed" && (
        <p className="text-xs uppercase tracking-[0.25em] text-ink/40">
          Hold to shake
        </p>
      )}

      {mode === "user" && (phase === "closed" || phase === "shaking") && (
        <Button
          type="button"
          variant="default"
          className="select-none touch-manipulation"
          onPointerDown={(e) => {
            e.preventDefault();
            startShake();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            endShake();
          }}
          onPointerCancel={() => {
            if (phase === "shaking") endShake();
          }}
          onPointerLeave={() => {
            if (phase === "shaking") endShake();
          }}
        >
          Shake
        </Button>
      )}

      {phase === "result" && faces && lines && trigramId && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex w-full flex-col items-center gap-10"
        >
          <Bones faces={faces} jitter={false} />
          <Trigram
            lines={lines}
            trigramId={trigramId}
            label={mode === "user" ? "Lower trigram" : "Upper trigram"}
            animateIn
          />
        </motion.div>
      )}

      {phase === "result" && canAdvance && (
        <Button type="button" onClick={onAdvance}>
          {advanceLabel}
        </Button>
      )}
    </div>
  );
}
