import type { BunRequest } from "bun"
import { z } from "zod"
import { Injectable } from "@/lib/ioc/dependency.ts"
import { AuthService } from "@/service/auth.service.ts"

const AuthRequestBody = z.object({
    username: z.string(),
    password: z.string(),
})

@Injectable()
export class AuthHandler {

    private readonly userService: AuthService

    constructor(userService: AuthService) {
        this.userService = userService

        this.login = this.login.bind(this)
        this.register = this.register.bind(this)
    }

    public async login(request: BunRequest): Promise<Response> {
        const { username, password } = z.parse(AuthRequestBody, await request.body?.json())

        const { token } = await this.userService.login(username, password)

        return new Response(JSON.stringify({ token }), { status: 200 })
    }

    public async register(request: BunRequest): Promise<Response> {
        const { username, password } = z.parse(AuthRequestBody, await request.body?.json())

        const { userId } = await this.userService.register(username, password)

        return new Response(JSON.stringify({ userId }), { status: 201 })
    }
}