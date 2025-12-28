import type { Token } from "@/lib/ioc/types.ts"
import { container } from "@/lib/ioc/container.ts"

export function Injectable(token?: Token): ClassDecorator {
    return (target: any) => {
        const tokenToUse = token || target
        container.register(tokenToUse, target)
    }
}

export function Inject(token?: Token): ParameterDecorator {
    return (target: Object, _propertyKey: (string | symbol | undefined), parameterIndex: number) => {
        const injectTokens = Reflect.getMetadata("inject:tokens", target) || []
        injectTokens[parameterIndex] = token || Reflect.getMetadata("design:paramtypes", target)[parameterIndex]

        Reflect.defineMetadata("inject:tokens", injectTokens, target)
    }
}