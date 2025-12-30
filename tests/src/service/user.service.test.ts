import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { Container } from "@/lib/ioc/container"
import { UserService } from "@/service/user.service"
import { UserRepository } from "@/repository/user.repository"
import type { ClassMethods } from "../utils/types"
import type { User } from "@/domain"

describe("UserService", () => {
    let container: Container
    let userService: UserService
    let userRepository: Pick<ClassMethods<UserRepository>, "findAll">

    beforeEach(() => {
        container = new Container()
        userRepository = {
            findAll: mock(async (): Promise<User[]> => [
                { id: 1, username: "alice", password: "hashed_password" },
                { id: 2, username: "bob", password: "hashed_password" }
            ])
        }
        container.register(UserRepository, () => userRepository)
        userService = container.resolve(UserService)
    })

    afterEach(() => {
        container.dispose()
    })

    test("should return all users - getAll", async (): Promise<void> => {
        const users = await userService.getAll()
        expect(users).toHaveLength(2)
        expect(users).toEqual([
            { id: 1, username: "alice", password: "hashed_password" },
            { id: 2, username: "bob", password: "hashed_password" }
        ])
        expect(userRepository.findAll).toHaveBeenCalledTimes(1)
    })

    test("should return all users - getAll with no users", async (): Promise<void> => {
        userRepository.findAll = mock(async (): Promise<User[]> => [])
        const users = await userService.getAll()
        expect(users).toHaveLength(0)
        expect(userRepository.findAll).toHaveBeenCalledTimes(1)
    })
})