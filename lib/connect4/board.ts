import type { Cell, Move, Nullable, Observable, Observer, Position, WinResult } from "@/lib/connect4/types"


export class Board implements Observable {

    private readonly n_cols: number
    private readonly n_rows: number
    private readonly cells: Cell[][]
    private readonly emptyRowIndexes: number[]
    private readonly moves: Move[]
    private readonly observers: Set<Observer>

    public constructor(n_rows: number, n_cols: number) {
        this.n_rows = n_rows
        this.n_cols = n_cols
        this.cells = Array.from({ length: n_cols }, (): Cell[] => Array<Cell>(n_rows).fill(null))
        this.emptyRowIndexes = Array.from({ length: n_cols }, (): number => n_rows - 1)
        this.moves = []
        this.observers = new Set<Observer>()
    }

    public isFull(column?: number): boolean {
        if (column === undefined) {
            return this.emptyRowIndexes.every(index => index < 0)
        }

        if (column < 0 || column >= this.n_cols) {
            throw new Error(`Invalid column index: ${column}`)
        }

        return this.emptyRowIndexes[column]! < 0

    }

    public apply(move: Move): boolean {
        const { col, marker } = move
        if (this.isFull(col)) {
            return false
        }

        const row = this.emptyRowIndexes[col]!
        this.cells[col]![row] = marker
        this.emptyRowIndexes[col]! -= 1

        this.moves.push({ ...move, row })

        this.notify()

        return true
    }

    public checkWin(): Nullable<WinResult> {
        const movesLength = this.moves.length
        if (movesLength === 0) {
            return null
        }

        const { col, row, marker } = this.moves[movesLength - 1]! // Last move
        const deltas = [
            { dY: 1, dX: 0 }, // Horizontal
            { dY: 0, dX: 1 }, // Vertical
            { dY: 1, dX: 1 }, // Ascending Diagonal
            { dY: 1, dX: -1 } // Descending Diagonal
        ]
        for (let delta of deltas) {
            const contiguousCells = this.getContiguousCells({ col, row: row! }, delta)
            if (contiguousCells.length >= 4) {
                return { winner: marker, line: contiguousCells }
            }
        }

        return null
    }

    private getContiguousCells(position: Position, delta: { dY: number, dX: number }): Position[] {
        const positions: Position[] = [position]

        const { col, row } = position
        const marker = this.cells[col]![row]!

        const { dY, dX } = delta

        for (let i = 1; i < 4; i++) {
            const nextPosition = { col: col + i * dY, row: row + i * dX }
            if (this.isValidPosition(nextPosition) && this.cells[nextPosition.col]![nextPosition.row] === marker) {
                positions.push(nextPosition)
            } else {
                break
            }
        }

        for (let i = 1; i < 4; i++) {
            const prevPosition = { col: col - i * dY, row: row - i * dX } // Backward: <- Right to Left
            if (this.isValidPosition(prevPosition) && this.cells[prevPosition.col]![prevPosition.row] === marker) {
                positions.push(prevPosition)
            } else {
                break
            }
        }

        return positions
    }

    private isValidPosition(position: Position): boolean {
        const { col, row } = position
        return col >= 0 && col < this.n_cols && row >= 0 && row < this.n_rows
    }

    public attach(observer: Observer): void {
        this.observers.add(observer)
    }

    public detach(observer: Observer): void {
        this.observers.delete(observer)
    }

    public notify(): void {
        this.observers.forEach(observer => observer.update(this))
    }
}