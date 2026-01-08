import type { GameStatus, GameUpdate, Marker, Nullable, Observable, Observer } from "@/lib/connect4/types"
import { Board } from "@/lib/connect4/board"
import { type Player } from "@/lib/connect4/player"

export class Game implements Observable<GameUpdate> {

    private readonly id: number
    private readonly board: Board
    private status: GameStatus
    private readonly players: Map<string, Player>
    private currentPlayerName: Nullable<string>
    private readonly observers: Set<Observer<GameUpdate>>

    private readonly markers: Set<Marker>

    public constructor(id: number, n_rows: number = 6, n_cols: number = 7) {
        this.id = id
        this.board = new Board(n_rows, n_cols)
        this.status = "waiting"
        this.players = new Map<string, Player>()
        this.currentPlayerName = null
        this.observers = new Set<Observer<GameUpdate>>()

        this.markers = new Set<Marker>(["red", "yellow"])
    }

    public join(player: Player): { error?: string } {
        if (this.players.has(player.getName())) {
            return { error: `Player ${player.getName()} already joined the game ${this.id}.` }
        }

        if (this.status !== "waiting") {
            return { error: `Game ${this.id} is full. Player ${player.getName()} cannot join.` }
        }

        const marker = Math.random() > 0.5 ? "red" : "yellow"
        player.setMarker(marker)

        this.markers.delete(marker)

        this.players.set(player.getName(), player)
        this.attach(player)

        if (this.players.size === 2) {
            this.status = "ready"
            this.currentPlayerName = Math.random() > 0.5
                ? this.players.values().filter(player => player.getMarker() === "red").next().value!.getName()
                : this.players.values().filter(player => player.getMarker() === "yellow").next().value!.getName()
            this.notify({
                id: this.id,
                board: this.board,
                turn: this.currentPlayerName
            })
        }

        return {}
    }

    public attach(observer: Observer<GameUpdate>): void {
        this.observers.add(observer)
    }

    public detach(observer: Observer<GameUpdate>): void {
        this.observers.delete(observer)
    }

    public notify(data: GameUpdate): void {
        this.observers.forEach(observer => observer.update(data))
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

    public getBoard(): Board {
        return this.board
    }
}