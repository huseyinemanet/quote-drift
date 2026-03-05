import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const inputPath =
  process.argv[2] ?? "/Users/huseyinemanet/Downloads/author-quote.txt";
const outputPath = path.join(projectRoot, "assets", "quotes.json");

const topicRules = [
  {
    tag: "growth",
    words: ["learn", "growth", "improve", "change", "become", "better"],
  },
  {
    tag: "courage",
    words: ["courage", "brave", "fear", "risk", "bold", "strength"],
  },
  {
    tag: "focus",
    words: ["focus", "attention", "goal", "discipline", "work", "mission"],
  },
  {
    tag: "kindness",
    words: ["kind", "love", "heart", "friend", "care", "compassion"],
  },
  {
    tag: "gratitude",
    words: ["thank", "gratitude", "gift", "blessing", "appreciate"],
  },
  {
    tag: "clarity",
    words: ["truth", "clear", "mind", "think", "wisdom", "understand"],
  },
  {
    tag: "resilience",
    words: ["resilience", "fail", "obstacle", "endure", "persever", "rise"],
  },
  {
    tag: "balance",
    words: ["balance", "rest", "calm", "peace", "quiet", "slow"],
  },
  {
    tag: "creativity",
    words: ["create", "art", "imagine", "invent", "dream", "idea"],
  },
  {
    tag: "curiosity",
    words: ["curious", "question", "wonder", "explore", "discover"],
  },
];

function normalize(value) {
  return value
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim();
}

function deriveTags(author, text) {
  const haystack = `${author} ${text}`.toLowerCase();
  const tags = topicRules
    .filter((rule) => rule.words.some((word) => haystack.includes(word)))
    .map((rule) => rule.tag);

  if (tags.length === 0) {
    return ["clarity"];
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

function buildStableId(author, text) {
  const digest = createHash("sha1")
    .update(`${author}\u0000${text}`)
    .digest("hex")
    .slice(0, 12);
  return `quote-${digest}`;
}

const input = readFileSync(inputPath, "utf8");
const lines = input.split(/\r?\n/).filter(Boolean);
const seen = new Set();
const quotes = [];

for (const line of lines) {
  const [rawAuthor, ...rest] = line.split("\t");
  const rawQuote = rest.join("\t");
  const author = normalize(rawAuthor ?? "");
  const text = normalize(rawQuote ?? "");

  if (!author || !text) {
    continue;
  }

  const dedupeKey = `${author}\u0000${text}`;
  if (seen.has(dedupeKey)) {
    continue;
  }
  seen.add(dedupeKey);

  quotes.push({
    id: buildStableId(author, text),
    text,
    author,
    tags: deriveTags(author, text),
    source: "author-quote.txt",
  });
}

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(quotes, null, 2)}\n`);

console.log(
  `Wrote ${quotes.length} quotes to ${outputPath} from ${path.basename(inputPath)}`
);
