import type { GameUpdate, Marker, Nullable, Observer } from "@/lib/connect4/types"
import { Board } from "@/lib/connect4/board"

export class Player implements Observer<GameUpdate> {

    private readonly name: string
    private marker: Nullable<Marker>
    private board: Nullable<Board>
    private isTurn: boolean

    public constructor(name: string) {
        this.name = name
        this.marker = null
        this.board = null
        this.isTurn = false
    }

    public makeMove(column: number): boolean {
        if (this.board === null) {
            throw new Error("Player has no board to make a move on.")
        }
        if (!this.isTurn) {
            return false
        }
        return this.board.apply({ col: column, marker: this.marker! })
    }

    public update(data: GameUpdate): void {
        const { board, turn } = data
        this.board = board
        this.isTurn = turn === this.name
    }

    public getMarker(): Marker {
        if (this.marker === null) {
            throw new Error("Player has no marker assigned yet.")
        }
        return this.marker
    }

    public setMarker(marker: Marker): void {
        this.marker = marker
    }

    public getName(): string {
        return this.name
    }

    public getBoard(): Nullable<Board> {
        return this.board
    }

    public getIsTurn(): boolean {
        return this.isTurn
    }

    public setIsTurn(isTurn: boolean): void {
        this.isTurn = isTurn
    }
}