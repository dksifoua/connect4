import { describe, expect, it } from "bun:test"
import { AuthService } from "@/service/auth.service"
import { UserRepository } from "@/repository/user.repository"
import { JsonWebToken } from "@/lib/jwt"
import { RedisClient } from "bun"
import { createMockProxy } from "../utils/utils"
import { UserAlreadyConnectedError, UserAlreadyExistsError, UserCredentialsError, UserNotFoundError } from "@/error"

describe("AuthService", () => {
    const secret = "test-secret"

    const createAuthServiceWithMocks = () => {
        const userRepository = createMockProxy<UserRepository>()
        const jsonWebToken = createMockProxy<JsonWebToken>()
        const redisClient = createMockProxy<RedisClient>()

        const authService = new AuthService(
            userRepository as unknown as UserRepository,
            jsonWebToken as unknown as JsonWebToken,
            secret,
            redisClient as unknown as RedisClient
        )

        return { authService, userRepository, jsonWebToken, redisClient }
    }

    describe("register", () => {
        it("should register a new user successfully", async () => {
            const { authService, userRepository } = createAuthServiceWithMocks()
            const [username, password] = ["user", "pass123"]
            userRepository.exists.mockResolvedValueOnce(false)
            userRepository.save.mockResolvedValueOnce({ userId: 1 })

            const result = await authService.register(username, password)
            expect(userRepository.exists).toHaveBeenCalledWith(username)
            expect(userRepository.save).toHaveBeenCalledTimes(1)
            expect(result).toEqual({ userId: 1 })

            const savedPassword = (userRepository.save.mock.calls[0] as [string, string])[1]
            expect(await Bun.password.verify(password, savedPassword)).toBe(true)
        })

        it("should throw UserAlreadyExistsError when username taken", async () => {
            const { authService, userRepository } = createAuthServiceWithMocks()
            userRepository.exists.mockResolvedValueOnce(true)
            expect(authService.register("exists", "pass")).rejects.toThrow(UserAlreadyExistsError)
        })
    })

    describe("login", () => {
        it("should return a jwt token on successful login", async () => {
            const { authService, userRepository, redisClient, jsonWebToken } = createAuthServiceWithMocks()
            const hashedPassword = await Bun.password.hash("correct-pass")

            redisClient.exists.mockResolvedValueOnce(false)
            userRepository.findByUsername.mockResolvedValueOnce({ id: 1, username: "user", password: hashedPassword })
            jsonWebToken.sign.mockResolvedValueOnce("mock-jwt-token")

            const result = await authService.login("user", "correct-pass")

            expect(result).toEqual({ token: "mock-jwt-token" })
            expect(redisClient.set).toHaveBeenCalledWith("user:token", "mock-jwt-token", "EX", undefined)
        })

        it("should throw UserAlreadyConnectedError when user in cache", async () => {
            const { authService, redisClient } = createAuthServiceWithMocks()
            redisClient.exists.mockResolvedValueOnce(true)
            expect(authService.login("user", "pass")).rejects.toThrow(UserAlreadyConnectedError)
        })

        it("should throw UserNotFoundError when user does not exist", async () => {
            const { authService, userRepository, redisClient } = createAuthServiceWithMocks()
            redisClient.exists.mockResolvedValueOnce(false)
            userRepository.findByUsername.mockResolvedValueOnce(null)

            expect(authService.login("ghost", "pass")).rejects.toThrow(UserNotFoundError)
        })

        it("should throw UserCredentialsError when password is incorrect", async () => {
            const { authService, userRepository, redisClient } = createAuthServiceWithMocks()
            const hashedPassword = await Bun.password.hash("real-pass")

            redisClient.exists.mockResolvedValueOnce(false)
            userRepository.findByUsername.mockResolvedValueOnce({ id: 1, username: "user", password: hashedPassword })

            expect(authService.login("user", "wrong-pass")).rejects.toThrow(UserCredentialsError)
        })
    })
})