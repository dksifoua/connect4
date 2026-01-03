export type Nullable<T> = T | null

export type Marker = "red" | "yellow"

export type FilledCell = Marker
export type EmptyCell = "-"
export type Cell = FilledCell | EmptyCell

export type GameStatus = "waiting" | "ready" | "playing" | "win" | "draw" | "pause"

export interface Observable<Subject> {

    // Attach an observer to the subject.
    attach(observer: Observer<Subject>): void;

    // Detach an observer from the subject.
    detach(observer: Observer<Subject>): void;

    // Notify all observers about the subject.
    notify(): void;
}

export interface Observer<Subject> {

    // Receive update from a subject.
    update(subject: Subject): void;
}