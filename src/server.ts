import { type Server } from "bun"
import { AuthHandler } from "@/handler/auth.handler"
import { UserHandler } from "@/handler/user.handler"
import config from "@/config"
import { container } from "@/app"
import { Logging } from "@/lib/logging"
import { Game } from "@/lib/connect4/game"
import type { WebSocketServerData } from "@/websocket"
import { WebSocketHandler } from "@/handler/websocket.handler"
import { DefaultHandler } from "@/handler/default.handler"

const logging = new Logging("Server", "info")

const defaultHandler = container.resolve(DefaultHandler)
const authHandler = container.resolve(AuthHandler)
const userHandler = container.resolve(UserHandler)
const websocketHandler = container.resolve(WebSocketHandler)

const games: Map<number, Game> = new Map<number, Game>()

const server: Server<WebSocketServerData> = Bun.serve({
    port: config.server.port,
    routes: {
        "/": defaultHandler.home,
        "/version": defaultHandler.version,
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
    fetch: defaultHandler.fetch,
    error: defaultHandler.error,
    websocket: {
        data: {} as WebSocketServerData,
        open: websocketHandler.open,
        close: websocketHandler.close,
        message: websocketHandler.message
    }
})

logging.info(`Server listening on ${server.url}`)