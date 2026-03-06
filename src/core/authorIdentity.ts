export function normalizeAuthorName(value: string) {
  return value.trim().toLowerCase();
}

function slugifyAuthorName(value: string) {
  return normalizeAuthorName(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function hashAuthorName(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36).padStart(6, "0").slice(0, 6);
}

export function getAuthorIdFromName(name: string) {
  const slug = slugifyAuthorName(name) || "author";
  return `${slug}-${hashAuthorName(name)}`;
}
