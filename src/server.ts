import type { ErrorLike, MaybePromise } from "bun"
import { container } from "@/lib/ioc/container"
import { AuthHandler } from "@/handler/auth.handler"
import driverDatabase from "@/database/driver.database"
import config from "@/config"
import { UserHandler } from "@/handler/user.handler"
import { JsonWebToken } from "@/lib/jwt"
import { AuthenticationMiddleware } from "@/middleware/authentication.middleware"

container.register(JsonWebToken, () => new JsonWebToken(config.jwt.config))
container.register(AuthenticationMiddleware, AuthenticationMiddleware)
container.register("secret", () => config.jwt.secret)
container.register("database", () => driverDatabase)

container.resolve(AuthenticationMiddleware)
const authHandler = container.resolve(AuthHandler)
const userHandler = container.resolve(UserHandler)

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
});

console.log(`Listening on ${server.url}`);