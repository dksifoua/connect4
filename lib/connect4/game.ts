import { Board } from "@/lib/connect4/board"
import { type Player } from "@/lib/connect4/player"
import type { Observable, Observer } from "@/lib/connect4/type"

export class Game implements Observable<Board> {

    private readonly player1: Player
    private readonly player2: Player

    private readonly board: Board
    private currentPlayer: Player
    private readonly observers: Set<Observer<Board>>

    public constructor(player1: Player, player2: Player) {
        this.player1 = player1
        this.player2 = player2

        this.board = new Board(6, 7)
        this.currentPlayer = player1
        this.observers = new Set<Observer<Board>>()
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