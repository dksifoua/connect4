import { usersTable } from "@/database/schema.database.ts"

export type User = typeof usersTable.$inferSelect