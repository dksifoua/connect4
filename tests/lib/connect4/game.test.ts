import { describe, expect, it } from "bun:test"
import { Game } from "@/lib/connect4/game"
import { Player } from "@/lib/connect4/player"
import type { Board } from "@/lib/connect4/board"

describe("Game", () => {

    describe("constructor", () => {
        it("should initialize with correct default values", () => {
            const game = new Game(1)

            expect(game.getId()).toBe(1)
            expect(game.getStatus()).toBe("waiting")
            expect(game.getPlayers().size).toBe(0)
        })
    })

    describe("join", () => {

        it("should allow a player to join a game", () => {
            const game = new Game(1)
            const player = new Player("Alice")

            const { error } = game.join(player)

            expect(error).toBeUndefined()
            expect(game.getPlayers().size).toBe(1)
            expect(game.getPlayers().has("Alice")).toBe(true)
        })

        it("should not allow the same player to join a game twice", () => {
            const game = new Game(1)
            const player = new Player("Alice")

            game.join(player)
            const { error } = game.join(player)

            expect(error).toBe(`Player ${player.getName()} already joined the game ${game.getId()}.`)
            expect(game.getPlayers().size).toBe(1)
        })

        it("should change status to 'ready' when two players have joined a game", () => {
            const game = new Game(1)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")

            game.join(player1)
            const { error } = game.join(player2)

            expect(error).toBeUndefined()
            expect(game.getStatus()).toBe("ready")
        })

        it("should not allow a player to join when game status is not 'waiting'", () => {
            const game = new Game(1)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")
            const player3 = new Player("Charlie")

            game.join(player1)
            game.join(player2)
            const { error } = game.join(player3)

            expect(error).toBe(`Game ${game.getId()} is full. Player ${player3.getName()} cannot join.`)
            expect(game.getPlayers().size).toBe(2)
        })


        it("should notify all observers when the game status changes", () => {
            const game = new Game(1)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")

            game.join(player1)
            game.join(player2)

            expect(game.getBoard()).toEqual(<Board>player1.getBoard())
        })
    })
})