import type { Marker, Nullable } from "@/lib/connect4/types"

export class Player {

    private readonly name: string
    private marker: Nullable<Marker>
    private isTurn: boolean

    public constructor(name: string) {
        this.name = name
        this.marker = null
        this.isTurn = false
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

    public getIsTurn(): boolean {
        return this.isTurn
    }

    public setIsTurn(isTurn: boolean): void {
        this.isTurn = isTurn
    }
}