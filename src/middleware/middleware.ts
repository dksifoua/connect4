import type { Nullable } from "@/utils/types"
import type { BunRequest } from "bun"

export interface Middleware {
    handle(request: BunRequest): Promise<Nullable<Response>>
}