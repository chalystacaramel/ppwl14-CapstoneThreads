// apps/backend/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const isProd =
  process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL ?? "").startsWith("postgresql");

export default defineConfig({
  schema: isProd ? "prisma/schema-pg.prisma" : "prisma/schema.prisma",
  migrations: {
    path: isProd ? "prisma/migrations-pg" : "prisma/migrations",
    seed: "bun ./prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});