import * as FileSystem from "expo-file-system/legacy";

const SHARECARD_DIR = `${FileSystem.cacheDirectory ?? ""}quotify-sharecards`;
const FILE_NAME = "Quotify Image.png";
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function getSharecardDirectory() {
  return SHARECARD_DIR;
}

/**
 * Schedules deletion of a temp file after a delay. Returns a function to cancel the scheduled deletion.
 */
export function scheduleTempFileCleanup(
  uri: string,
  delayMs = 20_000
): () => void {
  const id = setTimeout(() => {
    void FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
  }, delayMs);
  return () => clearTimeout(id);
}

export async function cleanupTempFiles(maxAgeMs = DEFAULT_MAX_AGE_MS) {
  if (!FileSystem.cacheDirectory) {
    return;
  }

  const directoryInfo = await FileSystem.getInfoAsync(SHARECARD_DIR);
  if (!directoryInfo.exists) {
    return;
  }

  const now = Date.now();
  const files = await FileSystem.readDirectoryAsync(SHARECARD_DIR);

  await Promise.all(
    files
      .filter((name: string) => name === FILE_NAME)
      .map(async (name: string) => {
        const uri = `${SHARECARD_DIR}/${name}`;
        const info = await FileSystem.getInfoAsync(uri);

        if (!info.exists) {
          return;
        }

        const lastModified = "modificationTime" in info ? info.modificationTime ?? 0 : 0;
        const lastModifiedMs = lastModified > 10_000_000_000 ? lastModified : lastModified * 1000;

        if (!lastModifiedMs || now - lastModifiedMs >= maxAgeMs) {
          await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
        }
      })
  );
}
