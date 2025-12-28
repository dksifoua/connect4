import "reflect-metadata"
import type { Factory, Provider, Registration, Token } from "@/lib/ioc/types.ts"


export class Container {

    private registry: Map<Token, Registration>

    public constructor() {
        this.registry = new Map<Token, Registration>()
    }

    public register<T>(token: Token<T>, provider: Provider<T>): void {
        this.registry.set(token, { token, provider })
    }

    public resolve<T>(token: Token<T>): T {
        if (!this.hasToken(token)) {
            const tokenName = typeof token === "function" ? token.name : String(token)
            console.log(`Resolving token: ${tokenName}`)
            throw new Error(`Token ${tokenName} not found in container`)
        }

        const registration = this.registry.get(token)!
        return this.createInstance<T>(registration)
    }

    public hasToken(token: Token): boolean {
        return this.registry.has(token)
    }

    public clear(): void {
        this.registry.clear()
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

        throw new Error(`Unsupported provider type for token ${String(registration.token)}`)
    }

    private isConstructor(func: any) {
        return func.prototype && func.prototype.constructor === func
    }
}

export const container = new Container()