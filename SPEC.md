# AI 八卦 Oracle Backend Specification

## Project Overview

Ritual: User types a question. They cast 3 bones twice. Each bone has 4 faces (2 broad = yin, 2 narrow = yang). Throw 1 produces the lower trigram, throw 2 produces the upper trigram. The two trigrams combine into one of 64 I Ching hexagrams. The backend returns the classical text for that hexagram plus a brief LLM-generated interpretation in English.

## Face → Line Mapping

Each bone has 4 face labels: broad_a, broad_b, narrow_a, narrow_b.

- broad_a, broad_b → yin (0), broken line ⚋
- narrow_a, narrow_b → yang (1), solid line ⚊

The two broad faces are physically more probable (~40% each) and map to yin. The two narrow faces are less probable (~10% each) and map to yang.

## Trigram Lookup

Read 3 lines bottom to top. Lines are passed in bottom-first order.

```
TRIGRAM_MAP = {
    (1,1,1): "qian",   # 乾 ☰ Heaven
    (0,0,0): "kun",    # 坤 ☷ Earth
    (1,0,0): "gen",    # 艮 ☶ Mountain
    (0,1,0): "kan",    # 坎 ☵ Water
    (0,0,1): "zhen",   # 震 ☳ Thunder
    (1,1,0): "dui",    # 兌 ☱ Lake
    (1,0,1): "li",     # 離 ☲ Fire
    (0,1,1): "xun",    # 巽 ☴ Wind
}
```

## Hexagram Lookup (King Wen Sequence)

```
              Upper
Lower    qian dui  li   zhen xun  kan  gen  kun
qian  →   1   43   14   34    9    5   26   11
dui   →  10   58   38   54   61   60   41   19
li    →  13   49   30   55   37   63   22   36
zhen  →  25   17   21   51   42    3   27   24
xun   →  44   28   50   32   57   48   18   46
kan   →   6   47   64   40   59   29    4    7
gen   →  33   31   56   62   53   39   52   15
kun   →  12   45   35   16   20    8   23    2
```

## LLM Prompt

Instruct Claude to act as an I Ching divination master. 80-120 words in English that:

1. Name the hexagram and its image (e.g., "Heaven over Earth")
2. Interpret the judgment (卦辞) in the context of the question
3. Pull one relevant insight from the line statements (爻辞) or commentary (彖/象)
4. End with one sentence of direct counsel

Tone: ancient but grounded, poetic but actionable. No filler.

## Parse Script Format

Raw text entries look like:

```
第一卦 乾 乾为天 乾上乾下
乾：元，亨，利，贞。
初九：潜龙，勿用。
九二：见龙再田，利见大人。
...
彖曰：...
象曰：...
文言曰：...  (optional, only for 乾 and 坤)
```

用九 and 用六 only appear in hexagrams 1 and 2.
Parse each hexagram block and output:

```
json{
  "number": 1,
  "name_zh": "乾",
  "name_full": "乾为天",
  "structure": "乾上乾下",
  "judgment": "元，亨，利，贞。",
  "lines": [
    {"position": "初九", "text": "潜龙，勿用。"},
    ...
  ],
  "yong": "用九：见群龙无首，吉。",
  "tuan": "...",
  "xiang": "...",
  "wenyan": "..."
```
