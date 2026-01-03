import type { Marker, Nullable, Observer } from "@/lib/connect4/type"
import type { Board } from "@/lib/connect4/board"

export class Player implements Observer<Board> {

    private readonly name: string
    private marker: Nullable<Marker>
    private board: Nullable<Board>

    public constructor(name: string) {
        this.name = name
        this.marker = null
        this.board = null
    }

    public update(subject: Board): void {
        this.board = subject
    }

    public setMarker(marker: Marker): void {
        this.marker = marker
    }
}