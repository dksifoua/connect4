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
    const message = JSON.parse(event.data) as Message
    if (message.type === "chat") {
        const { from, content } = message.payload
        logging.info(`${from}> ${content}`)
    }
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
        const type = lineParts[0] as string
        const payload = lineParts[1] ? Object.fromEntries(
                    lineParts[1]!.split(',').map(pair => {
                        const [key, value] = pair.split(':')
                        return [key, value]
                    })
                ) : undefined

        const message: Message = MessageSchema.parse({ type, payload })
        ws.send(JSON.stringify(message))
    } catch (error) {
        if (error instanceof z.ZodError) {
            logging.error(`Failed to parse message: ${z.prettifyError(error)}`)
        } else {
            logging.error(`Unexpected error parsing message: ${error}`)
        }
    }
}
