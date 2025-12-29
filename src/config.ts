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
        secret: string;
        config: {
            issuer: string;
            audience: string;
            algorithm: string;
            expiresIn: number;
        };
    };
}

export type JwtConfig = Config["jwt"]["config"]

const interpolatedConfig = interpolate(config) as Config

export default interpolatedConfig