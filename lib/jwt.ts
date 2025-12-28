import * as jose from "jose"

export default class JsonWebToken {
    private readonly encoder: TextEncoder

    constructor() {
        this.encoder = new TextEncoder()
    }

    public async sign(payload: jose.JWTPayload, algorithm: string, secret: string): Promise<string> {
        const jwt = new jose.SignJWT(payload)
            .setIssuedAt()
            .setProtectedHeader({ alg: algorithm })

        return jwt.sign(this.encoder.encode(secret))
    }

    public async verify(token: string, secret: string): Promise<jose.JWTVerifyResult> {
        return jose.jwtVerify(token, this.encoder.encode(secret))
    }
}