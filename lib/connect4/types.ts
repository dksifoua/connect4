import type { Board } from "@/lib/connect4/board"

export interface Observable<T> {
    attach(observer: Observer<T>): void
    detach(observer: Observer<T>): void
    notify(data: T): void
}

export interface Observer<T> {
    update(data: T): void
}

export type Nullable<T> = T | null
export type Marker = "red" | "yellow"
export type Cell = Nullable<Marker>

export type Move = { col: number, marker: Marker, row?: number }
export type Position = { row: number, col: number }
export type WinResult = { winner: Marker, line: Position[] }

export type GameStatus = "waiting" | "ready" | "playing" | "win" | "draw" | "pause"
export type GameUpdate = {
    id: number
    board: Board
    turn: string
}
