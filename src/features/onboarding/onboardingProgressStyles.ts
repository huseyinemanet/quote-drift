import type { ThemeTokens } from "@/ui/theme";

/** Shared progress dot styles for all onboarding screens. Pasif + Aktif only. */
const DOT_SIZE = 10;
const DOT_ACTIVE_SIZE = 12;
const DOT_GAP = 10;

export function createOnboardingProgressStyles(colors: ThemeTokens) {
  return {
    progressRow: {
      marginTop: 12,
      paddingVertical: 10,
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    progressDots: {
      flexDirection: "row" as const,
      gap: DOT_GAP,
      alignItems: "center" as const,
    },
    /** Pasif: geçmiş ve gelecek adımlar */
    progressDot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: colors.border,
    },
    /** Aktif: mevcut adım */
    progressDotActive: {
      width: DOT_ACTIVE_SIZE,
      height: DOT_ACTIVE_SIZE,
      borderRadius: DOT_ACTIVE_SIZE / 2,
      backgroundColor: colors.text,
    },
  };
}
