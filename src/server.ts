import { type ErrorLike, type MaybePromise, RedisClient } from "bun"
import { container } from "@/lib/ioc/container"
import { AuthHandler } from "@/handler/auth.handler"
import { UserHandler } from "@/handler/user.handler"
import { JsonWebToken } from "@/lib/jwt"
import { AuthenticationMiddleware } from "@/middleware/authentication.middleware"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import config from "@/config"
import packageJson from "../package.json"
import type { NodePgDatabase } from "drizzle-orm/node-postgres/driver"

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

container.resolve(AuthenticationMiddleware)
const authHandler = container.resolve(AuthHandler)
const userHandler = container.resolve(UserHandler)

const server = Bun.serve({
    port: config.server.port,
    routes: {
        "/": () => new Response("Hello from Connect4!"),
        "/version": () => {
            const { name, description, version, author, license } = packageJson
            return new Response(JSON.stringify({ name, description, version, author, license }), { status: 200 })
        },
        "/login": {
            POST: authHandler.login
        },
        "/register": {
            POST: authHandler.register
        },
        "/users": {
            GET: userHandler.getAll
        }
    },
    fetch(): MaybePromise<Response> {
        return new Response("Not Found", { status: 404 })
    },
    error(error: ErrorLike): MaybePromise<Response> {
        switch (error.name) {
            case "ZodError":
            case "UserAlreadyExistsError":
            case "UserNotFoundError":
            case "UserCredentialsError":
                return new Response(`Validation Error: ${error.message}`, { status: 400 })
            case "UserAlreadyConnectedError":
                return new Response(`Forbidden Error: ${error.message}`, { status: 403 })
            case "JWTExpired":
            case "JWSSignatureVerificationFailed":
                return new Response(`${error.name}: ${error.message}`, { status: 401 })
            default:
                console.error(error.name, error.message)
                return new Response(`Error: ${error.message}`, { status: 500 })
        }
    }
})

console.log(`Listening on ${server.url}`)

process.on("SIGINT", async (): Promise<void> => {
    console.log("\nReceived SIGINT, shutting down gracefully...")

    const database = container.resolve("database") as NodePgDatabase & { $client: Pool }
    await database.$client.end()
    console.log("Closing database connection...")

    const redis = container.resolve(RedisClient)
    redis.close()
    console.log("Closing Redis connection...")

    container.dispose()
    console.log("Cleaning up IoC container...")

    console.log("Done.")
    process.exit(0)
})