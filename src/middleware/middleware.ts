import type { BunRequest } from "bun"
import type { Nullable } from "@/utils/types"

export interface Middleware {
    handle(request: BunRequest): Promise<Nullable<Response>>
}