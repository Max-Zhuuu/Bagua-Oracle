"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface QuestionStageProps {
  onCommit: (q: string) => void;
}

export function QuestionStage({ onCommit }: QuestionStageProps) {
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-8 px-5 py-10 text-center sm:gap-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-3xl font-medium tracking-tight text-ink md:text-4xl">
        What weighs on your mind?
      </h1>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder=""
        maxLength={500}
        className="text-center font-sans text-base"
        aria-label="Your question"
      />
      <Button
        type="button"
        disabled={!value.trim()}
        onClick={() => onCommit(value.trim())}
        className="w-full sm:w-auto sm:min-w-[200px]"
      >
        Hold the question
      </Button>
    </div>
  );
}
