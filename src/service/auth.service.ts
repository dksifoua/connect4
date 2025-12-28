import { Inject, Injectable } from "@/lib/ioc/dependency"
import UserRepository from "@/repository/user.repository"
import { UserAlreadyConnectedError, UserAlreadyExistsError, UserCredentialsError, UserNotFoundError } from "@/error"
import type { User } from "@/domain"
import type { Nullable } from "@/utils/types"
import JsonWebToken from "@/lib/jwt"
import type { JwtConfig } from "@/config"
import type { JWTPayload } from "jose"

@Injectable()
export default class UserService {

    private readonly userRepository: UserRepository
    private readonly jsonWebToken: JsonWebToken
    private readonly jwtConfig: JwtConfig

    private connectedUsers: Map<string, string>

    constructor(userRepository: UserRepository, @Inject("jwtConfig") jwtConfig: JwtConfig) {
        this.userRepository = userRepository
        this.jsonWebToken = new JsonWebToken()
        this.jwtConfig = jwtConfig

        this.connectedUsers = new Map()
    }

    public async register(username: string, password: string): Promise<{ userId: number }> {
        if (await this.userRepository.exists(username)) {
            throw new UserAlreadyExistsError(`User [${username}] already exists!`)
        }

        password = await Bun.password.hash(password)
        return await this.userRepository.save(username, password)
    }

    public async login(username: string, password: string): Promise<{ token: string }> {
        if (this.connectedUsers.has(username)) {
            throw new UserAlreadyConnectedError(`User [${username}] already connected!`)
        }

        const user: Nullable<User> = await this.userRepository.findByUsername(username)
        if (!user) {
            throw new UserNotFoundError(`User [${username}] not found!`)
        }

        if (!await Bun.password.verify(password, user.password)) {
            throw new UserCredentialsError(`Invalid password for user [${username}]!`)
        }

        const jwtPayload: JWTPayload = {
            iss: this.jwtConfig.issuer,
            aud: this.jwtConfig.audience,
            jti: crypto.randomUUID(),
            exp: this.jwtConfig.expiresIn,
            username
        }
        const { algorithm, secret } = this.jwtConfig

        const token = await this.jsonWebToken.sign(jwtPayload, algorithm, secret)

        this.connectedUsers.set(username, token)

        return { token }
    }
}