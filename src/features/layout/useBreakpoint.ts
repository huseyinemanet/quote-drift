import { useWindowDimensions } from "react-native";

/** Breakpoint above which we treat the device as tablet (e.g. iPad) for layout. */
export const TABLET_BREAKPOINT = 768;

/** Max width for main content on tablet so it doesn't span full width. */
export const MAX_CONTENT_WIDTH = 640;

export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= TABLET_BREAKPOINT;
}

export function useContentWidthConstraint(): { maxWidth: number | undefined; width: number } {
  const { width } = useWindowDimensions();
  const maxWidth = width >= TABLET_BREAKPOINT ? MAX_CONTENT_WIDTH : undefined;
  return { maxWidth, width };
}
