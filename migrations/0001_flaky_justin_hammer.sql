ALTER TABLE "content" ADD COLUMN "excerpt" text;--> statement-breakpoint
ALTER TABLE "content" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "content" DROP COLUMN "description";