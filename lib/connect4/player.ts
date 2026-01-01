import type { Marker, Observer } from "@/lib/connect4/type"
import type { Board } from "@/lib/connect4/board"

export class Player implements Observer<Board> {

    private readonly name: string
    private readonly marker: Marker
    private board: Board | null

    public constructor(name: string, marker: Marker) {
        this.name = name
        this.marker = marker

        this.board = null
    }

    public update(subject: Board): void {
        this.board = subject
    }
}