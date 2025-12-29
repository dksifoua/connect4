import { Inject, Injectable } from "@/lib/ioc/dependency"
import { UserRepository } from "@/repository/user.repository"
import { UserAlreadyConnectedError, UserAlreadyExistsError, UserCredentialsError, UserNotFoundError } from "@/error"
import type { User } from "@/domain"
import type { Nullable } from "@/utils/types"
import { JsonWebToken } from "@/lib/jwt"
import { RedisClient } from "bun"

@Injectable()
export class UserService {

    private readonly userRepository: UserRepository
    private readonly jsonWebToken: JsonWebToken
    private readonly secret: string
    private readonly redis: RedisClient

    constructor(
        userRepository: UserRepository,
        jsonWebToken: JsonWebToken,
        @Inject("secret") secret: string,
        redis: RedisClient
    ) {
        this.userRepository = userRepository
        this.jsonWebToken = jsonWebToken
        this.secret = secret
        this.redis = redis
    }

    public async register(username: string, password: string): Promise<{ userId: number }> {
        if (await this.userRepository.exists(username)) {
            throw new UserAlreadyExistsError(`User [${username}] already exists!`)
        }

        password = await Bun.password.hash(password)
        return await this.userRepository.save(username, password)
    }

    public async login(username: string, password: string): Promise<{ token: string }> {
        if (await this.redis.exists(username)) {
            throw new UserAlreadyConnectedError(`User [${username}] already connected!`)
        }

        const user: Nullable<User> = await this.userRepository.findByUsername(username)
        if (!user) {
            throw new UserNotFoundError(`User [${username}] not found!`)
        }

        if (!await Bun.password.verify(password, user.password)) {
            throw new UserCredentialsError(`Invalid password for user [${username}]!`)
        }

        const token: string = await this.jsonWebToken.sign(username, this.secret)

        await this.redis.set(username, token, "EX", this.jsonWebToken.getExpirationTime())

        return { token }
    }
}