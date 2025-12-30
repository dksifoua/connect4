import { type ErrorLike, type MaybePromise } from "bun"
import { AuthHandler } from "@/handler/auth.handler"
import { UserHandler } from "@/handler/user.handler"
import config from "@/config"
import packageJson from "../package.json"
import { container } from "@/app"

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

console.log(`Sever listening on ${server.url}`)