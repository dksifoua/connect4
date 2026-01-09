import { beforeEach, describe, expect, it } from "bun:test"
import { Board } from "@/lib/connect4/board"
import type { Marker, Move } from "@/lib/connect4/types"

describe("Board", () => {
    let n_cols: number
    let n_rows: number
    let board: Board

    beforeEach(() => {
        [n_cols, n_rows] = [7, 6]
        board = new Board(n_rows, n_cols)
    })

    describe("apply", () => {
        it("should not apply a move when the column is full", () => {
            const move: Move = { col: 0, marker: "red" }
            for (let i = 0; i < n_rows; i++) {
                const { error } = board.apply(move)
                expect(error).toBeUndefined()
            }

            const { error } = board.apply(move)
            expect(error).toBe(`Column ${move.col} is full. Please choose another column.`)
        })
    })

    describe("isFull", () => {
        it("should correctly identify if a column is full", () => {
            expect(board.isFull(0)).toBe(false)

            for (let i = 0; i < n_rows; i++) {
                board.apply({ col: 0, marker: "red" })
            }
            expect(board.isFull(0)).toBe(true)
        })

        it("should throw an error for an invalid column index", () => {
            expect(() => board.isFull(-1)).toThrow(`Invalid column index: -1`)
            expect(() => board.isFull(n_cols)).toThrow(`Invalid column index: ${n_cols}`)
        })

        it("should correctly identify if the entire board is full", () => {
            const board = new Board(6, 7)
            expect(board.isFull()).toBe(false)

            for (let col = 0; col < n_cols; col++) {
                for (let row = 0; row < n_rows; row++) {
                    board.apply({ col, marker: "yellow" })
                }
                expect(board.isFull(col)).toBe(true)
            }
            expect(board.isFull()).toBe(true)
        })
    })

    describe("checkWin", () => {
        it("should return null when there are no moves", () => {
            expect(board.checkWin()).toBeNull()
        })

        it("should detect a horizontal win", () => {
            const marker: Marker = "red"

            for (let i = 0; i < 4; i++) {
                board.apply({ col: i, marker })
            }

            expect(board.checkWin()).toEqual({
                winner: marker,
                line: [
                    { col: 3, row: 5 },
                    { col: 2, row: 5 },
                    { col: 1, row: 5 },
                    { col: 0, row: 5 },
                ],
            })
        })

        it("should detect a vertical win", () => {
            const marker: Marker = "yellow"

            for (let i = 0; i < 4; i++) {
                board.apply({ col: 0, marker })
            }

            expect(board.checkWin()).toEqual({
                winner: marker,
                line: [
                    { col: 0, row: 2 },
                    { col: 0, row: 3 },
                    { col: 0, row: 4 },
                    { col: 0, row: 5 },
                ],
            })
        })

        it("should detect an ascending diagonal win", () => {
            const marker: Marker = "red"

            board.apply({ col: 0, marker })
            board.apply({ col: 1, marker: "yellow" })
            board.apply({ col: 1, marker })
            board.apply({ col: 2, marker: "yellow" })
            board.apply({ col: 2, marker: "yellow" })
            board.apply({ col: 2, marker })
            board.apply({ col: 3, marker: "yellow" })
            board.apply({ col: 3, marker: "yellow" })
            board.apply({ col: 3, marker: "yellow" })
            board.apply({ col: 3, marker })

            expect(board.checkWin()).toEqual({
                winner: marker,
                line: [
                    { col: 3, row: 2 },
                    { col: 2, row: 3 },
                    { col: 1, row: 4 },
                    { col: 0, row: 5 },
                ],
            })
        })

        it("should detect a descending diagonal win", () => {
            const marker: Marker = "red"

            board.apply({ col: 3, marker })
            board.apply({ col: 2, marker: "yellow" })
            board.apply({ col: 2, marker })
            board.apply({ col: 1, marker: "yellow" })
            board.apply({ col: 1, marker: "yellow" })
            board.apply({ col: 1, marker })
            board.apply({ col: 0, marker: "yellow" })
            board.apply({ col: 0, marker: "yellow" })
            board.apply({ col: 0, marker: "yellow" })
            board.apply({ col: 0, marker })

            expect(board.checkWin()).toEqual({
                winner: marker,
                line: [
                    { col: 0, row: 2 },
                    { col: 1, row: 3 },
                    { col: 2, row: 4 },
                    { col: 3, row: 5 },
                ],
            })
        })
    })

})