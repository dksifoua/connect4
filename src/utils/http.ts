import type { BunRequest } from "bun"
import type { Nullable } from "@/utils/types"

export async function extractAuthorizationHeader(request: BunRequest): Promise<Nullable<string>> {
    let token: Nullable<string> = null

    const authorizationHeader: Nullable<string> = request.headers.get("Authorization")
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
        token = authorizationHeader.slice(7)
    }

    return token
}