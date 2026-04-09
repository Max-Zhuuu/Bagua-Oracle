"use client";

import { LoadingStage } from "@/components/stages/LoadingStage";
import { QuestionStage } from "@/components/stages/QuestionStage";
import { ReadingStage } from "@/components/stages/ReadingStage";
import { ThrowStage } from "@/components/stages/ThrowStage";
import { castReading } from "@/lib/api";
import type { Face, Reading } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

type Flow =
  | "question"
  | "throw1"
  | "throw2"
  | "loading"
  | "reading"
  | "error";

export default function Home() {
  const [flow, setFlow] = useState<Flow>("question");
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const throw1Ref = useRef<[Face, Face, Face] | null>(null);
  const throw2Ref = useRef<[Face, Face, Face] | null>(null);

  const reset = useCallback(() => {
    setFlow("question");
    setQuestion("");
    throw1Ref.current = null;
    throw2Ref.current = null;
    setReading(null);
    setError(null);
  }, []);

  const runCast = useCallback(
    async (q: string, t1: [Face, Face, Face], t2: [Face, Face, Face]) => {
      setFlow("loading");
      setError(null);
      try {
        const r = await castReading({
          question: q,
          throw_1: t1,
          throw_2: t2,
        });
        setReading(r);
        setFlow("reading");
      } catch (e) {
        setError(e instanceof Error ? e.message : "The oracle could not answer.");
        setFlow("error");
      }
    },
    []
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 py-6 text-center">
        <p className="font-serif text-sm tracking-[0.35em] text-ink/50">
          AI 八卦骨卜
        </p>
      </header>

      <main className="mx-auto max-w-3xl pb-24 pt-8">
        <AnimatePresence mode="wait">
          {flow === "question" && (
            <motion.div
              key="q"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <QuestionStage
                onCommit={(q) => {
                  setQuestion(q);
                  setFlow("throw1");
                }}
              />
            </motion.div>
          )}

          {flow === "throw1" && (
            <motion.div
              key="t1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ThrowStage
                key="throw-user"
                mode="user"
                headline="First throw"
                subline="Place the three bones inside. Close the lid. Shake."
                advanceLabel="Continue"
                onFaces={(f) => {
                  throw1Ref.current = f;
                }}
                onAdvance={() => setFlow("throw2")}
              />
            </motion.div>
          )}

          {flow === "throw2" && (
            <motion.div
              key="t2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ThrowStage
                key="throw-oracle"
                mode="oracle"
                headline="The oracle now shakes the bones."
                advanceLabel="Receive the reading"
                onFaces={(f) => {
                  throw2Ref.current = f;
                }}
                onAdvance={() => {
                  const t1 = throw1Ref.current;
                  const t2 = throw2Ref.current;
                  if (question && t1 && t2) void runCast(question, t1, t2);
                }}
              />
            </motion.div>
          )}

          {flow === "loading" && (
            <motion.div
              key="load"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingStage />
            </motion.div>
          )}

          {flow === "reading" && reading && (
            <motion.div
              key="read"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ReadingStage reading={reading} onAskAnother={reset} />
            </motion.div>
          )}

          {flow === "error" && (
            <motion.div
              key="err"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-md px-6 py-16 text-center"
            >
              <p className="font-serif text-xl text-ink">{error}</p>
              <p className="mt-4 text-sm text-ink/50">
                Check that the API is running and ANTHROPIC_API_KEY is set.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-8 border border-ink/20 px-6 py-3 text-sm text-ink hover:bg-ink/5"
              >
                Begin again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
