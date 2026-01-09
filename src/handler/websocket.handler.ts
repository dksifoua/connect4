import { Injectable } from "@/lib/ioc/dependency"
import type { ServerWebSocket } from "bun"
import {
    type ChatMessagePayload,
    type JoinMessagePayload,
    type Message,
    MessageSchema,
    type MoveMessagePayload,
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

    private sentGameUpdateMessage(game: Game): void {
        const players = game.getPlayers().values().toArray()

        const winResult = game.getWinResult()
        let winner: string
        if (winResult) {
            winner = players.find(p => p.getMarker() === winResult.winner)!.getName()
        }

        players.forEach(player => {
            const marker = game.getPlayers().get(player.getName())!.getMarker()[0]!.toUpperCase()
            const session = this.sessions.get(player.getName())!
            // TODO
            //  What happens when the session is undefined

            session.send(JSON.stringify({
                type: "update",
                payload: {
                    id: game.getId(),
                    grid: game.getBoard().getGrid(),
                    player: player.getName(),
                    marker: marker,
                    isTurn: player.getIsTurn(),
                    opponent: game.getOpponent(player).getName(),
                    status: game.getStatus(),
                    win: winner !== undefined && winner == player.getName(),
                    lose: winner !== undefined && winner != player.getName(),
                    draw: winner === undefined && game.getStatus() === "finished"
                } as UpdateMessagePayload
            } as Message))
        })
    }

    public async open(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        const { username } = ws.data
        this.logging.info(`WebSocket connection opened for the user: ${username}.`)

        this.sessions.set(username, ws)

        this.sendChatMessage(ws, `Welcome, ${username}.`)
    }

    public async close(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        const { username } = ws.data
        this.sessions.delete(username)
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
            case "move":
                await this.makeMove(ws, parsedMessage.payload)
                break
            default:
                this.sendChatMessage(ws, `Invalid message type: ${parsedMessage.type}. Please use 'new' or 'join'.`)
        }
    }

    private async newGame(ws: ServerWebSocket<WebSocketServerData>): Promise<void> {
        const { username } = ws.data

        const game = new Game(Math.max(0, ...this.games.keys()) + 1)
        game.join(new Player(username))

        this.games.set(game.getId(), game)
        this.logging.info(`${username} created new game #${game.getId()}`)

        const marker = game.getPlayers().get(username)!.getMarker()[0]!.toUpperCase()
        this.sendChatMessage(ws, `New game #${game.getId()} - [${marker}] created successfully. Now waiting for an opponent to start the game.`)
    }

    private async joinGame(ws: ServerWebSocket<WebSocketServerData>, payload: JoinMessagePayload): Promise<void> {
        const { username } = ws.data
        if (await this.isPlayerInAnyGame(username)) {
            this.sendChatMessage(ws, "You are already in a game. Please finish or leave the current game before joining another one.")
            return
        }

        const { id } = payload

        const game = this.games.get(id)
        if (!game) {
            this.sendChatMessage(ws, `Game #${id} not found. Please try again with a valid game ID.`)
            return
        }

        const { error } = game.join(new Player(username))
        if (error) {
            this.sendChatMessage(ws, `${error}`)
            return
        }
        this.logging.info(`${username} joined game #${id}`)

        if (game.getStatus() === "ready") {
            this.sentGameUpdateMessage(game)
            game.setStatus("playing")
        } else {
            const marker = game.getPlayers().get(username)!.getMarker()[0]!.toUpperCase()
            this.sendChatMessage(ws, `Joined game #${id} - [${marker}].`)
        }
    }

    private async makeMove(ws: ServerWebSocket<WebSocketServerData>, payload: MoveMessagePayload): Promise<void> {
        const { username } = ws.data

        const { id, col } = payload
        const game = this.games.get(id)
        if (!game) {
            this.sendChatMessage(ws, `Game #${id} not found. Please try again with a valid game ID.`)
            return
        }

        const { error } = game.makeMove(col, username)
        if (error) {
            this.sendChatMessage(ws, `${error}`)
            return
        }

        this.sentGameUpdateMessage(game)

        if (game.getStatus() === "finished") {
            // TODO
            //  Save the game
            this.games.delete(id)
            return
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