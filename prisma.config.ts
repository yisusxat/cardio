import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind: "single",
    filePath: "backend/prisma/schema.prisma",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres",
  },
});
