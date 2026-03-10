import { z } from "zod";

export const quoteSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  author: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  source: z.string().min(1).optional(),
  explanation: z.string().min(1).optional(),
  context: z.string().min(1).optional(),
  takeaway: z.string().min(1).optional(),
});

export const quotesSchema = z
  .array(quoteSchema)
  .min(1)
  .superRefine((quotes, ctx) => {
    const ids = new Set<string>();
    for (const quote of quotes) {
      if (ids.has(quote.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate quote id: ${quote.id}`,
        });
      }
      ids.add(quote.id);
    }
  });
