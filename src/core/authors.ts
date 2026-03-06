import { authorSeeds } from "@/data/authors";

import { getDb } from "./db";
import { getAuthorIdFromName, normalizeAuthorName } from "./authorIdentity";
import type { Author, QuoteView } from "./types";

export type AuthorQuoteSort = "default" | "shortest" | "longest" | "saved";

type QuoteRow = {
  id: string;
  text: string;
  author: string;
  source: string | null;
  tags: string;
  saved: number | null;
};

const authorSeedById = new Map(
  authorSeeds.map((seed) => [
    getAuthorIdFromName(seed.canonicalName),
    {
      id: getAuthorIdFromName(seed.canonicalName),
      name: seed.canonicalName,
      slug: getAuthorIdFromName(seed.canonicalName),
      shortBio: seed.shortBio,
      description: seed.description,
      tags: seed.tags,
    } satisfies Author,
  ])
);

let authorIndexPromise: Promise<Map<string, string>> | null = null;

async function getAuthorIndex() {
  if (!authorIndexPromise) {
    authorIndexPromise = (async () => {
      const db = await getDb();
      const rows = await db.getAllAsync<{ author: string }>(
        "SELECT DISTINCT author FROM quotes ORDER BY author ASC"
      );
      return new Map(
        rows.map((row) => [getAuthorIdFromName(row.author), row.author])
      );
    })();
  }

  return authorIndexPromise;
}

function buildQuoteView(row: QuoteRow): QuoteView {
  const tags = row.tags ? row.tags.split("|").filter(Boolean) : [];

  return {
    id: row.id,
    text: row.text,
    author: row.author,
    authorId: getAuthorIdFromName(row.author),
    source: row.source ?? undefined,
    tags,
    primaryTag: tags[0] ?? null,
    saved: Boolean(row.saved),
  };
}

function sortQuotes(quotes: QuoteView[], sort: AuthorQuoteSort) {
  if (sort === "default") {
    return quotes;
  }

  const sorted = [...quotes];

  if (sort === "shortest") {
    sorted.sort((left, right) => left.text.length - right.text.length);
    return sorted;
  }

  if (sort === "longest") {
    sorted.sort((left, right) => right.text.length - left.text.length);
    return sorted;
  }

  sorted.sort((left, right) => {
    if (left.saved === right.saved) {
      return left.text.localeCompare(right.text);
    }
    return left.saved ? -1 : 1;
  });
  return sorted;
}

async function resolveAuthorName(authorId: string) {
  const seeded = authorSeedById.get(authorId)?.name;
  if (seeded) {
    return seeded;
  }

  const index = await getAuthorIndex();
  return index.get(authorId) ?? null;
}

export async function getAuthorById(authorId: string): Promise<Author | null> {
  const seeded = authorSeedById.get(authorId);
  const authorName = seeded?.name ?? (await resolveAuthorName(authorId));

  if (!authorName) {
    return null;
  }

  return {
    id: authorId,
    name: authorName,
    slug: authorId,
    shortBio: seeded?.shortBio,
    description: seeded?.description,
    tags: seeded?.tags,
  };
}

export async function getQuotesByAuthorId(
  authorId: string,
  sort: AuthorQuoteSort = "default"
) {
  const authorName = await resolveAuthorName(authorId);
  if (!authorName) {
    return [] as QuoteView[];
  }

  const db = await getDb();
  const rows = await db.getAllAsync<QuoteRow>(
    `SELECT q.id, q.text, q.author, q.source,
            GROUP_CONCAT(qt.tag, '|') AS tags,
            sq.quote_id AS saved
     FROM quotes q
     LEFT JOIN quote_tags qt ON qt.quote_id = q.id
     LEFT JOIN saved_quotes sq ON sq.quote_id = q.id
     WHERE q.normalized_author = ?
     GROUP BY q.id
     ORDER BY q.text ASC`,
    [normalizeAuthorName(authorName)]
  );

  return sortQuotes(rows.map(buildQuoteView), sort);
}

export async function getAuthorQuoteCount(authorId: string) {
  const authorName = await resolveAuthorName(authorId);
  if (!authorName) {
    return 0;
  }

  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM quotes WHERE normalized_author = ?",
    [normalizeAuthorName(authorName)]
  );

  return row?.count ?? 0;
}
