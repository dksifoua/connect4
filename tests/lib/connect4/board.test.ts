import { beforeEach, describe, expect, test } from "bun:test"
import { Board } from "@/lib/connect4/board"
import type { Marker } from "@/lib/connect4/type"

describe("Board", () => {
    let n_rows: number
    let n_cols: number
    let board: Board

    beforeEach(() => {
        [n_rows, n_cols] = [6, 7]
        board = new Board(n_rows, n_cols)
    })

    test("fill(): should place marker in the correct cell and update emptyRowIndexes", () => {
        let marker: Marker = "red"

        const result = board.fill(3, marker)
        expect(result).toBe(true)

        const gridCells = (board as any).gridCells
        const emptyRowIndexes = (board as any).emptyRowIndexes

        // Check marker is placed at bottom row (index 5)
        expect(gridCells[3][5]).toBe(marker)

        // Check emptyRowIndexes is updated
        expect(emptyRowIndexes[3]).toBe(4)

        // Fill the same column again
        marker = "red"
        board.fill(3, marker)
        expect(gridCells[3][4]).toBe(marker)
        expect(emptyRowIndexes[3]).toBe(3)
    })

    test("isFull(col): should correctly identify a full column", () => {
        expect(board.isFull(0)).toBe(false)

        const marker: Marker = "red"

        // Fill column 0 completely
        for (let row = 0; row < n_rows; row++) {
            board.fill(0, marker)
        }
        expect(board.isFull(0)).toBe(true)

        // Other columns should not be full
        for (let col = 1; col < n_cols; col++) {
            expect(board.isFull(col)).toBe(false)
        }

        // Trying to fill a full column should return false
        const result = board.fill(0, marker)
        expect(result).toBe(false)
    })

    test("isFull(): should correctly identify a full board", () => {
        // Initially board is not full
        expect(board.isFull()).toBe(false)

        // Fill all columns
        for (let col = 0; col < n_cols; col++) {
            for (let row = 0; row < n_rows; row++) {
                board.fill(col, row % 2 === 0 ? "red" : "yellow")
            }
        }

        // Board should now be full
        expect(board.isFull()).toBe(true)
    })

    test("checkWin(): should detect a horizontal win", () => {
        const marker: Marker = "red"

        // Create a horizontal win in column 0 (rows 5, 4, 3, 2 of column 0)
        board.fill(0, marker)
        board.fill(0, marker)
        board.fill(0, marker)
        board.fill(0, marker)

        expect(board.checkWin(marker)).toBe(true)
        expect(board.checkWin("yellow")).toBe(false)
    })

    test("checkWin(): should detect a vertical win", () => {
        const marker: Marker = "yellow"

        // Create a vertical win in the bottom row (columns 0, 1, 2, 3 at row 5)
        board.fill(0, marker)
        board.fill(1, marker)
        board.fill(2, marker)
        board.fill(3, marker)

        expect(board.checkWin(marker)).toBe(true)
        expect(board.checkWin("red")).toBe(false)
    })

    test("checkWin(): should detect a descending diagonal win", () => {
        const marker: Marker = "red"

        // Create a descending diagonal win (top-left to bottom-right)
        // Pattern: col 0 row 0, col 1 row 1, col 2 row 2, col 3 row 3
        // Build up columns to reach correct positions
        board.fill(0, "yellow") // col 0, row 5
        board.fill(0, "yellow") // col 0, row 4
        board.fill(0, "yellow") // col 0, row 3
        board.fill(0, "yellow") // col 0, row 2
        board.fill(0, "yellow") // col 0, row 1
        board.fill(0, marker) // col 0, row 0 ✓

        board.fill(1, "red") // col 1, row 5
        board.fill(1, "yellow") // col 1, row 4
        board.fill(1, "yellow") // col 1, row 3
        board.fill(1, "yellow") // col 1, row 2
        board.fill(1, marker) // col 1, row 1 ✓

        board.fill(2, "yellow") // col 2, row 5
        board.fill(2, "yellow") // col 2, row 4
        board.fill(2, "yellow") // col 2, row 3
        board.fill(2, marker) // col 2, row 2 ✓

        board.fill(3, "yellow") // col 3, row 5
        board.fill(3, "yellow") // col 3, row 4
        board.fill(3, marker) // col 3, row 3 ✓

        expect(board.checkWin(marker)).toBe(true)
    })

    test("checkWin(): should detect an ascending diagonal win", () => {
        const marker: Marker = "yellow"

        // Create an ascending diagonal win (bottom-left to top-right)
        // Pattern: col 0 row 5, col 1 row 4, col 2 row 3, col 3 row 2
        board.fill(0, marker) // col 0, row 5

        board.fill(1, "red") // col 1, row 5
        board.fill(1, marker) // col 1, row 4

        board.fill(2, "red") // col 2, row 5
        board.fill(2, "red") // col 2, row 4
        board.fill(2, marker) // col 2, row 3

        board.fill(3, "red") // col 3, row 5
        board.fill(3, "red") // col 3, row 4
        board.fill(3, "red") // col 3, row 3
        board.fill(3, marker) // col 3, row 2

        expect(board.checkWin(marker)).toBe(true)
    })
})
