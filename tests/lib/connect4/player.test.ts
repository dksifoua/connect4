import { describe, expect, it } from "bun:test"
import { Player } from "@/lib/connect4/player"
import { Board } from "@/lib/connect4/board"

describe("Player", () => {

    it("should return the player's name when getName is called", () => {
        const player = new Player("Alice")
        expect(player.getName()).toBe("Alice")
    })

    it("should update the board when update is called", () => {
        const player = new Player("Bob")
        const board = new Board(6, 7)

        player.update(board)
        expect(player["board"]).toBe(board)
    })

    it("should set the player's marker when setMarker is called", () => {
        const player = new Player("Charlie")
        player.setMarker("red")

        expect(player["marker"]).toBe("red")
    })
})