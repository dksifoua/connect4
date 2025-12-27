import type { MaybePromise, Server } from "bun";

const server = Bun.serve({
    port: process.env.CONNECT4_LISTENING_PORT,
    routes: {
        "/": () => new Response('Bun!'),
    },
    fetch(req: Request, server: Server<undefined>): MaybePromise<Response> {
        return new Response("Not Found", { status: 404 })
    }
});

console.log(`Listening on ${server.url}`);