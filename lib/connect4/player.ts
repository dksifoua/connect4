import type { Marker, Nullable, Observable, Observer } from "@/lib/connect4/types"
import { Board } from "@/lib/connect4/board"

export class Player implements Observer {

    private readonly name: string
    private readonly marker: Marker
    private board: Nullable<Board>

    public constructor(name: string) {
        this.name = name
        this.marker = Math.random() > 0.5 ? "red" : "yellow"
        this.board = null
    }

    public update(subject: Observable): void {
        if (subject instanceof Board) {
            this.board = subject
        }
    }

    public getName(): string {
        return this.name
    }

    public getBoard(): Nullable<Board> {
        return this.board
    }
}