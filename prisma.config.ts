import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: {
    kind: "single",
    filePath: "backend/prisma/schema.prisma",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
