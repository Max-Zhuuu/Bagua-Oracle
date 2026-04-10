"use client";

import { Bones } from "@/components/Bones";
import { Trigram } from "@/components/Trigram";
import { TurtleShell } from "@/components/TurtleShell";
import { Button } from "@/components/ui/button";
import type { Face } from "@/lib/types";
import { facesToLines, facesToTrigramId, randomThrow } from "@/lib/bones";
import {
  hasMotionApi,
  requestMotionPermission,
  requiresMotionPermission,
  type MotionPermissionState,
} from "@/lib/motionPermission";
import { playRattleTick } from "@/lib/sounds";
import { useShakeDetection } from "@/lib/useShakeDetection";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Phase =
  | "prep"
  | "closed"
  | "awaiting-shake"
  | "shaking"
  | "scanning"
  | "result";

type MotionStatus = "unknown" | MotionPermissionState;

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
  const [motionStatus, setMotionStatus] = useState<MotionStatus>("unknown");
  const facesReported = useRef(false);
  const onFacesRef = useRef(onFaces);
  onFacesRef.current = onFaces;

  // Capability pre-check (user mode only — oracle is scripted).
  //  - No API at all → "unsupported" (desktop Firefox, etc.)
  //  - API present + needs explicit permission (iOS 13+) → stay "unknown" so
  //    the primer UI shows on the closed phase.
  //  - API present + no permission needed (Android) → "granted" optimistically
  //    and let the first-event probe decide if a real sensor exists.
  useEffect(() => {
    if (mode !== "user") return;
    if (!hasMotionApi()) {
      setMotionStatus("unsupported");
      return;
    }
    if (!requiresMotionPermission()) {
      setMotionStatus("granted");
    }
  }, [mode]);

  const shellOpen = phase === "prep" || phase === "result";
  const isShakingPhase = phase === "shaking";

  useEffect(() => {
    if (!isShakingPhase) return;
    const id = window.setInterval(() => playRattleTick(), 95);
    return () => clearInterval(id);
  }, [isShakingPhase]);

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

  const motionEnabled =
    mode === "user" &&
    motionStatus === "granted" &&
    (phase === "awaiting-shake" || phase === "shaking");

  const { isShaking: motionShaking, hasReceivedEvents } = useShakeDetection({
    enabled: motionEnabled,
    onShakeComplete: runReveal,
  });

  // When motion is the source of truth, map the hook's isShaking into phase.
  useEffect(() => {
    if (mode !== "user" || motionStatus !== "granted") return;
    if (phase === "awaiting-shake" && motionShaking) {
      setPhase("shaking");
    } else if (phase === "shaking" && !motionShaking) {
      setPhase("awaiting-shake");
    }
  }, [mode, motionStatus, motionShaking, phase]);

  // Auto-advance closed → awaiting-shake when no permission step is needed.
  useEffect(() => {
    if (mode !== "user") return;
    if (phase !== "closed") return;
    if (motionStatus !== "granted") return;
    setPhase("awaiting-shake");
  }, [mode, phase, motionStatus]);

  // First-event probe: if granted but no motion events arrive in 1.5s, assume
  // no real sensor (e.g. desktop Chrome exposes the API with no accelerometer)
  // and fall back to the hold-button path.
  useEffect(() => {
    if (mode !== "user") return;
    if (motionStatus !== "granted") return;
    if (phase !== "awaiting-shake") return;
    if (hasReceivedEvents) return;
    const t = window.setTimeout(() => {
      setMotionStatus("unsupported");
      setPhase("closed");
    }, 1500);
    return () => window.clearTimeout(t);
  }, [mode, motionStatus, phase, hasReceivedEvents]);

  const closeLid = () => setPhase("closed");

  // Hold-button handlers (fallback path only).
  const startShake = () => {
    if (phase === "closed") setPhase("shaking");
  };

  const endShake = () => {
    if (phase === "shaking") runReveal();
  };

  const handleAllowMotion = async () => {
    const result = await requestMotionPermission();
    setMotionStatus(result);
    if (result === "granted") {
      setPhase("awaiting-shake");
    }
  };

  // Oracle-mode scripted sequence — no motion, unchanged semantics.
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

  const showMotionPrimer =
    mode === "user" && phase === "closed" && motionStatus === "unknown";

  // Only reveal the "Shake your phone" text once we've actually received a
  // motion event — prevents a 1.5s flash on desktop Chrome before the probe
  // times out and flips us back to the hold button.
  const showMotionInstructions =
    mode === "user" &&
    motionStatus === "granted" &&
    hasReceivedEvents &&
    (phase === "awaiting-shake" || phase === "shaking");

  const showHoldButton =
    mode === "user" &&
    (motionStatus === "denied" || motionStatus === "unsupported") &&
    (phase === "closed" || phase === "shaking");

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-5 py-8 text-center sm:gap-8 sm:px-6 sm:py-12">
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

      <div className="relative flex min-h-[180px] w-full flex-col items-center justify-center sm:min-h-[200px]">
        <TurtleShell
          pose={shellOpen ? "open" : "closed"}
          isShaking={isShakingPhase}
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

      {showMotionPrimer && (
        <div className="flex flex-col items-center gap-3">
          <p className="max-w-xs text-sm leading-relaxed text-ink/60">
            Grant motion access so your phone can feel the shake.
          </p>
          <Button type="button" onClick={handleAllowMotion}>
            Allow motion
          </Button>
        </div>
      )}

      {showMotionInstructions && (
        <motion.p
          className="text-xs uppercase tracking-[0.25em] text-ink/40"
          animate={{ scale: motionShaking ? 1 : [1, 1.08, 1] }}
          transition={{
            repeat: motionShaking ? 0 : Infinity,
            duration: 1.6,
            ease: "easeInOut",
          }}
        >
          Shake your phone
        </motion.p>
      )}

      {showHoldButton && phase === "closed" && (
        <p className="text-xs uppercase tracking-[0.25em] text-ink/40">
          Hold to shake
        </p>
      )}

      {showHoldButton && (
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
          className="flex w-full flex-col items-center gap-6 sm:gap-10"
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
