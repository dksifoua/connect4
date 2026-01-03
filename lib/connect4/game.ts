import { Board } from "@/lib/connect4/board"
import { type Player } from "@/lib/connect4/player"
import type { GameStatus, Nullable, Observable, Observer } from "@/lib/connect4/type"

export class Game implements Observable<Board> {

    private readonly id: number
    private readonly board: Board
    private readonly players: Map<string, Player>
    private currentPlayer: Nullable<Player>
    private readonly observers: Set<Observer<Board>>

    public status: GameStatus

    public constructor(id: number) {
        this.id = id
        this.board = new Board(6, 7)
        this.players = new Map<string, Player>()
        this.currentPlayer = null
        this.observers = new Set<Observer<Board>>()

        this.status = "waiting"
    }

    public join(player: Player): { error: Nullable<string> } {
        if (this.players.has(player.getName())) {
            return { error: `Player with name ${player.getName()} is already in the game.` }
        }
        if (this.status !== "waiting") {
            return { error: `Game ${this.id} is full.` }
        }

        this.players.set(player.getName(), player)
        this.attach(player)

        if (this.players.size === 2) {
            this.status = "ready"

            const markerColorDecision: boolean = Math.random() < 0.5
            for (const [_, player] of this.players) {
                player.setMarker(markerColorDecision ? "red" : "yellow")
            }

            this.notify()
        }

        return { error: null }
    }

    public attach(observer: Observer<Board>): void {
        this.observers.add(observer)
    }

    public detach(observer: Observer<Board>): void {
        this.observers.delete(observer)
    }

    public notify(): void {
        this.observers.forEach(observer => observer.update(this.board))
    }

    public getId(): number {
        return this.id
    }

    public getPlayers(): Map<string, Player> {
        return this.players
    }
}