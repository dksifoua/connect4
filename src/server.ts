import type { ErrorLike, MaybePromise } from "bun"
import { container } from "@/lib/ioc/container.ts"
import AuthHandler from "@/handler/auth.handler.ts"
import driverDatabase from "@/database/driver.database.ts"

container.register("database", () => driverDatabase)

const authHandler = container.resolve(AuthHandler)

const server = Bun.serve({
    port: process.env.CONNECT4_LISTENING_PORT,
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
                return new Response(`Validation Error: ${error.message}`, { status: 400 })
            default:
                return new Response(`Error: ${error.message}`, { status: 500 })
        }
    }
});

console.log(`Listening on ${server.url}`);