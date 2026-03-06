import * as Haptics from "expo-haptics";

export async function selectionHaptic() {
  const trigger = (Haptics as { selectionAsync?: () => Promise<void> }).selectionAsync;

  if (typeof trigger !== "function") {
    return;
  }

  try {
    await trigger();
  } catch {
    // Ignore unavailable native haptics in stale dev builds.
  }
}
