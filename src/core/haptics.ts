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

export async function successHaptic() {
  try {
    const H = Haptics as typeof Haptics & {
      notificationAsync?: (type: "success" | "warning" | "error") => Promise<void>;
    };
    if (typeof H.notificationAsync === "function") {
      await H.notificationAsync("success");
    }
  } catch {
    // Ignore
  }
}
