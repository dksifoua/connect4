import type { Cell, Marker } from "@/lib/connect4/type"

export class Board {

    private readonly n_rows: number
    private readonly n_cols: number
    private readonly gridCells: Cell[][]
    private readonly emptyRowIndexes: number[]

    public constructor(n_rows: number, n_cols: number) {
        this.n_rows = n_rows
        this.n_cols = n_cols

        this.gridCells = Array.from({ length: n_cols }, (): Cell[] => Array<Cell>(n_rows).fill("-"))
        this.emptyRowIndexes = Array(n_cols).fill(n_rows - 1)
    }

    public toString(): string {
        return this.gridCells.map(row => row.join(" ")).join("\n")
    }
    
    public fromString(input: string): Board {
        const columns = input.split("\n")

        if (columns.length !== this.n_cols) {
            throw new Error(`Invalid board format: expected ${this.n_cols} columns, got ${columns.length}`)
        }

        for (let col = 0; col < this.n_cols; col++) {
            const cells = columns[col]!.split(" ") as Cell[]
            if (cells.length !== this.n_rows) {
                throw new Error(`Invalid board format: expected ${this.n_rows} rows in column ${col}, got ${cells.length}`)
            }
            this.gridCells[col] = cells
        }

        // Recalculate emptyRowIndexes
        for (let col = 0; col < this.n_cols; col++) {
            for (let row = this.n_rows - 1; row >= 0; row--) {
                if (this.gridCells[col]![row] === "-") {
                    this.emptyRowIndexes[col] = row
                    break
                }
            }
        }

        return this
    }

    public isFull(column?: number): boolean {
        if (column === undefined) {
            for (let col = 0; col < this.n_cols; col++) {
                if (!this.isFull(col)) {
                    return false
                }
            }

            return true
        }

        return !this.gridCells[column]!.some(cell => cell === "-")
    }

    public fill(column: number, marker: Marker): boolean {
        if (column < 0 || column >= this.n_cols) {
            throw new Error("Invalid move: column out of bounds!")
        }

        if (this.isFull(column)) {
            return false
        }

        const index = this.emptyRowIndexes[column]!
        this.gridCells[column]![index] = marker
        this.emptyRowIndexes[column]! -= 1

        return true
    }

    public checkWin(marker: Marker): boolean {
        return this.checkHorizontalWin(marker)
            || this.checkVerticalWin(marker)
            || this.checkDiagonalWin(marker)
    }

    private checkHorizontalWin(marker: Marker): boolean {
        for (let col = 0; col < this.n_cols; col++) {
            for (let row = this.n_rows - 1; row >= 3; row--) {
                if (
                    marker === this.gridCells[col]![row]
                    && marker === this.gridCells[col]![row - 1]
                    && marker === this.gridCells[col]![row - 2]
                    && marker === this.gridCells[col]![row - 3]
                ) {
                    return true
                }
            }
        }
        return false
    }

    private checkVerticalWin(marker: Marker): boolean {
        for (let row = 0; row < this.n_rows; row++) {
            for (let col = 0; col <= this.n_cols - 4; col++) {
                if (
                    marker === this.gridCells[col]![row]
                    && marker === this.gridCells[col + 1]![row]
                    && marker === this.gridCells[col + 2]![row]
                    && marker === this.gridCells[col + 3]![row]
                ) {
                    return true
                }
            }
        }

        return false
    }

    private checkDiagonalWin(marker: Marker): boolean {
        return this.checkAscendingDiagonalWin(marker) || this.checkDescendingDiagonalWin(marker)
    }

    private checkAscendingDiagonalWin(marker: Marker): boolean {
        for (let col = 0; col <= this.n_cols - 4; col++) {
            for (let row = this.n_rows - 1; row >= 3; row--) {
                if (
                    marker === this.gridCells[col]![row]
                    && marker === this.gridCells[col + 1]![row - 1]
                    && marker === this.gridCells[col + 2]![row - 2]
                    && marker === this.gridCells[col + 3]![row - 3]
                ) {
                    return true
                }
            }
        }

        return false
    }

    private checkDescendingDiagonalWin(marker: Marker): boolean {
        for (let col = 0; col <= this.n_cols - 4; col++) {
            for (let row = 0; row <= this.n_rows - 4; row++) {
                if (
                    marker === this.gridCells[col]![row]
                    && marker === this.gridCells[col + 1]![row + 1]
                    && marker === this.gridCells[col + 2]![row + 2]
                    && marker === this.gridCells[col + 3]![row + 3]
                ) {
                    return true
                }
            }
        }

        return false
    }
}