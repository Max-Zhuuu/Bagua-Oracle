Cursor Prompt: AI 八卦 Oracle Frontend
Build a polished web-based demo interface for the AI 八卦骨卜 (I Ching bone oracle) project. This frontend simulates the physical ritual that will eventually be replaced by real hardware (turtle shell + bones + camera + thermal printer). The interaction should feel ceremonial and focused — this is a divination ritual, not a form.
Tech Stack

Next.js 14 (App Router) with TypeScript
Tailwind CSS for styling
Framer Motion for ritual animations
shadcn/ui for base components
Place frontend in a new frontend/ directory at the repo root, alongside the existing src/ backend
The existing FastAPI backend runs on http://localhost:8000

The Ritual Flow
The user is performing a divination with a physical turtle shell oracle. The UI should make them feel the weight of each step. No rushing.
Stage 1: Ask the Question
A quiet, centered screen. Minimal. Just a prompt: "What weighs on your mind?" and a text input. A single button: "Hold the question" (not "Submit"). When clicked, the question is committed and the screen transitions.
Stage 2: First Throw (The User's Throw)
The screen shows a turtle shell (use an SVG illustration or stylized shape — something iconic, not cartoonish). Instructions: "Place the three bones inside. Close the lid. Shake."

A button: "Close the lid" — the shell visually closes with animation
After closing, a button appears: "Shake" — when held down, the shell rattles (Framer Motion shake animation), audio of bones clacking plays
On release, the shell opens and the screen shows: "Reading the bones..." with a camera-scan animation overlay
Behind the scenes: the frontend generates 3 random face labels (broad_a, broad_b, narrow_a, narrow_b) using the 40/40/10/10 probability distribution. This simulates what the camera will later do.
Show the 3 resulting bone faces visually — small illustrated bones with their landed face highlighted — along with the trigram that forms (e.g., ☰ 乾 Heaven). Pause for 2 seconds to let the user see it.
Button: "Continue"

Stage 3: Second Throw (The Oracle's Throw)
Screen message: "The oracle now shakes the bones." The shell closes on its own this time (no button). It shakes automatically. No user interaction — this represents the AI's counterpart throw. After the shake, the shell opens and reveals the second set of 3 bones and their trigram.
This mirrors the user's throw but is performed by the system. The frontend generates another 3 random faces with the same distribution.
Stage 4: The Reading
Once both throws are complete, the frontend calls POST http://localhost:8000/cast with:
json{
  "question": "...",
  "throw_1": ["broad_a", "narrow_a", "broad_b"],
  "throw_2": ["narrow_a", "narrow_b", "broad_a"]
}
While waiting, show a contemplative loading state: "The oracle is consulting the 易經..." with subtle animation (maybe the hexagram lines drawing themselves one by one from bottom to top).
When the response arrives, transition to the fortune slip.
Stage 5: The Fortune Slip
Display the reading styled as a thermal printer receipt — monospace font, narrow column (around 320px wide), off-white paper texture background, subtle drop shadow, faint perforated edges top and bottom. Content top-to-bottom:
━━━━━━━━━━━━━━━━━━━━
     AI 八卦骨卜
   Oracle Reading
━━━━━━━━━━━━━━━━━━━━

  Question:
  "{user's question}"

━━━━━━━━━━━━━━━━━━━━

       {hexagram_symbol}
    {hexagram number}. {name_zh}
    {name_full}

  {upper trigram image_en}
       above
  {lower trigram image_en}

━━━━━━━━━━━━━━━━━━━━

  卦辞 JUDGMENT
  {classical judgment text in Chinese}

━━━━━━━━━━━━━━━━━━━━

  {LLM interpretation -
   the poem-styled reading}

━━━━━━━━━━━━━━━━━━━━

   {current date in
    Chinese format}
The slip should animate in as if being printed line by line from top to bottom — use a typewriter/stagger effect. Play a subtle thermal printer sound (optional).
Below the slip: two buttons — "Ask another question" (resets to Stage 1) and "Keep this reading" (saves to a local history in localStorage).
Visual Design Direction

Palette: bone-white background (#F5F1E8), ink-black text (#1A1A1A), a single accent color of dark jade (#2D4A3E) used sparingly for active states and the turtle shell shadows
Typography:

Headings: a warm serif like Cormorant Garamond (via Google Fonts)
Body: Inter or system sans
Fortune slip: JetBrains Mono or Courier Prime for the thermal printer feel
Chinese characters: Noto Serif SC for judgment text, Noto Sans SC for UI labels


No gradients, no drop shadows except on the fortune slip. Flat, ceremonial, restrained.
Lots of whitespace. Each stage should feel like one clear thing is happening.
Subtle animations only. Framer Motion for the shell opening/closing, the shake, the line-by-line hexagram draw, and the printer-style slip reveal. Nothing bouncy or playful — this is a ritual.

The Turtle Shell
Don't use a stock image. Create an SVG in code that looks like a top-down view of a turtle shell — hexagonal/pentagonal plates in a dome shape. Two states: closed (just the shell) and open (shell tilted back, bones visible inside). Transition between them with Framer Motion.
When shaking, translate and rotate the shell rapidly with small random offsets. The three bones inside (small elongated SVG shapes) should jitter independently.
Bone Visualization
When the bones are "read" after a throw, show them as three small SVG shapes in a row with a label underneath each indicating the face (broad or narrow) and the resulting line (⚋ yin or ⚊ yang). Above them, show the trigram that forms — the 3 lines stacked with the trigram name (e.g., ☰ 乾 Qián — Heaven).
Probability Simulation
In a util file frontend/lib/bones.ts, create the face randomizer:
typescriptconst FACE_DISTRIBUTION = [
  { face: "broad_a",  weight: 0.40 },
  { face: "broad_b",  weight: 0.40 },
  { face: "narrow_a", weight: 0.10 },
  { face: "narrow_b", weight: 0.10 },
];

export function randomFace(): Face { /* weighted random */ }
export function randomThrow(): [Face, Face, Face] { /* 3 faces */ }
Also include a helper to convert a face to its yin/yang line and 3 lines to a trigram ID (mirror the backend logic so the UI can preview the trigram before calling the backend).
State Management
Use React state within a single main page component. No need for Zustand/Redux. The stages are linear:
idle → question → throw_1_prep → throw_1_shaking → throw_1_result
→ throw_2_prep → throw_2_shaking → throw_2_result → loading → reading
Store the question, both throws, and the backend response in state. On "Ask another question," reset everything.
File Structure
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # the main ritual page
│   └── globals.css
├── components/
│   ├── stages/
│   │   ├── QuestionStage.tsx
│   │   ├── ThrowStage.tsx          # reused for both throws
│   │   ├── LoadingStage.tsx
│   │   └── ReadingStage.tsx
│   ├── TurtleShell.tsx             # SVG + animation states
│   ├── Bones.tsx                   # 3 bones display
│   ├── Trigram.tsx                 # stacked lines display
│   └── FortuneSlip.tsx             # thermal-printer receipt
├── lib/
│   ├── bones.ts                    # face randomizer + conversions
│   ├── api.ts                      # backend fetch wrapper
│   └── types.ts                    # mirror backend types
├── public/
│   └── sounds/                     # optional rattle and print sounds
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
Backend Contract
The frontend must match the backend's CastRequest and Reading schemas. Define matching TypeScript types in frontend/lib/types.ts:
typescriptexport type Face = "broad_a" | "broad_b" | "narrow_a" | "narrow_b";

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
    judgment: string;
    lines: Array<{ position: string; text: string }>;
    tuan?: string;
    xiang?: string;
    wenyan?: string;
  };
}

export interface Reading {
  question: string;
  hexagram: HexagramResult;
  interpretation: string;
}
Interpretation Styling Note
The backend currently returns the LLM interpretation as plain text. When displayed in the fortune slip, render it with soft line breaks every ~30 characters to fit the thermal printer column width. Break on whitespace, never mid-word.
CORS
The backend will need CORS enabled for http://localhost:3000. Add a note in the prompt response reminding me to add CORS middleware to the FastAPI server (or add it yourself by editing src/api/server.py).
Build Order

Next.js project scaffolding with Tailwind and Framer Motion
lib/types.ts, lib/bones.ts, lib/api.ts
TurtleShell.tsx component with open/closed/shaking states
Bones.tsx and Trigram.tsx display components
Stage components in order (Question → Throw → Loading → Reading)
FortuneSlip.tsx with the thermal printer aesthetic
Main page.tsx that orchestrates the stage flow
Polish: fonts, animations, spacing, sounds (optional)
Update backend src/api/server.py to add CORS middleware allowing http://localhost:3000

Success Criteria
I should be able to run npm run dev in frontend/ and uvicorn src.api.server:app --reload in the repo root, visit http://localhost:3000, and complete a full divination — type a question, shake the shell, watch the AI shake the shell, and receive a printed fortune slip — without any console errors. The experience should feel focused and quietly ceremonial.
Do not skip the animations or the shell SVG. Those are the core of the experience.
