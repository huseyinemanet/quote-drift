/**
 * Topic-based prompts and hints for the reflection sheet.
 * Makes the reflection feel tailored to the quote's theme.
 */

const REFLECTION_PROMPTS: Record<string, string> = {
  clarity: "What in your life feels unclear right now?",
  growth: "What challenge is helping you grow?",
  kindness: "When did someone show you kindness recently?",
  courage: "What would you do if you weren't afraid?",
  focus: "What deserves your full attention today?",
  gratitude: "What are you grateful for right now?",
  resilience: "What difficulty made you stronger?",
  balance: "Where do you need more balance?",
  creativity: "What idea have you been putting off?",
  curiosity: "What would you like to learn or try?",
};

const REFLECTION_HINTS: Record<string, string[]> = {
  clarity: [
    "A moment when you felt confused",
    "Something you're avoiding thinking about",
    "A decision you're putting off",
  ],
  growth: [
    "A skill you're learning",
    "Feedback that changed you",
    "A habit you're building",
  ],
  kindness: [
    "A small act that mattered",
    "Someone who supported you",
    "A way you could help someone",
  ],
  courage: [
    "A fear you're working through",
    "A time you spoke up",
    "Something you'd try if you knew you wouldn't fail",
  ],
  focus: [
    "What you want to achieve today",
    "A distraction you're avoiding",
    "Your top priority this week",
  ],
  gratitude: [
    "A person you're thankful for",
    "A simple pleasure",
    "Something that went right recently",
  ],
  resilience: [
    "A setback you overcame",
    "What you learned from a failure",
    "A time you kept going",
  ],
  balance: [
    "An area that feels off",
    "When you last rested properly",
    "Work vs. life right now",
  ],
  creativity: [
    "A project you've delayed",
    "Something you'd make if you had time",
    "An idea you haven't shared",
  ],
  curiosity: [
    "A question you've been wondering",
    "Something you'd like to try",
    "A topic you want to learn",
  ],
  default: [
    "A moment from today",
    "A challenge you're facing",
    "Someone you could help",
  ],
};

export function getReflectionPrompt(topic: string | null): string {
  if (!topic) return "How does this quote relate to your life today?";
  const normalized = topic.trim().toLowerCase();
  return REFLECTION_PROMPTS[normalized] ?? "How does this quote relate to your life today?";
}

export function getReflectionHints(topic: string | null): string[] {
  if (!topic) return REFLECTION_HINTS.default;
  const normalized = topic.trim().toLowerCase();
  return REFLECTION_HINTS[normalized] ?? REFLECTION_HINTS.default;
}
