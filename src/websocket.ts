import { z } from "zod"

export type WebSocketServerData = {
    username: string
}

export const BoardGridSchema = z.array(z.array(z.nullable(z.union([z.literal("red"), z.literal("yellow")]))))
export type BoardGrid = z.infer<typeof BoardGridSchema>

const JoinMessagePayloadSchema = z.object({ id: z.coerce.number().nonnegative() })
const ChatMessagePayloadSchema = z.object({ from: z.string(), content: z.string() })
const MoveMessagePayloadSchema = z.object({
    id: z.coerce.number().nonnegative(),
    col: z.coerce.number().nonnegative()
})
const UpdateMessagePayloadSchema = z.object({
    id: z.coerce.number().nonnegative(),
    grid: BoardGridSchema,
    isTurn: z.boolean(),
    opponent: z.string(),
    status: z.union([z.literal("waiting"), z.literal("ready"), z.literal("playing"), z.literal("pause"), z.literal("finished")]),
    winner: z.string().optional()
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
export type MoveMessagePayload = z.infer<typeof MoveMessagePayloadSchema>
export type UpdateMessagePayload = z.infer<typeof UpdateMessagePayloadSchema>
