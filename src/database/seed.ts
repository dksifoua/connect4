import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { usersTable } from '@/database/schema'
import { DATABASE_URL } from "../../drizzle.config.ts"

const db = drizzle(DATABASE_URL);

async function main() {
    const user: typeof usersTable.$inferInsert = {
        username: "Dimitri",
        password: "password123",
    }

    await db.insert(usersTable).values(user)
}

main().then(() => console.log('Seed script completed successfully'))
