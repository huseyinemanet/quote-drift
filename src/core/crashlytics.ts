import { Platform } from "react-native";

type CrashlyticsModule = {
  (): {
    recordError: (error: Error) => Promise<void>;
    log: (message: string) => void;
  };
};

let crashlytics: CrashlyticsModule | null = null;

if (Platform.OS !== "web") {
  try {
    crashlytics = require("@react-native-firebase/crashlytics").default;
  } catch {
    // Native module not linked (e.g. Expo Go or prebuild not run yet)
  }
}

/**
 * Records a JavaScript error to Firebase Crashlytics. No-op on web or when Crashlytics is not linked.
 * Call from error boundaries and catch blocks for production error tracking.
 */
export function recordError(error: Error, context?: string): void {
  if (!crashlytics) return;
  try {
    const instance = crashlytics();
    void instance.recordError(error);
    if (context) {
      instance.log(context);
    }
  } catch {
    // Ignore if Crashlytics is unavailable
  }
}
