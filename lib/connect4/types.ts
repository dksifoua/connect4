import type { Board } from "@/lib/connect4/board"

export type Nullable<T> = T | null
export type Marker = "red" | "yellow"
export type Cell = Nullable<Marker>

export type Move = { col: number, marker: Marker, row?: number }
export type Position = { row: number, col: number }
export type WinResult = { winner: Marker, line: Position[] }

export type GameStatus = "waiting" | "ready" | "playing"| "pause" | "finished"
export type GameUpdate = {
    id: number
    board: Board
    turn: string
}
