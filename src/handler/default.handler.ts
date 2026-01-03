import { Injectable } from "@/lib/ioc/dependency"
import packageJson from "../../package.json"
import type { BunRequest, ErrorLike, Server } from "bun"
import type { Nullable } from "@/utils/types"
import { extractAuthorizationHeader } from "@/utils/http"
import { container } from "@/app"
import { JsonWebToken } from "@/lib/jwt"
import config from "@/config"
import type { WebSocketServerData } from "@/websocket"
import { Logging } from "@/lib/logging"

@Injectable()
export class DefaultHandler {

    private readonly logging: Logging

    public constructor() {
        this.logging = new Logging("DefaultHandler", "info")
    }

    public async home(): Promise<Response> {
        return new Response("Hello from Connect4!")
    }

    public async version(): Promise<Response> {
        const { name, description, version, author, license } = packageJson
        return new Response(JSON.stringify({ name, description, version, author, license }), { status: 200 })
    }

    public async fetch(request: BunRequest, server: Server<WebSocketServerData>): Promise<Response> {
        const url = new URL(request.url)
        if (url.pathname !== "/game") {
            return new Response("Resource not found!", { status: 404 })
        }

        const token: Nullable<string> = await extractAuthorizationHeader(request)
        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized: No token provided" }), { status: 401 })
        }

        const { username } = await container.resolve(JsonWebToken).verify(token, config.jwt.secret)
        const upgraded = server.upgrade(request, { data: { username, player: null } })
        if (!upgraded) {
            throw new Error("Failed to upgrade request to WebSocket")
        }

        return new Response("Upgrade the Request to a ServerWebSocket")
    }

    public async error(error: ErrorLike): Promise<Response> {
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
                this.logging.error(error.name, error.message)
                return new Response(`Error: ${error.message}`, { status: 500 })
        }
    }
}