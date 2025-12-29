import type { Nullable } from "@/utils/types"
import type { BunRequest } from "bun"
import { Inject, Injectable } from "@/lib/ioc/dependency"
import { JsonWebToken } from "@/lib/jwt"
import type { Middleware } from "@/middleware/middleware"

@Injectable()
export class AuthenticationMiddleware implements Middleware {
    private readonly jsonWebToken: JsonWebToken
    private readonly secret: string

    constructor(jsonWebToken: JsonWebToken, @Inject("secret") secret: string) {
        this.jsonWebToken = jsonWebToken
        this.secret = secret
    }

    public async handle(request: BunRequest): Promise<Nullable<Response>> {
        const authorizationHeader: Nullable<string> = request.headers.get("Authorization")

        let token: Nullable<string> = null
        if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.slice(7)
        }

        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized: No token provided" }), { status: 401 })
        }

        await this.jsonWebToken.verify(token, this.secret)

        return null
    }
}