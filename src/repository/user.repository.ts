import { usersTable } from "@/database/schema.database.ts"
import { eq } from "drizzle-orm"
import type { User } from "@/domain.ts"
import { Inject, Injectable } from "@/lib/ioc/dependency.ts"
import type { NodePgDatabase } from "drizzle-orm/node-postgres/driver"
import type { Pool } from "pg"
import driverDatabase from "@/database/driver.database.ts"
import type { Nullable } from "@/utils/types"

@Injectable()
export class UserRepository {

    private readonly database: NodePgDatabase & { $client: Pool }

    constructor(@Inject("database") database: NodePgDatabase & { $client: Pool }) {
        this.database = driverDatabase
    }

    public async exists(username: string): Promise<boolean> {
        const users: User[] = await this.database
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, username))
            .limit(1)

        return users.length == 1
    }

    public async save(username: string, password: string): Promise<{ userId: number }> {
        const rows = await this.database
            .insert(usersTable)
            .values({ username, password })
            .returning({ userId: usersTable.id })

        if (!rows[0]) {
            throw new Error("Failed to save user!");
        }

        return { userId: rows[0].userId }
    }

    public async findByUsername(username: string): Promise<Nullable<User>> {
        const users: User[] = await this.database
            .select()
            .from(usersTable)
            .where(eq(usersTable.username, username))
            .limit(1)

        if (!users[0]) {
            throw new Error("Failed to find user!");
        }

        return users.length === 0 ? null : users[0]
    }

    public async findAll(): Promise<User[]> {
        return this.database
            .select()
            .from(usersTable)
    }
}