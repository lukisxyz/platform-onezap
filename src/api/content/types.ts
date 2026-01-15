import { z } from "zod";

export const contentSchema = z.object({
  id: z.string(),
  title: z.string(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  isPremium: z.boolean().default(false),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  isPremium: z.boolean().default(false),
});

export const updateContentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  isPremium: z.boolean().optional(),
});

export type Content = z.infer<typeof contentSchema>;
export type CreateContent = z.infer<typeof createContentSchema>;
export type UpdateContent = z.infer<typeof updateContentSchema>;
