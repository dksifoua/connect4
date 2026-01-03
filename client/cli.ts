import { parseArgs } from "node:util"
import { Logging } from "@/lib/logging"
import { z } from "zod"

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

ws.addEventListener("open", async event => {
    logging.info("WebSocket connection opened")
})

ws.addEventListener("message", async event => {
    logging.info(`Received message: ${event.data}`)
})

ws.addEventListener("close", async event => {
    logging.info(`WebSocket connection closed with code ${event.code}`)
})
