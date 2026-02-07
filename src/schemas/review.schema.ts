import z from "zod";

export const submitReviewSchema = z.object({
  bookingId: z.string({ error: "required" }),
  rating: z.number({ error: " required number" }),
  comment: z.string({ error: " required " }),
});
