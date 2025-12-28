import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { container } from "@/lib/ioc/container.ts"

const host = process.env.CONNECT4_POSTGRES_HOST!
const port = parseInt(process.env.CONNECT4_POSTGRES_PORT!)
const database = process.env.CONNECT4_POSTGRES_DATABASE!
const user = process.env.CONNECT4_POSTGRES_USER!
const password = process.env.CONNECT4_POSTGRES_PASSWORD!

const pool = new Pool({ host, port, database, user, password })

export default drizzle({ client: pool })