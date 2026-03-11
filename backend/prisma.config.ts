import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    // 1. Point to where your schema file lives
    schema: "prisma/schema.prisma",

    // 2. Define your database connection dynamically
    datasource: {
        url: env("DATABASE_URL"),
    },

    // 3. (Optional) Define where your migrations folder is
    migrations: {
        path: "prisma/migrations",
    },
});