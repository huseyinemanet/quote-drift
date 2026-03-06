jest.mock("@/core/db", () => ({
  getDb: jest.fn(),
}));

import { getDb } from "@/core/db";
import { getAuthorIdFromName } from "@/core/authorIdentity";
import {
  getAuthorById,
  getAuthorQuoteCount,
  getQuotesByAuthorId,
} from "@/core/authors";

describe("author selectors", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("builds a stable author id from the author name", () => {
    expect(getAuthorIdFromName("Marcus Aurelius")).toBe(
      getAuthorIdFromName("Marcus Aurelius")
    );
    expect(getAuthorIdFromName("Marcus Aurelius")).not.toBe(
      getAuthorIdFromName("Seneca")
    );
  });

  it("resolves author metadata and quotes by derived author id", async () => {
    const authorId = getAuthorIdFromName("Marcus Aurelius");
    (getDb as jest.Mock).mockResolvedValue({
      getAllAsync: jest.fn(async (query: string) => {
        if (query.includes("SELECT DISTINCT author")) {
          return [{ author: "Marcus Aurelius" }, { author: "Seneca" }];
        }

        return [
          {
            id: "q-1",
            text: "You have power over your mind.",
            author: "Marcus Aurelius",
            source: null,
            tags: "clarity|discipline",
            saved: "q-1",
          },
          {
            id: "q-2",
            text: "Waste no more time arguing.",
            author: "Marcus Aurelius",
            source: null,
            tags: "clarity",
            saved: null,
          },
        ];
      }),
      getFirstAsync: jest.fn(async () => ({ count: 2 })),
    });

    const author = await getAuthorById(authorId);
    const count = await getAuthorQuoteCount(authorId);
    const quotes = await getQuotesByAuthorId(authorId, "saved");

    expect(author?.name).toBe("Marcus Aurelius");
    expect(count).toBe(2);
    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toMatchObject({
      author: "Marcus Aurelius",
      authorId,
      saved: true,
    });
  });
});
