import "reflect-metadata"
import type { Factory, Provider, Registration, Token } from "@/lib/ioc/types"


export class Container {

    private registry: Map<Token, Registration>
    private instances: Map<Token, any>

    public constructor() {
        this.registry = new Map<Token, Registration>()
        this.instances = new Map<Token, any>()
    }

    public dispose(): void {
        this.registry.clear()
        this.instances.clear()
    }

    public register<T>(token: Token<T>, provider: Provider<T>): void {
        this.registry.set(token, { token, provider })
    }

    public resolve<T>(token: Token<T>): T {
        if (this.instances.has(token)) {
            return this.instances.get(token) as T
        }

        if (!this.registry.has(token)) {
            if (typeof token === "function" && Reflect.hasMetadata("ioc:injectable", token)) {
                this.register(token, token)
            } else {
                const tokenName = typeof token === "function" ? token.name : String(token)
                console.error(`Token ${tokenName} not found in container`)
                process.exit(1)
            }
        }

        const registration = this.registry.get(token)!
        const instance: T = this.createInstance<T>(registration)

        this.instances.set(token, instance)

        return instance
    }

    private createInstance<T>(registration: Registration<T>): T {
        const { provider } = registration
        if (typeof provider === "function") {
            if (this.isConstructor(provider)) {
                const paramTypes = Reflect.getMetadata("design:paramtypes", provider) || []
                const injectTokens = Reflect.getMetadata("inject:tokens", provider) || []

                const dependencies = paramTypes.map((type: any, index: number) => {
                    const token = injectTokens[index] || type
                    return this.resolve(token)
                })
                return new (provider as new (...args: any[]) => T)(...dependencies)
            }

            return (provider as Factory<T>)(this)
        }

        console.error(`Unsupported provider type for token ${String(registration.token)}`)
        process.exit(1)
    }

    private isConstructor(func: any) {
        return func.prototype && func.prototype.constructor === func
    }
}