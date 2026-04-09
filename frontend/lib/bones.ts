import type { Face } from "./types";

export const FACE_DISTRIBUTION = [
  { face: "broad_a" as const, weight: 0.4 },
  { face: "broad_b" as const, weight: 0.4 },
  { face: "narrow_a" as const, weight: 0.1 },
  { face: "narrow_b" as const, weight: 0.1 },
] as const;

export type Line = 0 | 1;

export type TrigramId =
  | "qian"
  | "kun"
  | "gen"
  | "kan"
  | "zhen"
  | "dui"
  | "li"
  | "xun";

/** Bottom line first, same as backend TRIGRAM_MAP */
const TRIGRAM_KEY: Record<string, TrigramId> = {
  "1,1,1": "qian",
  "0,0,0": "kun",
  "1,0,0": "gen",
  "0,1,0": "kan",
  "0,0,1": "zhen",
  "1,1,0": "dui",
  "1,0,1": "li",
  "0,1,1": "xun",
};

export const TRIGRAM_META: Record<
  TrigramId,
  { name_zh: string; pinyin: string; image_en: string; symbol: string }
> = {
  qian: { name_zh: "乾", pinyin: "Qián", image_en: "Heaven", symbol: "☰" },
  kun: { name_zh: "坤", pinyin: "Kūn", image_en: "Earth", symbol: "☷" },
  gen: { name_zh: "艮", pinyin: "Gèn", image_en: "Mountain", symbol: "☶" },
  kan: { name_zh: "坎", pinyin: "Kǎn", image_en: "Water", symbol: "☵" },
  zhen: { name_zh: "震", pinyin: "Zhèn", image_en: "Thunder", symbol: "☳" },
  dui: { name_zh: "兌", pinyin: "Duì", image_en: "Lake", symbol: "☱" },
  li: { name_zh: "離", pinyin: "Lí", image_en: "Fire", symbol: "☲" },
  xun: { name_zh: "巽", pinyin: "Xùn", image_en: "Wind", symbol: "☴" },
};

export function randomFace(): Face {
  const r = Math.random();
  let acc = 0;
  for (const { face, weight } of FACE_DISTRIBUTION) {
    acc += weight;
    if (r <= acc) return face;
  }
  return "broad_b";
}

export function randomThrow(): [Face, Face, Face] {
  return [randomFace(), randomFace(), randomFace()];
}

export function faceToLine(face: Face): Line {
  return face.startsWith("broad") ? 0 : 1;
}

export function facesToLines(faces: [Face, Face, Face]): [Line, Line, Line] {
  return [faceToLine(faces[0]), faceToLine(faces[1]), faceToLine(faces[2])];
}

export function linesToTrigram(lines: [Line, Line, Line]): TrigramId {
  const key = `${lines[0]},${lines[1]},${lines[2]}`;
  const id = TRIGRAM_KEY[key];
  if (!id) throw new Error(`Invalid trigram lines: ${key}`);
  return id;
}

export function facesToTrigramId(faces: [Face, Face, Face]): TrigramId {
  return linesToTrigram(facesToLines(faces));
}

/** King Wen hexagram Unicode block U+4DC0 … U+4DFF */
export function hexagramSymbol(number: number): string {
  if (number < 1 || number > 64) return "☯";
  return String.fromCodePoint(0x4dc0 + (number - 1));
}

export function isBroad(face: Face): boolean {
  return face.startsWith("broad");
}
