import { Injectable } from "@/lib/ioc/dependency"
import { UserRepository } from "@/repository/user.repository"
import type { User } from "@/domain"

@Injectable()
export class UserService {
    private readonly userRepository: UserRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    public async getAll(): Promise<User[]> {
        return this.userRepository.findAll()
    }
}