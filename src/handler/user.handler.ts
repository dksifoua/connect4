import { Injectable } from "@/lib/ioc/dependency"
import { UserService } from "@/service/user.service"
import type { BunRequest } from "bun"
import { AuthenticationMiddleware } from "@/middleware/authentication.middleware"
import { Use } from "@/utils/decorator"

@Injectable()
export class UserHandler {

    private readonly userService: UserService

    constructor(userService: UserService) {
        this.userService = userService

        this.getAll = this.getAll.bind(this)
    }

    @Use(AuthenticationMiddleware)
    public async getAll(_request: BunRequest): Promise<Response> {
        return new Response(JSON.stringify(await this.userService.getAll()), { status: 200 })
    }
}