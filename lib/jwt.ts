import * as jose from "jose"
import type { JOSEError } from "jose/errors"

export type JsonWebTokenConfiguration = {
    issuer: string
    audience: string
    algorithm: string
    expiresIn: number
}

export class JsonWebToken {
    private readonly encoder: TextEncoder
    private readonly configuration: JsonWebTokenConfiguration

    constructor(configuration: JsonWebTokenConfiguration) {
        this.encoder = new TextEncoder()
        this.configuration = configuration
    }

    public async sign(username: string, secret: string): Promise<string> {
        const jwtId = crypto.randomUUID().toString()
        const { algorithm, issuer, audience, expiresIn } = this.configuration
        const jwt = new jose.SignJWT()
            .setProtectedHeader({ alg: algorithm, typ: "JWT" })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience(audience)
            .setSubject(username)
            .setJti(jwtId)
            .setExpirationTime(`${expiresIn} seconds`)

        return jwt.sign(this.encoder.encode(secret))
    }

    public async verify(token: string, secret: string): Promise<jose.JWTVerifyResult> {
        return jose.jwtVerify(token, this.encoder.encode(secret))
    }
}