import { Container } from "@/lib/ioc/container"
import { JsonWebToken } from "@/lib/jwt"
import { AuthenticationMiddleware } from "./middleware/authentication.middleware"
import config from "@/config"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { RedisClient } from "bun"
import type { NodePgDatabase } from "drizzle-orm/node-postgres/driver"
import { Logging } from "@/lib/logging"

export const container = new Container()

container.register(JsonWebToken, () => new JsonWebToken(config.jwt.config))
container.register(AuthenticationMiddleware, AuthenticationMiddleware)
container.register("secret", () => config.jwt.secret)
container.register("database", () => {
    const { host, port, name, user, password } = config.database
    const pool = new Pool({ host, port, database: name, user, password })
    return drizzle({ client: pool })
})
container.register(RedisClient, () => {
    const { host, port, password } = config.cache
    const redisClient = new RedisClient(`redis://default:${password}@${host}:${port}`)
    redisClient.connect().then()
    return redisClient
})

const logging = new Logging("App", "info")

async function shutdown(): Promise<void> {
    logging.info("Shutting down gracefully...")

    const database = container.resolve("database") as NodePgDatabase & { $client: Pool }
    await database.$client.end()
    logging.info("Closing database connection...")

    const redis = container.resolve(RedisClient)
    redis.close()
    logging.info("Closing Redis connection...")

    container.dispose()
    logging.info("Cleaning up IoC container...")

    logging.info("Done.")
    process.exit(0)
}

process.on("SIGINT", shutdown)