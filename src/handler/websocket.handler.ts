import { Injectable } from "@/lib/ioc/dependency"
import type { ServerWebSocket } from "bun"
import type { WebSocketServerData } from "@/websocket"
import { Player } from "@/lib/connect4/player"
import { Logging } from "@/lib/logging"

@Injectable()
export class WebSocketHandler {

    private readonly logging: Logging

    public constructor() {
        this.logging = new Logging("WebSocketHandler", "info")
    }

    public async open(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        const { username } = ws.data
        this.logging.info(`WebSocket connection opened for the user: ${username}.`)

        ws.data.player = new Player(username)

        ws.send(`Welcome, ${username}.`)
    }

    public async close(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        this.logging.info(`WebSocket connection closed for the user: ${ws.data.username}.`)
    }

    public async message(ws: ServerWebSocket<WebSocketServerData>, message: string): Promise<void> {
        this.logging.debug(`Received message from ${ws.data.username}: ${message}`)
    }
}