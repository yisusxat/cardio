import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "cardio",
    framework: "custom",
    httpPort: 4000,
    build: {
      command: "prisma generate --schema=backend/prisma/schema.prisma && npm run build -w backend && npm run build -w frontend && xcopy /E /I /Y node_modules\\.prisma backend\\dist\\node_modules\\.prisma",
      outputDirectory: "backend/dist",
      entrypoint: "server.js",
    },
  },
});
