import { parseArgs } from "node:util"
import { Logging } from "@/lib/logging"
import { z } from "zod"
import { type Message, MessageSchema } from "@/websocket"
import type { BunMessageEvent } from "bun"

const logging = new Logging("Connect4ClientCli", "info")

const WEB_SOCKET_URL = "ws://localhost:3000/game"

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        token: {
            short: 't',
            type: "string"
        },
    },
    strict: true,
    allowPositionals: true,
})

const ws = new WebSocket(WEB_SOCKET_URL, {
    headers: {
        "Authorization": `Bearer ${z.string().parse(values.token)}`
    }
})

ws.addEventListener("open", async (event: Event): Promise<void> => {
    logging.info("WebSocket connection opened")
})

ws.addEventListener("message", async (event: BunMessageEvent<any>): Promise<void> => {
    logging.info(`Received message: ${event.data}`)
})

ws.addEventListener("close", async (event: CloseEvent): Promise<void> => {
    logging.info(`WebSocket connection closed with code ${event.code}`)
})

for await (const line of console) {
    if (ws.readyState !== WebSocket.OPEN) {
        ws.terminate()
        break
    }

    try {
        const lineParts = line.trim().split(' ')
        switch (true) {
            case lineParts.length === 1:
                const message: Message = MessageSchema.parse({ "type": lineParts[0] })
                ws.send(JSON.stringify(message))
                break
            default:
                throw new Error()
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            logging.error(`Failed to parse message: ${z.prettifyError(error)}`)
        } else {
            logging.error(`Unexpected error parsing message: ${error}`)
        }
    }
}
