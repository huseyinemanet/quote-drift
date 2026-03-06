type AuthorSeed = {
  canonicalName: string;
  shortBio?: string;
  description?: string;
  tags?: string[];
};

export const authorSeeds: AuthorSeed[] = [
  {
    canonicalName: "Marcus Aurelius",
    shortBio: "Roman emperor and Stoic philosopher known for Meditations.",
    tags: ["stoicism", "clarity", "discipline"],
  },
  {
    canonicalName: "Seneca",
    shortBio: "Roman Stoic writer whose letters focus on restraint and perspective.",
    tags: ["stoicism", "clarity", "resilience"],
  },
  {
    canonicalName: "Epictetus",
    shortBio: "Stoic teacher whose work centers on control, freedom, and practice.",
    tags: ["stoicism", "focus", "discipline"],
  },
  {
    canonicalName: "Confucius",
    shortBio: "Chinese philosopher associated with ethics, duty, and social harmony.",
    tags: ["wisdom", "balance", "character"],
  },
  {
    canonicalName: "Rumi",
    shortBio: "Persian poet whose writing blends devotion, longing, and compassion.",
    tags: ["love", "spirituality", "kindness"],
  },
  {
    canonicalName: "Oscar Wilde",
    shortBio: "Irish playwright and essayist known for wit, style, and sharp observation.",
    tags: ["wit", "creativity", "clarity"],
  },
  {
    canonicalName: "Maya Angelou",
    shortBio: "American poet and memoirist whose work explores dignity and courage.",
    tags: ["courage", "growth", "kindness"],
  },
];
