import type { CastRequest, Reading } from "./types";

const DEFAULT_BASE = "http://localhost:8000";

export function getApiBase(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  return DEFAULT_BASE;
}

export async function castReading(body: CastRequest): Promise<Reading> {
  const res = await fetch(`${getApiBase()}/cast`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: body.question,
      throw_1: [...body.throw_1],
      throw_2: [...body.throw_2],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Cast failed (${res.status})`);
  }
  return res.json() as Promise<Reading>;
}
