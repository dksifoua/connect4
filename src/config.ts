import interpolate from "@/lib/interpolate"
import config from "../config.yaml" with { type: "yaml" }

export interface Config {
    server: {
        port: number
    }
    database: {
        host: string
        port: number
        name: string
        user: string
        password: string
    }
    jwt: {
        secret: string
        config: {
            issuer: string
            audience: string
            algorithm: string
            expiresIn: number
        }
    }
    cache: {
        host: string
        port: number
        password: string
    }
}

export default interpolate(config) as Config