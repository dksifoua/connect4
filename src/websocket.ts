import { z } from "zod"
import type { Player } from "@/lib/connect4/player"
import type { Nullable } from "@/utils/types"

export type WebSocketServerData = {
    username: string
    player: Nullable<Player>
}

const JoinMessagePayloadSchema = z.object({ id: z.coerce.number().positive() })
const ChatMessagePayloadSchema = z.object({ from: z.string(), content: z.string() })
const MoveMessagePayloadSchema = z.object({ index: z.number().positive() })
export const MessageSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("new"), payload: z.undefined() }),
    z.object({ type: z.literal("join"), payload: JoinMessagePayloadSchema }),
    z.object({ type: z.literal("move"), payload: MoveMessagePayloadSchema }),
    z.object({ type: z.literal("chat"), payload: ChatMessagePayloadSchema }),
])

export type Message = z.infer<typeof MessageSchema>
export type JoinMessagePayload = z.infer<typeof JoinMessagePayloadSchema>
export type ChatMessagePayload = z.infer<typeof ChatMessagePayloadSchema>
