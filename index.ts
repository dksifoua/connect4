import type { ErrorLike, MaybePromise, Server } from "bun"
import { loginHandler, registrationHandler } from "@/handlers/auth.ts"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/singlestore"

const pool = new Pool({
    host: process.env.CONNECT4_POSTGRES_HOST,
    port: parseInt(process.env.CONNECT4_POSTGRES_PORT!),
    user: process.env.CONNECT4_POSTGRES_USER,
    password: process.env.CONNECT4_POSTGRES_PASSWORD,
    database: process.env.CONNECT4_POSTGRES_DATABASE,
})
const database = drizzle({client: pool})

const server = Bun.serve({
    port: process.env.CONNECT4_LISTENING_PORT,
    routes: {
        "/": () => new Response('Bun!'),
        "/login": {
            POST: loginHandler
        },
        "/registration": {
            POST: registrationHandler
        },
    },
    fetch(req: Request, server: Server<undefined>): MaybePromise<Response> {
        return new Response("Not Found", { status: 404 })
    },
    error(error: ErrorLike): MaybePromise<Response> {
        if (error.name === "ZodError") {
            return new Response(`Validation Error: ${error.message}`, { status: 400 })
        }

        return new Response(`Error: ${error.message}`, { status: 500 })
    }
});

console.log(`Listening on ${server.url}`);