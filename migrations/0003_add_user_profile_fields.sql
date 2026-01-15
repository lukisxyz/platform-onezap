ALTER TABLE "user" ADD COLUMN "fullname" text;
ALTER TABLE "user" ADD COLUMN "username" text;
ALTER TABLE "user" ADD COLUMN "bio" text;
CREATE UNIQUE INDEX "user_username_unique_idx" ON "user" ("username");
