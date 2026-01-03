import type { Nullable } from "@/utils/types"
import { Inject, Injectable } from "@/lib/ioc/dependency"
import { JsonWebToken } from "@/lib/jwt"
import type { Middleware } from "@/middleware/middleware"
import type { BunRequest } from "bun"
import { extractAuthorizationHeader } from "@/utils/http"

@Injectable()
export class AuthenticationMiddleware implements Middleware {
    private readonly jsonWebToken: JsonWebToken
    private readonly secret: string

    constructor(jsonWebToken: JsonWebToken, @Inject("secret") secret: string) {
        this.jsonWebToken = jsonWebToken
        this.secret = secret
    }

    public async handle(request: BunRequest): Promise<Nullable<Response>> {
        const token: Nullable<string> = await extractAuthorizationHeader(request)
        if (!token) {
            return new Response(JSON.stringify({ error: "Unauthorized: No token provided" }), { status: 401 })
        }

        await this.jsonWebToken.verify(token, this.secret)

        return null
    }
}