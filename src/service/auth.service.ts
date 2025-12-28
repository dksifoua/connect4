import { Injectable } from "@/lib/ioc/dependency.ts"
import UserRepository from "@/repository/user.repository.ts"
import { UserAlreadyExistsError } from "@/error.ts"

@Injectable()
export default class UserService {

    private readonly userRepository: UserRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    public async register(username: string, password: string): Promise<{ userId: number }> {
        if (await this.userRepository.exists(username)) {
            throw new UserAlreadyExistsError(`User [${username}] already exists!`)
        }

        password = await Bun.password.hash(password)
        return await this.userRepository.save(username, password)
    }
}