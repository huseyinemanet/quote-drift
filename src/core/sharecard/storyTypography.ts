const STORY_TEXT_PRESETS = [
  { fontSize: 112, lineHeight: 140, letterSpacing: -1.8, maxCharacters: 100 },
  { fontSize: 98, lineHeight: 124, letterSpacing: -1.6, maxCharacters: 130 },
  { fontSize: 86, lineHeight: 110, letterSpacing: -1.4, maxCharacters: 165 },
  { fontSize: 76, lineHeight: 98, letterSpacing: -1.2, maxCharacters: 200 },
  { fontSize: 68, lineHeight: 88, letterSpacing: -1.1, maxCharacters: 245 },
  { fontSize: 60, lineHeight: 80, letterSpacing: -1, maxCharacters: 300 },
  { fontSize: 52, lineHeight: 70, letterSpacing: -0.9, maxCharacters: Number.POSITIVE_INFINITY },
];

export type StoryTypography = (typeof STORY_TEXT_PRESETS)[number];

export function getStoryTypographyPreset(text: string): StoryTypography {
  const normalizedLength = text.trim().replace(/\s+/g, " ").length;

  return (
    STORY_TEXT_PRESETS.find((preset) => normalizedLength <= preset.maxCharacters) ??
    STORY_TEXT_PRESETS[STORY_TEXT_PRESETS.length - 1]
  );
}
