import { describe, expect, it } from "bun:test"
import { Game } from "@/lib/connect4/game"
import { Player } from "@/lib/connect4/player"

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
            expect(game.getPlayers().has("Alice")).toBeTrue()
        })

        it("should not allow the same player to join a game twice", () => {
            const game = new Game(1)
            const player = new Player("Alice")

            game.join(player)
            const { error } = game.join(player)

            expect(error).toBe(`Player ${player.getName()} already joined the game ${game.getId()}.`)
            expect(game.getPlayers().size).toBe(1)
        })

        it("should change status to 'playing' when two players have joined a game", () => {
            const game = new Game(1)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")

            game.join(player1)
            const { error } = game.join(player2)

            expect(error).toBeUndefined()
            expect(game.getStatus()).toBe("playing")
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
    })

    describe("makeMove", () => {

        it("should not make a move when game status is not 'playing'", () => {
            const game = new Game(1)
            const player = new Player("Alice")

            game.join(player)
            const { error } = game.makeMove(0, player.getName())

            expect(error).toBe(`Game ${game.getId()} is not in playing state.`)
        })

        it("should not make a move when player hasn't joined the game", () => {
            const game = new Game(1)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")
            const player3 = new Player("Charlie")

            game.join(player1)
            game.join(player2)

            const { error } = game.makeMove(0, player3.getName())

            expect(error).toBe(`Player ${player3.getName()} is not in the game #${game.getId()}.`)
        })

        it("should not make a move when it's not the player's turn", () => {
            const game = new Game(1)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")

            game.join(player1)
            game.join(player2)

            const currentPlayer = player1.getIsTurn() ? player2 : player1
            const { error } = game.makeMove(0, currentPlayer.getName())

            expect(error).toBe("It's not your turn. Please wait for your turn to make a move.")
        })

        it("should not make a move when it's invalid - full column", () => {
            const game = new Game(1, 6, 7)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")

            game.join(player1)
            game.join(player2)

            // Fill column 0 completely (6 moves)
            for (let i = 0; i < 6; i++) {
                const currentPlayer = Array.from(game.getPlayers().values()).find(p => p.getIsTurn())!
                const { error } = game.makeMove(0, currentPlayer.getName())
                expect(error).toBeUndefined()
            }

            const currentPlayer = Array.from(game.getPlayers().values()).find(p => p.getIsTurn())!
            const { error } = game.makeMove(0, currentPlayer.getName())
            expect(error).toBe("Column 0 is full. Please choose another column.")
        })

        it("should not make a move when it's invalid - out of bound column", () => {
            const game = new Game(1, 6, 7)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")

            game.join(player1)
            game.join(player2)

            const currentPlayer = Array.from(game.getPlayers().values()).find(p => p.getIsTurn())!
            const { error } = game.makeMove(10, currentPlayer.getName())
            expect(error).toBe("Error: Invalid column index: 10.")
        })

        it("should make a move when it's a valid one", () => {
            const game = new Game(1)
            const player1 = new Player("Alice")
            const player2 = new Player("Bob")

            game.join(player1)
            game.join(player2)

            const currentPlayer = Array.from(game.getPlayers().values()).find(p => p.getIsTurn())!
            const { error } = game.makeMove(0, currentPlayer.getName())
            expect(error).toBeUndefined()
            expect(game.getBoard().getGrid()[0]![5]).toBe(currentPlayer.getMarker())
            expect(currentPlayer.getIsTurn()).toBeFalse()
            expect(game.getOpponent(currentPlayer).getIsTurn()).toBeTrue()
        })
    })
})