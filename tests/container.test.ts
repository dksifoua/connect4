import { Inject, Injectable } from "@/lib/ioc/dependency"
import { container } from "@/lib/ioc/container"
import config from "@/config"
import { RedisClient } from "bun"

container.register("url", () => "http://localhost:3000")

@Injectable()
class Configuration {

    public getConfig() {
        return { env: "production" };
    }
}

@Injectable()
class Repository {

    private readonly configuration: Configuration

    constructor(configuration: Configuration) {
        this.configuration = configuration
    }

    public get() {
        return { data: "repository data" };
    }
}

@Injectable()
class ServiceA {

    private readonly repository: Repository

    constructor(repository: Repository) {
        this.repository = repository
    }
}

@Injectable()
class ServiceB {

    private readonly repository: Repository

    constructor(repository: Repository) {
        this.repository = repository
    }
}

const url = container.resolve("url")
const configuration = container.resolve(Configuration)
const repository = container.resolve(Repository)
const serviceA = container.resolve(ServiceA)
const serviceB = container.resolve(ServiceB)

container.register(RedisClient, () => {
    const { host, port, password } = config.cache
    return new RedisClient(`redis://default:${password}@${host}:${port}`)
})
const cache = container.resolve(RedisClient)

await cache.set("test", "testValue", "EX", 2)
console.assert(await cache.get("test") === "testValue")

await Bun.sleep(3000)
console.assert(!await cache.get("test"))


