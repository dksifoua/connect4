import { z } from "zod"
import type { Player } from "@/lib/connect4/player"
import type { Nullable } from "@/utils/types"

export type WebSocketServerData = {
    username: string
    player: Nullable<Player>
}

export const MessageSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("new"), payload: z.undefined() }),
    z.object({ type: z.literal("join"), payload: z.object({ gameId: z.number() }) }),
    z.object({ type: z.literal("move"), payload: z.object({ columnIndex: z.number() }) }),
    z.object({ type: z.literal("chat"), payload: z.object({ to: z.string(), message: z.string() }) }),
])

export type Message = z.infer<typeof MessageSchema>
