import type { GameStatus, Observable, Observer } from "@/lib/connect4/types"
import { Board } from "@/lib/connect4/board"
import type { Player } from "@/lib/connect4/player"

export class Game implements Observer {

    private readonly id: number
    private readonly board: Board
    private status: GameStatus
    private readonly players: Map<string, Player>

    public constructor(id: number, n_rows: number = 6, n_cols: number = 7) {
        this.id = id
        this.board = new Board(n_rows, n_cols)
        this.status = "waiting"
        this.players = new Map<string, Player>()
    }

    public join(player: Player): { error?: string } {
        if (this.players.has(player.getName())) {
            return { error: `Player ${player.getName()} already joined the game ${this.id}.` }
        }

        if (this.status !== "waiting") {
            return { error: `Game ${this.id} is full. Player ${player.getName()} cannot join.` }
        }

        this.players.set(player.getName(), player)
        if (this.players.size === 2) {
            this.status = "ready"
        }

        return {}
    }

    public getId(): number {
        return this.id
    }

    public getStatus(): GameStatus {
        return this.status
    }

    public getPlayers(): Map<string, Player> {
        return this.players
    }

    public update(subject: Observable): void {
        throw new Error("Method not implemented.");
    }
}