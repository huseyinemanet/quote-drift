const STORY_TEXT_PRESETS = [
  { fontSize: 118, lineHeight: 144, letterSpacing: -1.8, maxCharacters: 110 },
  { fontSize: 104, lineHeight: 130, letterSpacing: -1.6, maxCharacters: 145 },
  { fontSize: 92, lineHeight: 116, letterSpacing: -1.4, maxCharacters: 175 },
  { fontSize: 82, lineHeight: 104, letterSpacing: -1.2, maxCharacters: 215 },
  { fontSize: 74, lineHeight: 94, letterSpacing: -1.1, maxCharacters: 260 },
  { fontSize: 66, lineHeight: 86, letterSpacing: -1, maxCharacters: 320 },
  { fontSize: 58, lineHeight: 76, letterSpacing: -0.9, maxCharacters: Number.POSITIVE_INFINITY },
];

export type StoryTypography = (typeof STORY_TEXT_PRESETS)[number];

export function getStoryTypographyPreset(text: string): StoryTypography {
  const normalizedLength = text.trim().replace(/\s+/g, " ").length;

  return (
    STORY_TEXT_PRESETS.find((preset) => normalizedLength <= preset.maxCharacters) ??
    STORY_TEXT_PRESETS[STORY_TEXT_PRESETS.length - 1]
  );
}
