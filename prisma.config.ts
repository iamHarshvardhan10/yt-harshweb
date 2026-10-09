import "dotenv/config"
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // Optional so `prisma generate` works in builds (e.g. Vercel) without DIRECT_URL;
    // migrate/db commands still need it set.
    url: process.env.DIRECT_URL ?? "",
  },
});