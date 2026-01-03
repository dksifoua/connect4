import { pgTable } from "drizzle-orm/pg-core"

export const usersTable = pgTable("users", (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    username: t.varchar({ length: 255 }).notNull().unique(),
    password: t.varchar({ length: 255 }).notNull(),
}))
