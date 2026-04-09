"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/** Indeterminate six lines drawing bottom → top */
export function LoadingStage() {
  const pattern = useMemo(() => [0, 1, 0, 1, 0, 1] as const, []);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-10 px-6 py-20 text-center">
      <p className="font-serif text-xl text-ink/90 md:text-2xl">
        The oracle is consulting the 易經…
      </p>
      <div className="flex flex-col-reverse items-center gap-2">
        {pattern.map((yang, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              delay: i * 0.22,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="origin-center"
          >
            {yang ? (
              <div className="h-1.5 w-16 rounded-[1px] bg-jade" />
            ) : (
              <div className="flex w-16 justify-between gap-2">
                <div className="h-1.5 flex-1 rounded-[1px] bg-jade" />
                <div className="h-1.5 flex-1 rounded-[1px] bg-jade" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <p className="text-sm text-ink/45">Please wait.</p>
    </div>
  );
}
