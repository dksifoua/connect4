import { defineConfig } from "drizzle-kit"

const host = process.env.CONNECT4_DATABASE_HOST!
const port = process.env.CONNECT4_DATABASE_PORT!
const user = process.env.CONNECT4_DATABASE_USER!
const password = process.env.CONNECT4_DATABASE_PASSWORD!
const database = process.env.CONNECT4_DATABASE_NAME!

export default defineConfig({
    out: './drizzle',
    schema: './src/database/schema.database.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: `postgresql://${user}:${password}@${host}:${port}/${database}`,
    },
});

