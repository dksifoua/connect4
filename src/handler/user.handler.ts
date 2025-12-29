import { Inject, Injectable } from "@/lib/ioc/dependency"
import { UserService } from "@/service/user.service"
import type { BunRequest } from "bun"
import type { Nullable } from "@/utils/types"
import { JsonWebToken } from "@/lib/jwt"

@Injectable()
export class UserHandler {

    private readonly userService: UserService
    private readonly jsonWebToken: JsonWebToken
    private readonly secret: string

    constructor(userService: UserService, jsonWebToken: JsonWebToken, @Inject("secret") secret: string) {
        this.userService = userService
        this.jsonWebToken = jsonWebToken
        this.secret = secret

        this.getAll = this.getAll.bind(this)
    }

    public async getAll(request: BunRequest): Promise<Response> {
        const authorizationHeader = request.headers.get("Authorization")

        let token: Nullable<string> = null
        if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.slice(7)
        }

        if (!token) {
            return new Response("Unauthorized: Invalid token!", { status: 401 })
        }

        await this.jsonWebToken.verify(token, this.secret)

        return new Response(JSON.stringify(await this.userService.getAll()), { status: 200 })
    }
}