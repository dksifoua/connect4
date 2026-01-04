import { describe, expect, it } from "bun:test"
import { JsonWebToken, type JsonWebTokenConfiguration } from "@/lib/jwt"
import * as jose from "jose"

describe("JsonWebToken", () => {
    const configuration: JsonWebTokenConfiguration = {
        issuer: "test-issuer",
        audience: "test-audience",
        algorithm: "HS256",
        expiresIn: 3600,
    }
    const secret = "test-secret"
    const username = "test-user"

    describe("sign", () => {
        it("should generate a valid JWT token", async () => {
            const jwt = new JsonWebToken(configuration)
            const token = await jwt.sign(username, secret)

            // Verify token structure
            const decoded = await jose.jwtVerify(token, new TextEncoder().encode(secret))
            expect(decoded.payload.iss).toBe(configuration.issuer)
            expect(decoded.payload.aud).toBe(configuration.audience)
            expect(decoded.payload.sub).toBe(username)
        })
    })

    describe("verify", () => {
        it("should verify a valid JWT token and return the username", async () => {
            const jwt = new JsonWebToken(configuration)
            const token = await jwt.sign(username, secret)

            const result = await jwt.verify(token, secret)
            expect(result.username).toBe(username)
        })

        it("should throw an error for an invalid token", async () => {
            const jwt = new JsonWebToken(configuration)
            const invalidToken = "invalid-token"

            expect(jwt.verify(invalidToken, secret)).rejects.toThrow()
        })
    })

    describe("getExpirationTime", () => {
        it("should return the correct expiration time", () => {
            const jwt = new JsonWebToken(configuration)
            const expiresIn = jwt.getExpirationTime()

            expect(expiresIn).toBe(configuration.expiresIn)
        })
    })
})