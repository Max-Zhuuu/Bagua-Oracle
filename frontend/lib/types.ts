export type Face = "broad_a" | "broad_b" | "narrow_a" | "narrow_b";

export interface CastRequest {
  question: string;
  throw_1: [Face, Face, Face];
  throw_2: [Face, Face, Face];
}

export interface TrigramResult {
  id: string;
  name_zh: string;
  pinyin: string;
  image_en: string;
  lines: [0 | 1, 0 | 1, 0 | 1];
}

export interface HexagramResult {
  number: number;
  name_zh: string;
  lower: TrigramResult;
  upper: TrigramResult;
  classical_text: {
    judgment?: string;
    name_full?: string;
    structure?: string;
    lines?: Array<{ position: string; text: string }>;
    tuan?: string;
    xiang?: string;
    wenyan?: string;
    yong?: string | null;
    english_reference?: unknown;
  };
}

export interface Reading {
  question: string;
  hexagram: HexagramResult;
  interpretation: string;
}
