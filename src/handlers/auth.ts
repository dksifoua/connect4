import type { BunRequest } from "bun"
import { z } from "zod"

const AuthRequestBody = z.object({
    username: z.string(),
    password: z.string(),
})

export async function loginHandler(request: BunRequest): Promise<Response> {
    const { username, password } = z.parse(AuthRequestBody, await request.body?.json())
    console.log({ username, password })

    return new Response('Login successful', { status: 200 })
}

export async function registrationHandler(request: BunRequest): Promise<Response> {

    return new Response('Registration successful', { status: 200 })
}