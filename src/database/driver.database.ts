import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import config from "@/config"

const { host, port, name, user, password } = config.database
const pool = new Pool({ host, port, database: name, user, password })

export default drizzle({ client: pool })