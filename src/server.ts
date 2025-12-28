import type { ErrorLike, MaybePromise } from "bun"
import { container } from "@/lib/ioc/container"
import AuthHandler from "@/handler/auth.handler"
import driverDatabase from "@/database/driver.database"
import config from "@/config"

container.register("jwtConfig", () => config.jwt)
container.register("database", () => driverDatabase)

const authHandler = container.resolve(AuthHandler)

const server = Bun.serve({
    port: config.server.port,
    routes: {
        "/": () => new Response('Bun!'),
        "/login": {
            POST: authHandler.login
        },
        "/register": {
            POST: authHandler.register
        },
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
            default:
                return new Response(`Error: ${error.message}`, { status: 500 })
        }
    }
});

console.log(`Listening on ${server.url}`);