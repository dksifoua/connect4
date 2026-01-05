import { describe, expect, it } from "bun:test"
import { UserService } from "@/service/user.service"
import { UserRepository } from "@/repository/user.repository"
import { createMockProxy } from "../utils/utils"

describe("UserService", () => {

    const createUserServiceWithMocks = () => {
        const userRepository = createMockProxy<UserRepository>()

        const userService = new UserService(userRepository as unknown as UserRepository)

        return { userService, userRepository }
    }

    describe("getAll", () => {
        it("should return all users", async (): Promise<void> => {
            const { userService, userRepository } = createUserServiceWithMocks()
            const users = [
                { id: 1, username: "alice", password: "hashed_password" },
                { id: 2, username: "bob", password: "hashed_password" }
            ]
            userRepository.findAll.mockResolvedValue(users)

            const allUsers = await userService.getAll()
            expect(allUsers).toHaveLength(2)
            expect(allUsers).toEqual(users)
            expect(userRepository.findAll).toHaveBeenCalledTimes(1)
        })

        it("should return no users", async (): Promise<void> => {
            const { userService, userRepository } = createUserServiceWithMocks()
            userRepository.findAll.mockResolvedValue([])

            const allUsers = await userService.getAll()
            expect(allUsers).toHaveLength(0)
            expect(userRepository.findAll).toHaveBeenCalledTimes(1)
        })
    })
})