import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { Container } from "@/lib/ioc/container"
import { AuthService } from "@/service/auth.service"
import { UserRepository } from "@/repository/user.repository"
import { JsonWebToken } from "@/lib/jwt"
import { RedisClient } from "bun"
import { UserAlreadyConnectedError, UserAlreadyExistsError, UserCredentialsError, UserNotFoundError } from "@/error"
import type { MockedClass } from "../utils/types"

describe("AuthService", () => {
    let container: Container
    let authService: AuthService

    let userRepository: MockedClass<UserRepository>
    let jsonWebToken: Omit<MockedClass<JsonWebToken>, "verify">
    let redisClient: Pick<MockedClass<RedisClient>, "exists" | "set">
    const secret = "test-secret"

    beforeEach(() => {
        container = new Container()
        userRepository = {
            exists: mock(),
            save: mock(),
            findByUsername: mock(),
            findAll: mock()
        }
        jsonWebToken = {
            sign: mock(async () => "token"),
            getExpirationTime: mock(() => 3600)
        }
        redisClient = {
            exists: mock(),
            set: mock()
        }

        container.register(UserRepository, () => userRepository as any)
        container.register(JsonWebToken, () => jsonWebToken as unknown as JsonWebToken)
        container.register(RedisClient, () => redisClient as unknown as RedisClient)
        container.register("secret", () => secret)

        authService = container.resolve(AuthService)
    })

    afterEach(() => {
        container.dispose()

        userRepository.exists.mockRestore()
    })

    describe("register", () => {
        /*
        test("should register a new user successfully", async () => {
            userRepository.exists.mockImplementationOnce(async (_username: string) => false)
            userRepository.save.mockResolvedValueOnce({ userId: 1 })

            const result = await authService.register("user", "pass123")
            expect(result).toEqual({ userId: 1 })
            expect(userRepository.exists).toHaveBeenCalledWith("user")

            const savedPassword = (userRepository.save.mock.calls[0] as [string, string])[1]
            expect(savedPassword).not.toBe("pass123")
            expect(await Bun.password.verify("pass123", savedPassword)).toBe(true)

            userRepository.exists.mockRestore()
            userRepository.exists.mockClear()
        })
*/
        test("should throw UserAlreadyExistsError if username taken", async () => {
            userRepository.exists.mockResolvedValue(true)

            expect(authService.register("exists", "pass")).rejects.toThrow(UserAlreadyExistsError)
        })
    })

    describe("login", () => {
        test("should return token on successful login", async () => {
            const hashedPassword = await Bun.password.hash("correct-pass")

            redisClient.exists.mockResolvedValue(false)
            userRepository.findByUsername.mockResolvedValue({ id: 1, username: "user", password: hashedPassword })
            jsonWebToken.sign.mockResolvedValue("mock-jwt-token")

            const result = await authService.login("user", "correct-pass")

            expect(result).toEqual({ token: "mock-jwt-token" })
            expect(redisClient.set).toHaveBeenCalledWith("user", "mock-jwt-token", "EX", 3600)
        })

        test("should throw UserAlreadyConnectedError if user in redis", async () => {
            redisClient.exists.mockResolvedValue(true)

            expect(authService.login("user", "pass")).rejects.toThrow(UserAlreadyConnectedError)
        })

        test("should throw UserNotFoundError if user does not exist", async () => {
            redisClient.exists.mockResolvedValue(false)
            userRepository.findByUsername.mockResolvedValue(null)

            expect(authService.login("ghost", "pass")).rejects.toThrow(UserNotFoundError)
        })

        test("should throw UserCredentialsError if password incorrect", async () => {
            const hashedPassword = await Bun.password.hash("real-pass")

            redisClient.exists.mockResolvedValue(false)
            userRepository.findByUsername.mockResolvedValue({ id: 1, username: "user", password: hashedPassword })

            expect(authService.login("user", "wrong-pass")).rejects.toThrow(UserCredentialsError)
        })
    })
})