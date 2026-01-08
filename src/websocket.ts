import { z } from "zod"
import type { Player } from "@/lib/connect4/player"
import type { Nullable } from "@/utils/types"

export type WebSocketServerData = {
    username: string
    player: Nullable<Player>
}

export const BoardGridSchema = z.array(z.array(z.nullable(z.union([z.literal("red"), z.literal("yellow")]))))
export type BoardGrid = z.infer<typeof BoardGridSchema>

const JoinMessagePayloadSchema = z.object({ id: z.coerce.number().positive() })
const ChatMessagePayloadSchema = z.object({ from: z.string(), content: z.string() })
const MoveMessagePayloadSchema = z.object({ column: z.number().positive() })
const UpdateMessagePayloadSchema = z.object({
    id: z.number(),
    grid: BoardGridSchema,
    isTurn: z.boolean()
})
export const MessageSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("new"), payload: z.undefined() }),
    z.object({ type: z.literal("join"), payload: JoinMessagePayloadSchema }),
    z.object({ type: z.literal("move"), payload: MoveMessagePayloadSchema }),
    z.object({ type: z.literal("chat"), payload: ChatMessagePayloadSchema }),
    z.object({ type: z.literal("update"), payload: UpdateMessagePayloadSchema })
])

export type Message = z.infer<typeof MessageSchema>
export type JoinMessagePayload = z.infer<typeof JoinMessagePayloadSchema>
export type ChatMessagePayload = z.infer<typeof ChatMessagePayloadSchema>
export type UpdateMessagePayload = z.infer<typeof UpdateMessagePayloadSchema>
