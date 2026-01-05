import { describe, expect, it, jest } from "bun:test"
import { Game } from "@/lib/connect4/game"
import { Player } from "@/lib/connect4/player"
import { Board } from "@/lib/connect4/board"

describe("Game", () => {

    it("should initialize with correct default values", () => {
        const game = new Game(1)

        expect(game.getId()).toBe(1)
        expect(game.getStatus()).toBe("waiting")
        expect(game.getPlayers().size).toBe(0)
    })

    it("should allow a player to join the game", () => {
        const game = new Game(1)
        const player = new Player("Alice")

        const { error } = game.join(player)

        expect(error).toBeNull()
        expect(game.getPlayers().size).toBe(1)
        expect(game.getPlayers().has("Alice")).toBe(true)
    })

    it("should not allow the same player to join twice", () => {
        const game = new Game(1)
        const player = new Player("Alice")

        game.join(player)
        const { error } = game.join(player)

        expect(error).toBe("Player with name Alice is already in the game.")
        expect(game.getPlayers().size).toBe(1)
    })

    it("should change status to 'ready' when there are two players", () => {
        const game = new Game(1)
        const player1 = new Player("Alice")
        const player2 = new Player("Bob")

        game.join(player1)
        const { error } = game.join(player2)

        expect(error).toBeNull()
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

        expect(error).toBe("Game 1 is full.")
        expect(game.getPlayers().size).toBe(2)
    })

    it("should notify all observers when the game status changes", () => {
        const game = new Game(1)
        const player1 = new Player("Alice")
        const player2 = new Player("Bob")
        const mockObserver = { update: jest.fn() }

        game.attach(mockObserver)
        game.join(player1)
        game.join(player2)

        expect(mockObserver.update).toHaveBeenCalledWith(expect.any(Board))
    })

    it("should allow observer detachment", () => {
        const game = new Game(1)
        const mockObserver = { update: jest.fn() }

        game.attach(mockObserver)
        game.detach(mockObserver)
        game.notify()

        expect(mockObserver.update).not.toHaveBeenCalled()
    })
})