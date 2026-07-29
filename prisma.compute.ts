import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "cardio",
    framework: "custom",
    httpPort: 4000,
    build: {
      command: "npm run db:generate -w backend && npm run build -w backend && npm run build -w frontend",
      outputDirectory: "backend/dist",
      entrypoint: "server.js",
    },
  },
});
