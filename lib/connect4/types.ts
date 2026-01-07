export interface Observable {
    attach(observer: Observer): void
    detach(observer: Observer): void
    notify(): void
}

export interface Observer {
    update(subject: Observable): void
}

export type Nullable<T> = T | null
export type Marker = "red" | "yellow"
export type Cell = Nullable<Marker>

export type Move = { col: number, marker: Marker, row?: number }
export type Position = { row: number, col: number }
export type WinResult = { winner: Marker, line: Position[] }
