import { Injectable } from "@/lib/ioc/dependency"
import type { ServerWebSocket } from "bun"
import {
    type BoardGrid,
    type ChatMessagePayload,
    type JoinMessagePayload,
    type Message,
    MessageSchema,
    type UpdateMessagePayload,
    type WebSocketServerData
} from "@/websocket"
import { Player } from "@/lib/connect4/player"
import { Logging } from "@/lib/logging"
import { Game } from "@/lib/connect4/game"

@Injectable()
export class WebSocketHandler {

    private readonly logging: Logging
    private readonly games: Map<number, Game>
    private readonly sessions: Map<string, ServerWebSocket<WebSocketServerData>>
    private readonly serverName: string

    public constructor() {
        this.logging = new Logging("WebSocketHandler", "debug")
        this.games = new Map<number, Game>()
        this.sessions = new Map<string, ServerWebSocket<WebSocketServerData>>()
        this.serverName = "Server"

        this.open = this.open.bind(this)
        this.close = this.close.bind(this)
        this.message = this.message.bind(this)
    }

    private sendChatMessage(ws: ServerWebSocket<WebSocketServerData>, content: string, from: string = this.serverName): void {
        ws.send(JSON.stringify({
            type: "chat",
            payload: { from, content } as ChatMessagePayload
        } as Message))
    }

    private sendUpdateMessage(ws: ServerWebSocket<WebSocketServerData>, id: number, grid: BoardGrid, isTurn: boolean): void {
        ws.send(JSON.stringify({
            type: "update",
            payload: { id, grid, isTurn } as UpdateMessagePayload
        } as Message))
    }

    public async open(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        const { username } = ws.data
        this.logging.info(`WebSocket connection opened for the user: ${username}.`)

        ws.data.player = new Player(username)
        this.sessions.set(username, ws)

        this.sendChatMessage(ws, `Welcome, ${username}.`)
    }

    public async close(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        const { username } = ws.data
        this.logging.info(`WebSocket connection closed for the user: ${username}.`)
    }

    public async message(ws: ServerWebSocket<WebSocketServerData>, message: string): Promise<void> {
        const { username } = ws.data
        this.logging.debug(`Received message from ${username}: ${message}`)

        const parsedMessage: Message = MessageSchema.parse(JSON.parse(message))
        switch (parsedMessage.type) {
            case "new":
                await this.newGame(ws)
                break
            case "join":
                await this.joinGame(ws, parsedMessage.payload)
                break
            default:
                this.sendChatMessage(ws, `Invalid message type: ${parsedMessage.type}. Please use 'new' or 'join'.`)
        }
    }

    private async newGame(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        const { username, player } = ws.data
        const game = new Game(Math.max(0, ...this.games.keys()) + 1)
        game.join(player!)
        this.games.set(game.getId(), game)
        this.logging.info(`${username} created new game with ID: ${game.getId()}`)

        this.sendChatMessage(ws, `New game with ID ${game.getId()} created successfully. Now waiting for an opponent to start the game.`)
    }

    private async joinGame(ws: ServerWebSocket<WebSocketServerData>, payload: JoinMessagePayload): Promise<void> {
        const { username, player } = ws.data
        if (await this.isPlayerInAnyGame(player!.getName())) {
            this.sendChatMessage(ws, "You are already in a game. Please finish or leave the current game before joining another one.")
            return
        }

        const { id } = payload
        const game = this.games.get(id)
        if (!game) {
            this.sendChatMessage(ws, `Game with ID ${id} not found. Please try again with a valid game ID.`)
            return
        }
        const { error } = game.join(player!)
        if (error) {
            this.sendChatMessage(ws, `Error: ${error}`)
            return
        }
        this.logging.info(`${username} joined game with ID: ${id}`)

        if (game.getStatus() === "ready") {
            game.getPlayers().forEach(p => {
                const session = this.sessions.get(p.getName())!
                this.sendUpdateMessage(session, game.getId(), game.getBoard().getGrid(), p!.getIsTurn())
            })
        } else {
            this.sendChatMessage(ws, `Joined game with ID ${id}.`)
        }
    }

    private async isPlayerInAnyGame(name: string): Promise<boolean> {
        for (const [_, game] of this.games) {
            if (game.getPlayers().has(name)) {
                return true
            }
        }

        return false
    }
}