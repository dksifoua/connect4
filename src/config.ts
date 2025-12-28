import interpolate from "@/lib/interpolate"
import config from "../config.yaml" with { type: "yaml" }

export interface Config {
    server: {
        port: number;
    };
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    jwt: {
        issuer: string;
        audience: string;
        algorithm: string;
        expiresIn: number;
        secret: string;
    };
}

export type JwtConfig = Config["jwt"]

const interpolatedConfig = interpolate(config) as Config

export default interpolatedConfig