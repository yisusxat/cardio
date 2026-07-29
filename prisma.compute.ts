import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "cardio",
    framework: "custom",
    httpPort: 4000,
    build: {
      command: "prisma generate --schema=backend/prisma/schema.prisma && npm run build -w backend && npm run build -w frontend && node -e \"const{cpSync}=require('fs');cpSync('frontend/dist','backend/dist/frontend/dist',{recursive:true})\"",
      outputDirectory: "backend/dist",
      entrypoint: "server.js",
    },
  },
});
