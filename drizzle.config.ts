import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const host = process.env.CONNECT4_POSTGRES_HOST!
const port = process.env.CONNECT4_POSTGRES_PORT!
const database = process.env.CONNECT4_POSTGRES_DATABASE!
const user = process.env.CONNECT4_POSTGRES_USER!
const password = process.env.CONNECT4_POSTGRES_PASSWORD!

export const DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}`

export default defineConfig({
    out: './drizzle',
    schema: './src/database/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: DATABASE_URL,
    },
});

