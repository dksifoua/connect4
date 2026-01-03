import { Board } from "@/lib/connect4/board"
import { type Player } from "@/lib/connect4/player"
import type { GameStatus, Nullable, Observable, Observer } from "@/lib/connect4/type"

export class Game implements Observable<Board> {

    private readonly id: number
    private readonly board: Board
    private readonly players: Player[]
    private currentPlayer: Nullable<Player>
    private readonly observers: Set<Observer<Board>>

    public status: GameStatus

    public constructor(id: number) {
        this.id = id
        this.board = new Board(6, 7)
        this.players = []
        this.currentPlayer = null
        this.observers = new Set<Observer<Board>>()

        this.status = "waiting"
    }

    public getId(): number {
        return this.id
    }

    public join(player: Player): void {
        if (this.status !== "waiting") {
            throw new Error(`Game ${this.id} is full.`)
        }

        this.players.push(player)
        this.attach(player)

        if (this.players.length === 2) {
            this.status = "ready"

            this.players[0]!.setMarker("red")
            this.players[1]!.setMarker("yellow")

            this.notify()
        }
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
}