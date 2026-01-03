import { type BunRequest, type ErrorLike, type Server, type ServerWebSocket } from "bun"
import { AuthHandler } from "@/handler/auth.handler"
import { UserHandler } from "@/handler/user.handler"
import config from "@/config"
import packageJson from "../package.json"
import { container } from "@/app"
import { Logging } from "@/lib/logging"
import { extractAuthorizationHeader } from "@/utils/http"
import type { Nullable } from "@/utils/types"
import { JsonWebToken } from "@/lib/jwt"

const logging = new Logging("Server", "info")

const authHandler = container.resolve(AuthHandler)
const userHandler = container.resolve(UserHandler)

type WebSocketServerData = {
    username: string
}

const server: Server<WebSocketServerData> = Bun.serve({
    port: config.server.port,
    routes: {
        "/": async (): Promise<Response> => new Response("Hello from Connect4!"),
        "/version": async (): Promise<Response> => {
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
    async fetch(request: BunRequest): Promise<Response> {
        const url = new URL(request.url)
        if (url.pathname !== "/game") {
            return new Response("Resource not found!", { status: 404 })
        }

        const token: Nullable<string> = await extractAuthorizationHeader(request)
        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized: No token provided" }), { status: 401 })
        }

        const { username } = await container.resolve(JsonWebToken).verify(token, config.jwt.secret)
        const upgraded = server.upgrade(request, { data: { username } })
        if (!upgraded) {
            throw new Error("Failed to upgrade request to WebSocket")
        }

        return new Response("Upgrade the Request to a ServerWebSocket")
    },
    async error(error: ErrorLike): Promise<Response> {
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
                logging.error(error.name, error.message)
                return new Response(`Error: ${error.message}`, { status: 500 })
        }
    },
    websocket: {
        data: {} as WebSocketServerData,
        open: async (ws: ServerWebSocket<WebSocketServerData>): Promise<void> => {
            logging.info(`WebSocket connection opened for the user: ${ws.data.username}.`)
            ws.send(`Welcome, ${ws.data.username}!`)
        },
        close: async (ws: ServerWebSocket<WebSocketServerData>): Promise<void> => {
            logging.info(`WebSocket connection closed for the user: ${ws.data.username}.`)
        },
        message: async (ws: ServerWebSocket<WebSocketServerData>, message: string): Promise<void> => {
            logging.info(`Received message from ${ws.data.username}: ${message}`)
        }
    }
})

logging.info(`Server listening on ${server.url}`)