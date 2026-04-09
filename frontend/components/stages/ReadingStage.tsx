"use client";

import type { Reading } from "@/lib/types";
import { FortuneSlip } from "@/components/FortuneSlip";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "bagua_oracle_readings_v1";

interface ReadingStageProps {
  reading: Reading;
  onAskAnother: () => void;
}

export function ReadingStage({ reading, onAskAnother }: ReadingStageProps) {
  function keep() {
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
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-12 px-4 py-12">
      <FortuneSlip reading={reading} />
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Button type="button" variant="outline" onClick={onAskAnother}>
          Ask another question
        </Button>
        <Button type="button" onClick={keep}>
          Keep this reading
        </Button>
      </div>
    </div>
  );
}
