"use client";

import type { Reading } from "@/lib/types";
import { FortuneSlip } from "@/components/FortuneSlip";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const STORAGE_KEY = "bagua_oracle_readings_v1";

interface ReadingStageProps {
  reading: Reading;
  onAskAnother: () => void;
}

export function ReadingStage({ reading, onAskAnother }: ReadingStageProps) {
  const [saved, setSaved] = useState(false);

  function keep() {
    if (saved) return;
    try {
      const prev = JSON.parse(
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY) || "[]"
          : "[]"
      ) as unknown[];
      const entry = {
        savedAt: new Date().toISOString(),
        question: reading.question,
        reading,
      };
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([entry, ...prev].slice(0, 50))
      );
      setSaved(true);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6">
        <FortuneSlip reading={reading} />
      </div>
      <div className="shrink-0 border-t border-ink/10 bg-bone px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" variant="outline" onClick={onAskAnother}>
            Ask another question
          </Button>
          <Button
            type="button"
            onClick={keep}
            disabled={saved}
            aria-live="polite"
            className={
              saved
                ? "border-jade/30 bg-jade/10 text-jade hover:bg-jade/10 disabled:opacity-100"
                : undefined
            }
          >
            {saved ? "✓ Kept" : "Keep this reading"}
          </Button>
        </div>
        <AnimatePresence>
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 text-center text-[11px] uppercase tracking-[0.25em] text-jade/70"
            >
              Saved to this device
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
