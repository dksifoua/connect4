import type { GameStatus, Marker, Nullable, WinResult } from "@/lib/connect4/types"
import { Board } from "@/lib/connect4/board"
import { type Player } from "@/lib/connect4/player"

export class Game {

    private readonly id: number
    private readonly board: Board
    private status: GameStatus
    private readonly players: Map<string, Player>
    private winResult: Nullable<WinResult>

    public constructor(id: number, n_rows: number = 6, n_cols: number = 7) {
        this.id = id
        this.board = new Board(n_rows, n_cols)
        this.status = "waiting"
        this.players = new Map<string, Player>()
        this.winResult = null
    }

    public join(player: Player): { error?: string } {
        if (this.players.has(player.getName())) {
            return { error: `Player ${player.getName()} already joined the game ${this.id}.` }
        }

        if (this.status !== "waiting") {
            return { error: `Game ${this.id} is full. Player ${player.getName()} cannot join.` }
        }

        this.setMarker(player)
        this.players.set(player.getName(), player)

        if (this.players.size === 2) {
            this.status = "ready"
            this.setInitialTurn()
        }

        return {}
    }

    public makeMove(col: number, playerName: string): { error?: string } {
        if (this.status !== "playing") {
            return { error: `Game ${this.id} is not in playing state.` }
        }

        if (!this.players.has(playerName)) {
            return { error: `Player ${playerName} is not in the game #${this.id}.` }
        }

        const player = this.players.get(playerName)
        if (!player) {
            return { error: `Player ${playerName} not found in game #${this.id}.` }
        }

        if (!player.getIsTurn()) {
            return { error: `It's not your turn. Please wait for your turn to make a move.` }
        }

        const { error } = this.board.apply({ col, marker: player.getMarker() })
        if (error) {
            return { error }
        }

        this.winResult = this.board.checkWin()
        if (this.winResult || this.board.isFull()) {
            this.status = "finished"
            return {}
        }

        this.players.forEach(player => player.setIsTurn(!player.getIsTurn()))

        return {}
    }

    private setMarker(player: Player): void {
        let marker: Marker
        if (this.players.size === 0) {
            marker = Math.random() > 0.5 ? "red" : "yellow"
        } else {
            marker = this.players.values().toArray()[0]!.getMarker() === "red" ? "yellow" : "red"
        }
        console.log({ marker })

        player.setMarker(marker)
    }

    private setInitialTurn(): void {
        if (this.players.size !== 2) return

        const playerNames = this.players.keys().toArray()

        const flipCoin = Math.random() > 0.5
        const firstPlayerName = flipCoin ? playerNames[0]! : playerNames[1]!
        const secondPlayerName = flipCoin ? playerNames[1]! : playerNames[0]!

        this.players.get(firstPlayerName)!.setIsTurn(true)
        this.players.get(secondPlayerName)!.setIsTurn(false)
    }

    public getOpponent(player: Player): Player {
        return Array.from(this.players.values()).find(p => p !== player)!
    }

    public getId(): number {
        return this.id
    }

    public getStatus(): GameStatus {
        return this.status
    }

    public setStatus(status: GameStatus): void {
        this.status = status
    }

    public getPlayers(): Map<string, Player> {
        return this.players
    }

    public getBoard(): Board {
        return this.board
    }

    public getWinResult(): Nullable<WinResult> {
        return this.winResult
    }
}