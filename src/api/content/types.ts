import { z } from "zod";

export const contentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export const updateContentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
});

export type Content = z.infer<typeof contentSchema>;
export type CreateContent = z.infer<typeof createContentSchema>;
export type UpdateContent = z.infer<typeof updateContentSchema>;
